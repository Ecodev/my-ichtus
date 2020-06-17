<?php

declare(strict_types=1);

namespace ApplicationTest\Action;

use Application\Action\DatatransAction;
use Application\Model\User;
use ApplicationTest\Traits\TestWithTransactionAndUser;
use Laminas\Diactoros\ServerRequest;
use Mezzio\Template\TemplateRendererInterface;
use Money\Money;
use PHPUnit\Framework\TestCase;
use Psr\Http\Server\RequestHandlerInterface;

class DatatransActionTest extends TestCase
{
    use TestWithTransactionAndUser;

    /**
     * @dataProvider providerProcess
     */
    public function testProcess(?array $data, ?int $accountId, Money $expectedAmount, array $expectedViewModel): void
    {
        $userId = $data['refno'] ?? null;
        $user = $this->getEntityManager()->getRepository(User::class)->getOneById((int) $userId);
        User::setCurrent($user);

        // Message always include input data
        $expectedViewModel['message']['detail'] = $data ?? [];
        $renderer = $this->createMock(TemplateRendererInterface::class);
        $renderer->expects(self::atLeastOnce())->method('render')->with('app::datatrans', $expectedViewModel)->willReturn('');

        $handler = $this->createMock(RequestHandlerInterface::class);

        $request = new ServerRequest();
        $request = $request->withParsedBody($data);

        $config = [
            'key' => '1a03b7bcf2752c8c8a1b46616b0c12658d2c7643403e655450bedb7c78bb2d2f659c2ff4e647e4ea72d37ef6745ebda6733c7b859439107069f291cda98f4844',
        ];

        $action = new DatatransAction($this->getEntityManager(), $renderer, $config);
        $action->process($request, $handler);

        // Submit the same request again to make sure it is accounted only once
        $action->process($request, $handler);

        if ($accountId) {
            $actualBalance = $this->getEntityManager()->getConnection()->fetchColumn('SELECT balance FROM account WHERE id = ' . $accountId);
            self::assertSame($expectedAmount->getAmount(), $actualBalance);
        }

        self::assertTrue(true); // Workaround when we only assert via prophesize
    }

    public function providerProcess(): array
    {
        return [
            'normal' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'e591bc45430b1a14ad7e1a3a14a8218fb9a5ae944557c96366ec98feae6b17f4',
                ],
                10096,
                Money::CHF(15000),
                [
                    'message' => [
                        'status' => 'success',
                        'message' => 'Payment was successful',
                    ],
                ],
            ],
            'duplicate' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'e591bc45430b1a14ad7e1a3a14a8218fb9a5ae944557c96366ec98feae6b17f4',
                ],
                10096,
                Money::CHF(15000),
                [
                    'message' => [
                        'status' => 'success',
                        'message' => 'Payment was successful',
                    ],
                ],
            ],
            'invalid HMAC signature' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0a0',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Invalid HMAC signature',
                    ],
                ],
            ],
            'missing HMAC signature' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Missing HMAC signature',
                    ],
                ],
            ],
            'user without account yet' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '1008',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => '3005b015945fb625ee25d7d804a65cc17f9dacd4fcba72329d34c8081230c146',
                ],
                10096,
                Money::CHF(15000),
                [
                    'message' => [
                        'status' => 'success',
                        'message' => 'Payment was successful',
                    ],
                ],
            ],
            'error' => [
                [
                    'uppTransactionId' => '876543210987654321',
                    'status' => 'error',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'errorMessage' => 'Dear Sir/Madam, Fire! fire! help me! All the best, Maurice Moss.',
                    'sign' => '38151b15a4c680cccafe9dfff6edb236fa9bf1eeec65799b2720312ae9c4b233',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Dear Sir/Madam, Fire! fire! help me! All the best, Maurice Moss.',
                    ],
                ],
            ],
            'cancel' => [
                [
                    'uppTransactionId' => '876543210987654321',
                    'status' => 'cancel',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'sign' => '38151b15a4c680cccafe9dfff6edb236fa9bf1eeec65799b2720312ae9c4b233',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'cancel',
                        'message' => 'Cancelled',
                    ],
                ],
            ],
            'invalid body' => [
                null,
                null,
                Money::CHF(0),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Parsed body is expected to be an array but got: NULL',
                    ],
                ],
            ],
            'invalid status' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'non-existing-status',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'e591bc45430b1a14ad7e1a3a14a8218fb9a5ae944557c96366ec98feae6b17f4',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Unsupported status in Datatrans data: non-existing-status',
                    ],
                ],
            ],
            'non-existing user' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'f875347d4c66a4f82717ae88f13812289db79b4c1cab4df4fe1c7fdbaaacff05',
                ],
                null,
                Money::CHF(0),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Cannot create transactions without a user',
                    ],
                ],
            ],
            'non-existing amount' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'merchantId' => '123456789',
                    'refno' => '1007',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'e2ca709347d5bec5fd169cd3e1243a95d2eae0abf23a34e26e57698d30b3645d',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Cannot create transactions without an amount',
                    ],
                ],
            ],
            'invalid currency' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '1007',
                    'merchantId' => '123456789',
                    'amount' => '10000',
                    'currency' => 'USD',
                    'responseMessage' => 'Payment was successful',
                    'sign' => 'a591b4bb76872f8fcb01f841e4b0cf092ae7c26561e93326243d7f48a9181849',
                ],
                10096,
                Money::CHF(5000),
                [
                    'message' => [
                        'status' => 'error',
                        'message' => 'Can only create transactions for CHF, but got: USD',
                    ],
                ],
            ],
        ];
    }
}
