<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Api\Input\ConfirmRegistrationInputType;
use Application\Enum\BookingStatus;
use Application\Enum\BookingType;
use Application\Model\Account;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\BookableRepository;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\ExceptionWithoutMailLogging;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Api\Scalar\TokenType;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class ConfirmRegistration implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'confirmRegistration' => fn () => [
            'type' => Type::nonNull(Type::boolean()),
            'description' => 'Second step to register as a new user.',
            'args' => [
                'token' => Type::nonNull(_types()->get(TokenType::class)),
                'input' => Type::nonNull(_types()->get(ConfirmRegistrationInputType::class)),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): bool {
                /** @var UserRepository $repository */
                $repository = _em()->getRepository(User::class);

                /** @var null|User $user */
                $user = $repository->getAclFilter()->runWithoutAcl(fn () => $repository->findOneByToken($args['token']));

                if (!$user) {
                    throw new ExceptionWithoutMailLogging('La session a expiré ou le lien n\'est pas valable. Effectue une nouvelle demande.');
                }

                if (!$user->isTokenValid()) {
                    throw new ExceptionWithoutMailLogging('Le lien que tu as suivi est périmé. Effectue une nouvelle demande.');
                }

                $input = $args['input'];

                $repository->getAclFilter()->runWithoutAcl(function () use ($repository, $input): void {
                    if ($repository->findOneByLogin($input['login'])) {
                        throw new Exception('Ce nom d\'utilisateur est déjà attribué et ne peut être utilisé');
                    }
                });

                // Do it
                Helper::hydrate($user, $input);

                // Active the member
                $user->initialize();

                // Login
                Login::doLogin($session, $user);

                // Create account so the user can top-up money and start purchasing services
                // but only if it's head of the family
                if ($user->isFamilyOwner()) {
                    /** @var AccountRepository $accountRepository */
                    $accountRepository = _em()->getRepository(Account::class);
                    $accountRepository->getOrCreate($user);
                }

                // Create mandatory booking for him
                /** @var BookableRepository $bookableRepository */
                $bookableRepository = _em()->getRepository(Bookable::class);
                $mandatoryBookables = $bookableRepository->findByBookingType(BookingType::Mandatory);
                foreach ($mandatoryBookables as $bookable) {
                    $booking = new Booking();
                    _em()->persist($booking);

                    $booking->setOwner($user);
                    $booking->setStatus(BookingStatus::Booked);
                    $booking->setStartDate(new Chronos());
                    $booking->setBookable($bookable);

                    // Non-periodic bookable must be terminated immediately
                    if ($bookable->getPeriodicPrice()->isZero()) {
                        $booking->terminate('Terminé automatiquement parce que paiement ponctuel uniquement');
                    }
                }

                _em()->flush();

                return true;
            },
        ];
    }
}
