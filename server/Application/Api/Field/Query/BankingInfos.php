<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Api\Field\FieldInterface;
use Application\Model\User;
use Application\Service\Bvr;
use GraphQL\Type\Definition\Type;

abstract class BankingInfos implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'bankingInfos',
                'type' => Type::nonNull(_types()->get('BankingInfos')),
                'description' => 'Represents currently logged-in user',
                'args' => [
                    'user' => Type::nonNull(_types()->getId(User::class)),
                    'amount' => _types()->get('Money'),
                ],
                'resolve' => function ($root, array $args): array {
                    global $container;
                    $config = $container->get('config')['banking'];
                    $bankAccount = $config['bankAccount'];
                    $postAccount = $config['postAccount'];
                    $paymentTo = $config['paymentTo'];
                    $paymentFor = $config['paymentFor'];

                    $userId = $args['user']->getId();
                    $amount = $args['amount'] ?? null;

                    $referenceNumber = Bvr::getReferenceNumber($bankAccount, $userId);
                    $encodingLine = Bvr::getEncodingLine($bankAccount, $userId, $postAccount, $amount);

                    return [
                        'postAccount' => $postAccount,
                        'paymentTo' => $paymentTo,
                        'paymentFor' => $paymentFor,
                        'referenceNumber' => $referenceNumber,
                        'encodingLine' => $encodingLine,
                    ];
                },
            ];
    }
}
