<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Exception;
use Application\Api\Field\FieldInterface;
use Application\Api\Helper;
use Application\DBAL\Types\BookingStatusType;
use Application\DBAL\Types\BookingTypeType;
use Application\Model\Bookable;
use Application\Model\Booking;
use Application\Model\User;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use GraphQL\Type\Definition\Type;
use Zend\Expressive\Session\SessionInterface;

abstract class ConfirmRegistration implements FieldInterface
{
    public static function build(): array
    {
        return [
            'name' => 'confirmRegistration',
            'type' => Type::nonNull(Type::boolean()),
            'description' => 'First step to register as a new user.',
            'args' => [
                'token' => Type::nonNull(_types()->get('Token')),
                'input' => Type::nonNull(_types()->get('ConfirmRegistrationInput')),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): bool {

                /** @var UserRepository $repository */
                $repository = _em()->getRepository(User::class);

                /** @var User $user */
                $repository->getAclFilter()->setEnabled(false);
                $user = $repository->findOneByToken($args['token']);
                $repository->getAclFilter()->setEnabled(true);

                if (!$user || !$user->isTokenValid()) {
                    throw new Exception('Cannot confirm registration with an invalid token');
                }

                // Do it
                $input = $args['input'];
                Helper::hydrate($user, $input);

                // Active the member
                $user->initialize();

                // Create mandatory booking for him
                User::setCurrent($user);

                $mandatoryBookables = _em()->getRepository(Bookable::class)->findByBookingType(BookingTypeType::MANDATORY);
                foreach ($mandatoryBookables as $bookable) {
                    $booking = new Booking();
                    _em()->persist($booking);

                    $booking->setOwner($user);
                    $booking->setStatus(BookingStatusType::BOOKED);
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
