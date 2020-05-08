<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Repository\ConfigurationRepository;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;

abstract class Configuration implements FieldInterface
{
    public static function build(): array
    {
        return
            [
                'name' => 'configuration',
                'type' => Type::nonNull(Type::string()),
                'description' => 'Return configuration value for given key. The value might be any format (HTML, JSON, text) as defined by client',
                'args' => [
                    'key' => Type::nonNull(Type::string()),
                ],
                'resolve' => function ($root, array $args): string {
                    $key = $args['key'];

                    /** @var ConfigurationRepository $configurationRepository */
                    $configurationRepository = _em()->getRepository(\Application\Model\Configuration::class);
                    $configuration = $configurationRepository->getOrCreate($key);

                    return $configuration->getValue();
                },
            ];
    }
}
