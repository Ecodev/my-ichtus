<?php

declare(strict_types=1);

namespace ApplicationTest\Api;

use Application\Api\Server;
use Application\Model\User;
use ApplicationTest\Traits\TestWithTransaction;
use GraphQL\Executor\ExecutionResult;
use Laminas\Diactoros\ServerRequest;
use Mezzio\Session\Session;
use Mezzio\Session\SessionMiddleware;
use PHPUnit\Framework\TestCase;

class ServerTest extends TestCase
{
    use TestWithTransaction;

    /**
     * @dataProvider providerQuery
     *
     * @param null|string $user
     * @param ServerRequest $request
     * @param array $expected
     * @param null|callable $dataPreparator
     */
    public function testQuery(?string $user, ServerRequest $request, array $expected, ?callable $dataPreparator = null): void
    {
        User::setCurrent($this->getEntityManager()->getRepository(User::class)->getOneByLogin($user));

        if ($dataPreparator) {
            $dataPreparator($this->getEntityManager()->getConnection());
        }

        // Use this flag to easily debug API test issues
        /** @var bool $debug */
        $debug = false;

        // Configure server
        $server = new Server($debug);

        // Execute query
        $result = $server->execute($request);

        $actual = $this->resultToArray($result, $debug);

        if ($debug) {
            ve($actual);
            unset($actual['errors'][0]['trace']);
        }

        self::assertEquals($expected, $actual);
    }

    public function providerQuery(): array
    {
        $data = [];
        foreach (glob('tests/data/query/*.php') as $file) {
            $name = str_replace('-', ' ', basename($file, '.php'));
            $user = preg_replace('/\d/', '', explode(' ', $name)[0]);
            if ($user === 'anonymous') {
                $user = null;
            }

            $args = require $file;

            // Convert arg into request
            $request = new ServerRequest();
            $args[0] = $request
                ->withParsedBody($args[0])
                ->withAttribute(SessionMiddleware::SESSION_ATTRIBUTE, new Session([]))
                ->withMethod('POST')
                ->withHeader('content-type', ['application/json']);

            array_unshift($args, $user);
            $data[$name] = $args;
        }

        return $data;
    }

    /**
     * @param ExecutionResult|ExecutionResult[] $result
     * @param bool $debug
     *
     * @return array
     */
    private function resultToArray($result, bool $debug): array
    {
        $isSingle = !is_array($result);
        if ($isSingle) {
            $result = [$result];
        }

        foreach ($result as &$one) {
            $one = $one->toArray();
            if ($debug) {
                ve($one);
                unset($one['errors'][0]['trace']);
            }
        }

        if ($isSingle) {
            $result = reset($result);
        }

        return $result;
    }
}
