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
            'description' => 'Describe info to top-up the current user account by bank transfer',
            'fields' => [
                'iban' => [
                    'type' => self::nonNull(self::string()),
                    'description' => 'The IBAN of the final recipient',
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
                'qrCode' => [
                    'type' => self::string(),
                    'description' => 'URL of the generated QR code image',
                ],
                'qrBill' => [
                    'type' => self::string(),
                    'description' => 'URL of the generated PDF payment part',
                ],
            ],
        ];

        parent::__construct($config);
    }
}
