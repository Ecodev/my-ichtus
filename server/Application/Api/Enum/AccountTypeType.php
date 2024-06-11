<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Ecodev\Felix\Api\Enum\EnumType;

class AccountTypeType extends EnumType
{
    public function __construct()
    {
        $config = [
            \Application\DBAL\Types\AccountTypeType::ASSET => 'Actif',
            \Application\DBAL\Types\AccountTypeType::LIABILITY => 'Passif',
            \Application\DBAL\Types\AccountTypeType::REVENUE => 'Produit',
            \Application\DBAL\Types\AccountTypeType::EXPENSE => 'Charge',
            \Application\DBAL\Types\AccountTypeType::EQUITY => 'Résultat',
            \Application\DBAL\Types\AccountTypeType::GROUP => 'Groupe',
        ];

        parent::__construct($config);
    }
}
