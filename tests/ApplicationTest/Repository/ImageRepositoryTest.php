<?php

declare(strict_types=1);

namespace ApplicationTest\Repository;

use Application\Model\Bookable;
use Application\Model\Image;
use Application\Repository\ImageRepository;
use Ecodev\Felix\Service\AbstractDatabase;

/**
 * @group Repository
 */
class ImageRepositoryTest extends AbstractRepositoryTest
{
    /**
     * @var ImageRepository
     */
    private $repository;

    public function setUp(): void
    {
        parent::setUp();
        $this->repository = $this->getEntityManager()->getRepository(Image::class);
    }

    public function tearDown(): void
    {
        // Restore all images that might have been deleted
        AbstractDatabase::executeLocalCommand('git checkout -- data/images/');
        parent::tearDown();
    }

    public function testImageOnDiskIsDeletedWhenRecordInDbIsDeleted(): void
    {
        $image = new Image();

        $image->setFilename('test image.jpg');
        $this->getEntityManager()->persist($image);
        $this->getEntityManager()->flush();

        $path = $image->getPath();
        touch($path);
        self::assertFileExists($path, 'test file must exist, because we just touch()ed it');

        $this->getEntityManager()->remove($image);
        $this->getEntityManager()->flush();
        self::assertFileDoesNotExist($path, 'test file must have been deleted when record was deleted');
    }

    public function testDoctrineDoesNotFuckUpAndDeleteImageFromUnrelatedBookable(): void
    {
        // Make one image usable
        $this->getEntityManager()->getConnection()->update('bookable', ['image_id' => null], ['image_id' => 5007]);

        $paths = [
            'data/images/chat1.jpg',
            'data/images/chat2.jpg',
            'data/images/chat3.jpg',
            'data/images/chat4.jpg',
            'data/images/chat5.jpg',
            'data/images/chat6.jpg',
            'data/images/chat7.jpg',
            'data/images/chat8.jpg',
        ];

        // All images must exist before testing
        foreach ($paths as $p) {
            self::assertFileExists($p);
        }

        // Image that will be orphaned must exist in DB
        $imageToBeOrphanedQuery = 'SELECT COUNT(*) FROM image WHERE id = 5000';
        self::assertSame('1', $this->getEntityManager()->getConnection()->fetchColumn($imageToBeOrphanedQuery));

        // Affect existing image to an existing bookable
        $bookable = $this->getEntityManager()->find(Bookable::class, 3000);
        $image = $this->getEntityManager()->find(Image::class, 5007);
        self::assertNotNull($image);
        $bookable->setImage($image);
        self::assertSame($image, $bookable->getImage(), 'should get image that was set');
        $this->getEntityManager()->flush();

        // Most images must still exist after affecting an existing image to an existing bookable.
        // Only the orphaned image should be deleted, but absolutely never an image related to **another** bookable
        $mustBeDeleted = 'data/images/chat1.jpg';
        foreach ($paths as $p) {
            if ($p === $mustBeDeleted) {
                self::assertFileDoesNotExist($p);
            } else {
                self::assertFileExists($p);
            }
        }

        // Orphaned image was deleted from DB
        self::assertSame('0', $this->getEntityManager()->getConnection()->fetchColumn($imageToBeOrphanedQuery));
    }
}
