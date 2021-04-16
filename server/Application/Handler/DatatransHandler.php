<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Application\Repository\LogRepository;
use Application\Repository\UserRepository;
use Cake\Chronos\Chronos;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Handler\AbstractHandler;
use Exception;
use Laminas\Diactoros\Response\HtmlResponse;
use Mezzio\Template\TemplateRendererInterface;
use Money\Money;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Throwable;

class DatatransHandler extends AbstractHandler
{
    /**
     * @var TemplateRendererInterface
     */
    private $template;

    /**
     * @var EntityManager
     */
    private $entityManager;

    /**
     * @var array
     */
    private $config;

    /**
     * DatatransAction constructor.
     */
    public function __construct(EntityManager $entityManager, TemplateRendererInterface $template, array $config)
    {
        $this->entityManager = $entityManager;
        $this->template = $template;
        $this->config = $config;
    }

    /**
     * Webhook called by datatrans when a payment was made
     *
     * See documentation: https://api-reference.datatrans.ch/#failed-unsuccessful-authorization-response
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $body = $request->getParsedBody();
        $extraToLog = is_array($body) ? $body : ['rawBody' => $request->getBody()->getContents()];

        _log()->info(LogRepository::DATATRANS_WEBHOOK_BEGIN, $extraToLog);

        try {
            if (!is_array($body)) {
                throw new Exception('Parsed body is expected to be an array but got: ' . gettype($body));
            }

            if (isset($this->config['datatrans'], $this->config['datatrans']['key'])) {
                $this->checkSignature($body, $this->config['datatrans']['key']);
            }

            $status = $body['status'] ?? '';

            $message = $this->dispatch($status, $body);
        } catch (Throwable $exception) {
            /** @phpstan-ignore-next-line */
            $message = $this->createMessage('error', $exception->getMessage(), is_array($body) ? $body : []);
        }

        $viewModel = [
            'message' => $message,
        ];

        _log()->info(LogRepository::DATATRANS_WEBHOOK_END, $message);

        return new HtmlResponse($this->template->render('app::datatrans', $viewModel));
    }

    /**
     * Make sure the signature protecting important body fields is valid
     *
     * @param string $key HMAC-SHA256 signing key in hexadecimal format
     */
    private function checkSignature(array $body, string $key): void
    {
        if (!isset($body['sign'])) {
            throw new Exception('Missing HMAC signature');
        }
        $aliasCC = $body['aliasCC'] ?? '';
        $valueToSign = $aliasCC . @$body['merchantId'] . @$body['amount'] . @$body['currency'] . @$body['refno'];
        $expectedSign = hash_hmac('sha256', trim($valueToSign), hex2bin(trim($key)));
        if ($expectedSign !== $body['sign']) {
            throw new Exception('Invalid HMAC signature');
        }
    }

    /**
     * Create a message in a coherent way
     */
    private function createMessage(string $status, string $message, array $detail): array
    {
        return [
            'status' => $status,
            'message' => $message,
            'detail' => $detail,
        ];
    }

    /**
     * Dispatch the data received from Datatrans to take appropriate actions
     */
    private function dispatch(string $status, array $body): array
    {
        switch ($status) {
            case 'success':
                $this->createTransactions($body);
                $message = $this->createMessage($status, $body['responseMessage'], $body);

                break;
            case 'error':
                $message = $this->createMessage($status, $body['errorMessage'], $body);

                break;
            case 'cancel':
                $message = $this->createMessage($status, 'Cancelled', $body);

                break;
            default:
                throw new Exception('Unsupported status in Datatrans data: ' . $status);
        }

        return $message;
    }

    private function createTransactions(array $body): void
    {
        // Create only if a transaction with the same Datatrans reference doesn't already exist
        $datatransRef = $body['uppTransactionId'];
        $transactionRepository = $this->entityManager->getRepository(Transaction::class);
        $existing = $transactionRepository->count(['datatransRef' => $datatransRef]);

        if ($existing) {
            return;
        }

        $userId = $body['refno'] ?? null;

        /** @var UserRepository $userRepository */
        $userRepository = $this->entityManager->getRepository(User::class);
        $user = $userRepository->getOneById((int) $userId);
        if (!$user) {
            throw new Exception('Cannot create transactions without a user');
        }

        /** @var AccountRepository $accountRepository */
        $accountRepository = $this->entityManager->getRepository(Account::class);
        $userAccount = $accountRepository->getOrCreate($user);
        if (!isset($this->config['accounting'], $this->config['accounting']['bankAccountCode'])) {
            throw new Exception('Missing config accounting/bankAccountCode');
        }
        $bankAccountCode = $this->config['accounting']['bankAccountCode'];
        $bankAccount = $accountRepository->getAclFilter()->runWithoutAcl(function () use ($accountRepository, $bankAccountCode) {
            return $accountRepository->findOneByCode($bankAccountCode);
        });

        if (!array_key_exists('amount', $body)) {
            // Do not support "registrations"
            throw new Exception('Cannot create transactions without an amount');
        }

        $currency = $body['currency'] ?? '';
        if ($currency !== 'CHF') {
            throw new Exception('Can only create transactions for CHF, but got: ' . $currency);
        }

        $now = Chronos::now();
        $name = 'Versement en ligne';

        $transaction = new Transaction();
        $this->entityManager->persist($transaction);
        $transaction->setName($name);
        $transaction->setTransactionDate($now);
        $transaction->setDatatransRef($datatransRef);

        // This could be removed later on. For now it's mostly for debugging
        $transaction->setInternalRemarks(json_encode($body, JSON_PRETTY_PRINT));

        $line = new TransactionLine();
        $this->entityManager->persist($line);
        $line->setName($name);
        $line->setTransactionDate($now);
        $line->setBalance(Money::CHF($body['amount']));
        $line->setTransaction($transaction);
        $line->setCredit($userAccount);
        $line->setDebit($bankAccount);

        $this->entityManager->flush();
    }
}
