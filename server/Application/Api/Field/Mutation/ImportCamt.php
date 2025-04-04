<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Helper;
use Application\Model\Transaction;
use Application\Service\Importer;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use GraphQL\Upload\UploadType;
use Mezzio\Session\SessionInterface;
use Psr\Http\Message\UploadedFileInterface;

abstract class ImportCamt implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'importCamt' => fn () => [
            'type' => Type::nonNull(Type::listOf(Type::nonNull(_types()->getOutput(Transaction::class)))),
            'description' => 'Import a CAMT file containing BVR transactions',
            'args' => [
                'file' => Type::nonNull(_types()->get(UploadType::class)),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): array {
                // Check ACL
                $fakeTransaction = new Transaction();
                Helper::throwIfDenied($fakeTransaction, 'create');

                /** @var UploadedFileInterface $file */
                $file = $args['file'];

                // Move file to tmp dir
                $dir = 'data/tmp/camt';
                @mkdir($dir);
                $path = $dir . '/' . uniqid() . '.xml';
                $file->moveTo($path);

                // Do the thing
                $importer = new Importer();
                $transactions = $importer->import($path);

                _em()->getRepository(Transaction::class)->flushWithFastTransactionLineTriggers();

                return $transactions;
            },
        ];
    }
}
