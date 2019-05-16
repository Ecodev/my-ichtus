<?php

declare(strict_types=1);

namespace Application;

use Cake\Chronos\Chronos;

abstract class Utility
{
    /**
     * @var Chronos
     */
    private static $now;

    /**
     * Returns now, always same value for a single PHP execution
     *
     * @return Chronos
     */
    public static function getNow(): Chronos
    {
        if (!self::$now) {
            self::$now = new Chronos();
        }

        return self::$now;
    }

    /**
     * Returns the short class name of any object, eg: Application\Model\Calendar => Calendar
     *
     * @param object $object
     *
     * @return string
     */
    public static function getShortClassName($object): string
    {
        $reflect = new \ReflectionClass($object);

        return $reflect->getShortName();
    }

    /**
     * Print a list of files if non empty
     *
     * @param string $title
     * @param array $files
     */
    public static function printFiles(string $title, array $files): void
    {
        if (!$files) {
            return;
        }

        echo $title . PHP_EOL . PHP_EOL;

        foreach ($files as $file) {
            echo '    ' . escapeshellarg($file) . PHP_EOL;
        }
        echo PHP_EOL;
    }

    /**
     * Returns a unique key identifying all arguments in the array, so we can use the result as cache key
     *
     * This only works for in-memory objects. The key returned should *never* be
     * persisted. And it may be expensive in memory because object are forced
     * not to be garbage collected.
     *
     * @param mixed $value
     *
     * @return string
     */
    public static function getCacheKey($value): string
    {
        static $preventGarbageCollectorFromDestroyingObject = [];

        if (is_object($value)) {
            $preventGarbageCollectorFromDestroyingObject[] = $value;

            return spl_object_hash($value);
        }

        if (is_array($value)) {
            $key = '[ARRAY|';
            foreach ($value as $i => $modelInCollection) {
                $key .= $i . '>' . self::getCacheKey($modelInCollection) . ':';
            }

            return $key . ']';
        }

        if (is_bool($value)) {
            return '[BOOL|' . $value . ']';
        }

        if ($value === null) {
            return '[NULL]';
        }

        return (string) $value;
    }
}
