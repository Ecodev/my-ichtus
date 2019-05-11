<?php

declare(strict_types=1);

namespace Application\Action;

use Application\Model\Account;
use Application\Model\Transaction;
use Application\Model\TransactionLine;
use Application\Model\User;
use Application\Repository\AccountRepository;
use Cake\Chronos\Chronos;
use Doctrine\ORM\EntityManager;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\Response\HtmlResponse;
use Zend\Expressive\Template\TemplateRendererInterface;

class DatatransAction extends AbstractAction
{
    /** @var TemplateRendererInterface */
    private $template;

    /**
     * @var EntityManager
     */
    private $entityManager;

    public function __construct(EntityManager $entityManager, TemplateRendererInterface $template)
    {
        $this->entityManager = $entityManager;
        $this->template = $template;
    }

    /**
     * Webhook called by datatrans when a payment was made
     *
     * See documentation: https://api-reference.datatrans.ch/#failed-unsuccessful-authorization-response
     *
     * @param ServerRequestInterface $request
     * @param RequestHandlerInterface $handler
     *
     * @return ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $request->getMethod();
        $body = $request->getParsedBody();

        try {
            if (!is_array($body)) {
                throw new \Exception('Parsed body is expected to be an array but got: ' . gettype($body));
            }

            $status = $body['status'] ?? '';

            $message = $this->dispatch($status, $body);
        } catch (\Throwable $exception) {
            $message = $this->createMessage('error', $exception->getMessage(), is_array($body) ? $body : []);
        }

        $viewModel = [
            'message' => $message,
        ];

        return new HtmlResponse($this->template->render('app::datatrans', $viewModel));
    }

    /**
     * Create a message in a coherent way
     *
     * @param string $status
     * @param string $message
     * @param array $detail
     *
     * @return array
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
     *
     * @param string $status
     * @param $body
     *
     * @return array
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
                throw new \Exception('Unsupported status in Datatrans data: ' . $status);
        }

        return $message;
    }

    private function createTransactions(array $body): void
    {
        $userId = $body['refno'] ?? null;

        /** @var User $user */
        $user = $this->entityManager->getRepository(User::class)->getOneById((int) $userId);
        if (!$user) {
            throw new \Exception('Cannot create transactions without a user');
        }

        $accountRepository = $this->entityManager->getRepository(Account::class);
        $userAccount = $accountRepository->getOrCreate($user);
        $bankAccount = $accountRepository->getOneById(AccountRepository::ACCOUNT_ID_FOR_BANK);

        if (!array_key_exists('amount', $body)) {
            // Do not support "registrations"
            throw new \Exception('Cannot create transactions without an amount');
        }

        $currency = $body['currency'] ?? '';
        if ($currency !== 'CHF') {
            throw new \Exception('Can only create transactions for CHF, but got: ' . $currency);
        }

        $now = Chronos::now();
        $datatransRef = $body['uppTransactionId'];
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
        $line->setBalance((string) ($body['amount'] / 100));
        $line->setTransaction($transaction);
        $line->setCredit($userAccount);
        $line->setDebit($bankAccount);

        $this->entityManager->flush();
    }
}
