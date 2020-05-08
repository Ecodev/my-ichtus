#! /usr/bin/env php
<?php

use Application\Model\Message;
use Doctrine\ORM\EntityManager;
use Ecodev\Felix\Service\Mailer;

$id = $argv[1] ?? null;
if (!$id) {
    throw new InvalidArgumentException('Specify the ID of the message to be sent');
}

$container = require_once 'server/cli.php';

/** @var EntityManager $entityManager */
$entityManager = $container->get(EntityManager::class);
$message = $entityManager->getRepository(Message::class)->findOneById($id);
if (!$message) {
    throw new InvalidArgumentException('Could not find message with ID: ' . $id);
}

/** @var Mailer $mailer */
$mailer = $container->get(Mailer::class);
$mailer->sendMessage($message);
