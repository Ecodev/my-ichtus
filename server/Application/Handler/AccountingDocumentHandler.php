<?php

declare(strict_types=1);

namespace Application\Handler;

use Application\Model\AccountingDocument;
use Application\Repository\AccountingDocumentRepository;
use Ecodev\Felix\Handler\AbstractHandler;
use Laminas\Diactoros\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class AccountingDocumentHandler extends AbstractHandler
{
    /**
     * @var AccountingDocumentRepository
     */
    private $accountingDocumentRepository;

    public function __construct(AccountingDocumentRepository $accountingDocumentRepository)
    {
        $this->accountingDocumentRepository = $accountingDocumentRepository;
    }

    /**
     * Serve a downloaded file from disk
     */
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        $id = $request->getAttribute('id');

        /** @var null|AccountingDocument $accountingDocument */
        $accountingDocument = $this->accountingDocumentRepository->findOneById($id);
        if (!$accountingDocument) {
            return $this->createError("AccountingDocument $id not found in database");
        }

        $path = $accountingDocument->getPath();
        if (!is_readable($path)) {
            return $this->createError("File for accounting document $id not found on disk, or not readable");
        }

        $resource = fopen($path, 'rb');
        if ($resource === false) {
            return $this->createError("Cannot open file for accounting document $id on disk");
        }
        $size = filesize($path);
        $type = mime_content_type($path);
        $ext = pathinfo($path, PATHINFO_EXTENSION);
        $response = new Response($resource, 200, [
            'content-type' => $type,
            'content-length' => $size,
            'content-disposition' => 'attachment; filename=' . $id . '.' . $ext,
        ]);

        return $response;
    }
}
