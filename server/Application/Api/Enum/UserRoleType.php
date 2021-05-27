<?php

declare(strict_types=1);

namespace Application\Api\Enum;

use Application\Model\User;
use Ecodev\Felix\Api\Enum\EnumType;

class UserRoleType extends EnumType
{
    public function __construct()
    {
        $config = [
            User::ROLE_BOOKING_ONLY => 'Uniquement cahier de sortie (spécial)',
            User::ROLE_ACCOUNTING_VERIFICATOR => 'Vérificateur des comptes',
            User::ROLE_INDIVIDUAL => 'Individu',
            User::ROLE_MEMBER => 'Membre',
            User::ROLE_TRAINER => 'Formateur',
            User::ROLE_FORMATION_RESPONSIBLE => 'Responsable de cours',
            User::ROLE_RESPONSIBLE => 'Responsable de secteur',
            User::ROLE_ADMINISTRATOR => 'Administrateur',
        ];

        parent::__construct($config);
    }
}
