<?php

declare(strict_types=1);

namespace ApplicationTest\Action;

use Application\Action\DatatransAction;
use Application\Model\User;
use ApplicationTest\Traits\TestWithTransaction;
use PHPUnit\Framework\TestCase;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\ServerRequest;
use Zend\Expressive\Template\TemplateRendererInterface;

class DatatransActionTest extends TestCase
{
    use TestWithTransaction;

    /**
     * @dataProvider providerProcess
     */
    public function testProcess(?array $data, string $expectedAmount, array $expectedViewModel): void
    {
        $userId = $data['refno'] ?? null;
        $user = $this->getEntityManager()->getRepository(User::class)->getOneById((int) $userId);
        User::setCurrent($user);

        // Message always include input data
        $expectedViewModel['message']['detail'] = $data;
        $renderer = $this->prophesize(TemplateRendererInterface::class);
        $renderer->render('app::datatrans', $expectedViewModel);

        $handler = $this->prophesize(RequestHandlerInterface::class);

        $request = new ServerRequest();
        $request = $request->withParsedBody($data);

        $action = new DatatransAction($this->getEntityManager(), $renderer->reveal());
        $action->process($request, $handler->reveal());

        if ($userId) {
            $actualBalance = $this->getEntityManager()->getConnection()->fetchColumn('SELECT balance FROM account WHERE owner_id = ' . $userId);
            self::assertSame($expectedAmount, $actualBalance);
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
                    'refno' => '-1007',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                ],
                '100.00',
                [
                    'message' => [
                        'status' => 'success',
                        'message' => 'Payment was successful',
                    ],
                ],
            ],
            'user without account yet' => [
                [
                    'uppTransactionId' => '123456789012345678',
                    'status' => 'success',
                    'refno' => '-1008',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                ],
                '100.00',
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
                    'refno' => '-1007',
                    'errorMessage' => 'Dear Sir/Madam, Fire! fire! help me! All the best, Maurice Moss.',
                ],
                '0.00',
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
                    'refno' => '-1007',
                ],
                '0.00',
                [
                    'message' => [
                        'status' => 'cancel',
                        'message' => 'Cancelled',
                    ],
                ],
            ],
            'invalid body' => [
                null,
                '0.00',
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
                    'refno' => '-1007',
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                ],
                '0.00',
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
                    'amount' => '10000',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                ],
                '0.00',
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
                    'refno' => '-1007',
                    'currency' => 'CHF',
                    'responseMessage' => 'Payment was successful',
                ],
                '0.00',
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
                    'refno' => '-1007',
                    'amount' => '10000',
                    'currency' => 'USD',
                    'responseMessage' => 'Payment was successful',
                ],
                '0.00',
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
