<?php

declare(strict_types=1);

namespace Application\Action;

use Application\Model\AccountingDocument;
use Application\Repository\AccountingDocumentRepository;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;
use Zend\Diactoros\Response;

class AccountingDocumentAction extends AbstractAction
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
     *
     * @param ServerRequestInterface $request
     * @param RequestHandlerInterface $handler
     *
     * @return ResponseInterface
     */
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $id = $request->getAttribute('id');

        /** @var AccountingDocument $accountingDocument */
        $accountingDocument = $this->accountingDocumentRepository->findOneById($id);
        if (!$accountingDocument) {
            return $this->createError("AccountingDocument $id not found in database");
        }

        $path = $accountingDocument->getPath();
        if (!is_readable($path)) {
            return $this->createError("File for accounting document $id not found on disk, or not readable");
        }

        $resource = fopen($path, 'r');
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
