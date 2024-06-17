<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Model\Booking;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Mezzio\Session\SessionInterface;

abstract class TerminateBooking implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'terminateBooking' => fn () => [
            'type' => Type::nonNull(_types()->getOutput(Booking::class)),
            'description' => 'Terminate a booking',
            'args' => [
                'id' => Type::nonNull(_types()->getId(Booking::class)),
                'comment' => Type::string(),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): Booking {
                /** @var Booking $booking */
                $booking = $args['id']->getEntity();

                // Check ACL
                Helper::throwIfDenied($booking, 'update');

                $booking->terminate($args['comment'] ?? null);
                _em()->flush();

                return $booking;
            },
        ];
    }
}
