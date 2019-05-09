<?php

declare(strict_types=1);

namespace ApplicationTest\Model;

use Application\Model\Bookable;
use PHPUnit\Framework\TestCase;

class BookableTest extends TestCase
{
    public function testCode(): void
    {
        $bookable = new Bookable();
        self::assertNull($bookable->getCode());

        $bookable->setCode('foo');
        self::assertSame('foo', $bookable->getCode());

        $bookable->setCode('');
        self::assertNull($bookable->getCode());

        $bookable->setCode('foo');
        self::assertSame('foo', $bookable->getCode());

        $bookable->setCode(null);
        self::assertNull($bookable->getCode());
    }
}
