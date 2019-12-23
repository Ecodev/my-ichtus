<?php

declare(strict_types=1);

namespace ApplicationTest\Api;

use Application\Api\DefaultFieldResolver;
use Application\Api\Schema;
use Application\Model\User;
use Doctrine\ORM\EntityNotFoundException;
use Doctrine\Persistence\Proxy;
use GraphQL\Type\Definition\ObjectType;
use GraphQL\Type\Definition\ResolveInfo;
use GraphQL\Type\Definition\Type;
use PHPUnit\Framework\TestCase;
use stdClass;

class DefaultFieldResolverTest extends TestCase
{
    public function providerLoad(): array
    {
        $loadableClass = new class() implements Proxy {
            public function __load(): void
            {
            }

            public function __isInitialized(): bool
            {
                return true;
            }
        };

        $unLoadableClass = new class() implements Proxy {
            public function __load(): void
            {
                throw new EntityNotFoundException();
            }

            public function __isInitialized(): bool
            {
                return true;
            }
        };

        $object = new stdClass();
        $user = new User();
        $loadable = new $loadableClass();
        $unloadable = new $unLoadableClass();

        return [
            [null, null],
            [1, 1],
            ['foo', 'foo'],
            [$object, $object],
            [$user, $user],
            [$loadable, $loadable],
            [$unloadable, null],
        ];
    }

    /**
     * @dataProvider providerLoad
     *
     * @param mixed $value
     * @param mixed $expected
     */
    public function testLoad($value, $expected): void
    {
        $model = new class($value) {
            private $value;

            public function __construct($value)
            {
                $this->value = $value;
            }

            public function getField()
            {
                return $this->value;
            }
        };

        $resolve = new ResolveInfo('field', [], Type::boolean(), new ObjectType(['name' => 'foo']), [], new Schema(), [], null, null, []);
        $resolver = new DefaultFieldResolver();
        self::assertSame($expected, $resolver($model, [], [], $resolve));
    }
}
