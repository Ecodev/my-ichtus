<?php

declare(strict_types=1);

namespace Application\Api;

use Doctrine\ORM\EntityManager;
use GraphQL\Doctrine\Types;
use Laminas\ServiceManager\ServiceManager;
use Psr\Container\ContainerInterface;

class TypesFactory
{
    public function __invoke(ContainerInterface $container): Types
    {
        $entityManager = $container->get(EntityManager::class);

        $invokables = [
            \Application\Api\Enum\UserStatusType::class,
            \Application\Api\Enum\UserRoleType::class,
            \Application\Api\Enum\BookableStateType::class,
            \Application\Api\Enum\BookingStatusType::class,
            \Application\Api\Enum\BookingTypeType::class,
            \Application\Api\Enum\SexType::class,
            \Application\Api\Enum\RelationshipType::class,
            \Application\Api\Enum\BillingTypeType::class,
            \Application\Api\Enum\DoorType::class,
            \Application\Api\Enum\ExpenseClaimStatusType::class,
            \Application\Api\Enum\ExpenseClaimTypeType::class,
            \Application\Api\Enum\MessageTypeType::class,
            \Application\Api\Enum\AccountTypeType::class,
            \Application\Api\Enum\SwissSailingTypeType::class,
            \Application\Api\Enum\SwissWindsurfTypeType::class,
            \Application\Api\Input\ConfirmRegistrationInputType::class,
            \Ecodev\Felix\Api\Input\PaginationInputType::class,
            \Application\Api\MutationType::class,
            \Application\Api\Output\AllPermissionsType::class,
            \Application\Api\Output\BankingInfosType::class,
            \Application\Api\Output\CrudPermissionsListType::class,
            \Application\Api\Output\CrudPermissionsType::class,
            \Application\Api\Output\OpenDoorType::class,
            \Ecodev\Felix\Api\Output\PermissionsType::class,
            \Application\Api\QueryType::class,
            \Ecodev\Felix\Api\Scalar\ColorType::class,
            \Ecodev\Felix\Api\Scalar\ChronosType::class,
            \Ecodev\Felix\Api\Scalar\DateType::class,
            \Application\Api\Scalar\MoneyType::class,
            \Ecodev\Felix\Api\Scalar\EmailType::class,
            \Ecodev\Felix\Api\Scalar\LoginType::class,
            \Ecodev\Felix\Api\Scalar\PasswordType::class,
            \Ecodev\Felix\Api\Scalar\TokenType::class,
            \Ecodev\Felix\Api\Scalar\UrlType::class,
            \GraphQL\Upload\UploadType::class,
        ];

        $invokables = array_combine($invokables, $invokables);

        $aliases = [
            \Cake\Chronos\Chronos::class => \Ecodev\Felix\Api\Scalar\ChronosType::class,
            \Cake\Chronos\ChronosDate::class => \Ecodev\Felix\Api\Scalar\DateType::class,
            'datetime' => \Ecodev\Felix\Api\Scalar\ChronosType::class,
            'date' => \Ecodev\Felix\Api\Scalar\DateType::class,
            \Psr\Http\Message\UploadedFileInterface::class => \GraphQL\Upload\UploadType::class,
            'UploadedFileInterface' => \GraphQL\Upload\UploadType::class,
            'Money' => \Application\Api\Scalar\MoneyType::class,
            \Money\Money::class => \Application\Api\Scalar\MoneyType::class,
        ];

        // Automatically add aliases for GraphQL type name from the invokable types
        foreach ($invokables as $type) {
            $parts = explode('\\', $type);
            $alias = preg_replace('~Type$~', '', end($parts));
            $aliases[$alias] = $type;
        }

        $customTypes = new ServiceManager([
            'invokables' => $invokables,
            'aliases' => $aliases,
            'services' => [
                // This is not quite right because it allow to compare a string with a json array.
                // TODO: either hide the json_array filter or find a cleaner solution
                'json' => \GraphQL\Type\Definition\Type::string(),
            ],
            'abstract_factories' => [
                \Application\Api\Output\PaginationTypeFactory::class,
            ],
        ]);

        $types = new Types($entityManager, $customTypes);

        return $types;
    }
}
