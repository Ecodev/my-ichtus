<?php

declare(strict_types=1);

namespace Application\Api\Field\Query;

use Application\Api\Output\BankingInfosType;
use Application\Api\Scalar\MoneyType;
use Application\Model\User;
use Ecodev\Felix\Api\Field\FieldInterface;
use Ecodev\Felix\Service\Bvr;
use GraphQL\Type\Definition\Type;
use Laminas\Http\Client;
use Laminas\Http\Client\Exception\RuntimeException;
use Laminas\Http\Request;
use Laminas\Http\Response;
use Money\Money;

abstract class BankingInfos implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'bankingInfos' => fn () => [
            'type' => Type::nonNull(_types()->get(BankingInfosType::class)),
            'description' => 'Info to top-up the current user account by bank transfer',
            'args' => [
                'user' => Type::nonNull(_types()->getId(User::class)),
                'amount' => _types()->get(MoneyType::class),
            ],
            'resolve' => function ($root, array $args): array {
                global $container;
                $config = $container->get('config');
                $banking = $config['banking'];
                $iban = $banking['iban'];
                $paymentTo = $banking['paymentTo'];
                $paymentFor = $banking['paymentFor'];

                $user = $args['user']->getEntity();
                $amount = $args['amount'] ?? null;

                $referenceNumber = Bvr::getReferenceNumber('000000', (string) $user->getId());

                $result = [
                    'iban' => $iban,
                    'paymentTo' => $paymentTo,
                    'paymentFor' => $paymentFor['name'] . PHP_EOL . $paymentFor['postalCode'] . ' ' . $paymentFor['city'],
                    'referenceNumber' => $referenceNumber,
                ];

                $qrCodeField = self::qrBill($user, $amount, $iban, $paymentFor, false);
                $qrBillField = self::qrBill($user, $amount, $iban, $paymentFor, true);
                $result = array_merge($result, $qrCodeField, $qrBillField);

                return $result;
            },
        ];
    }

    /**
     * Lazy resolve qrBill or qrCode fields for banking infos query.
     */
    protected static function qrBill(User $user, ?Money $amount, string $iban, array $paymentFor, bool $paymentPart): array
    {
        $resolve = function () use ($user, $amount, $iban, $paymentFor, $paymentPart): ?string {
            global $container;

            if (!Bvr::isQrIban($iban)) {
                return null;
            }

            $config = $container->get('config');
            $request = new Request();
            $request->setUri('https://qrbill.ecodev.ch/qr-code');
            $request->getHeaders()->addHeaders([
                'Content-Type' => 'application/json',
                'Accept' => $paymentPart ? 'application/json application/pdf' : 'application/json image/svg+xml',
                'Referer' => 'https://' . $config['hostname'],
            ]);
            $request->setMethod(Request::METHOD_POST);

            $creditor = [
                'name' => $paymentFor['name'],
                'street' => $paymentFor['street'],
                'postalCode' => $paymentFor['postalCode'],
                'city' => $paymentFor['city'],
            ];

            $attrs = [
                'creditor' => $creditor,
                'customerIdentification' => null,
                'referenceNumber' => (string) $user->getId(),
                'iban' => $iban,
                'amount' => $amount,
            ];

            if (!empty($user->getPostcode()) && !empty($user->getLocality())) {
                $debtor = [
                    'name' => $user->getName(),
                    'street' => $user->getStreet(),
                    'postalCode' => $user->getPostcode(),
                    'city' => $user->getLocality(),
                ];
                $attrs['ultimateDebtor'] = $debtor;
            }

            $request->setContent(json_encode($attrs));
            $client = new Client();

            try {
                /** @var Response $response */
                $response = $client->dispatch($request);
                if (!$response->isSuccess()) {
                    _log()->error('Erreur de génération du QR code: ' . $response->getStatusCode() . ' ' . $response->getReasonPhrase());

                    return null;
                }
            } catch (RuntimeException $e) {
                _log()->error($e->getMessage(), $attrs);

                return null;
            }

            $content = json_decode($response->getBody());

            return $content->qrcode;
        };

        return [
            $paymentPart ? 'qrBill' : 'qrCode' => $resolve,
        ];
    }
}
