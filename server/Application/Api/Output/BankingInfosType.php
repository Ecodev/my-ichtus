<?php

declare(strict_types=1);

namespace Application\Api\Output;

use GraphQL\Type\Definition\ObjectType;

class BankingInfosType extends ObjectType
{
    public function __construct()
    {
        $config = [
            'name' => 'BankingInfos',
            'description' => 'Describe permissions for current user',
            'fields' => [
                'postAccount' => [
                    'type' => self::nonNull(self::string()),
                    'description' => 'The post account number',
                ],
                'paymentTo' => [
                    'type' => self::nonNull(self::string()),
                    'description' => 'Bank coordinate the payment will be made to, eg: \'Great Bank, Cayman Islands\'',
                ],
                'paymentFor' => [
                    'type' => self::nonNull(self::string()),
                    'description' => 'Final recipient of payment, eg: \'John Doe, Main street 7, Sydney\'',
                ],
                'referenceNumber' => [
                    'type' => self::nonNull(self::string()),
                    'description' => 'The BVR reference number',
                ],
                'encodingLine' => [
                    'type' => self::nonNull(self::string()),
                    'description' => 'The BVR encoding line that include account number and may include amount if given',
                ],
            ],
        ];

        parent::__construct($config);
    }
}
