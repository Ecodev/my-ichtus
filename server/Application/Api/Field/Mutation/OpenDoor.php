<?php

declare(strict_types=1);

namespace Application\Api\Field\Mutation;

use Application\Api\Enum\DoorType;
use Application\Api\Output\OpenDoorType;
use Application\Model\User;
use Application\Repository\LogRepository;
use Ecodev\Felix\Api\Exception;
use Ecodev\Felix\Api\Field\FieldInterface;
use GraphQL\Type\Definition\Type;
use Laminas\Http\Client;
use Laminas\Http\Request;
use Laminas\Http\Response;
use Mezzio\Session\SessionInterface;

abstract class OpenDoor implements FieldInterface
{
    public static function build(): iterable
    {
        yield 'openDoor' => fn () => [
            'type' => Type::nonNull(_types()->get(OpenDoorType::class)),
            'description' => 'Open a door at the premises',
            'args' => [
                'door' => Type::nonNull(_types()->get(DoorType::class)),
            ],
            'resolve' => function ($root, array $args, SessionInterface $session): array {
                global $container;

                if (!preg_match('/door([1-4])/', (string) $args['door'], $m)) {
                    throw new Exception("La porte demandée n'existe pas");
                }
                $doorIndex = $m[1];

                $user = User::getCurrent();
                if (!$user || !$user->getCanOpenDoor($args['door'])) {
                    throw new Exception("Tu n'as pas le droit d'ouvrir cette porte");
                }

                $apiConfig = $container->get('config')['doorsApi'];
                $attrs = [
                    'door' => $doorIndex,
                    'token' => $apiConfig['token'],
                ];

                $request = new Request();
                $request->getHeaders()->addHeaders(['Content-Type' => 'application/json']);
                $request->setUri($apiConfig['endpoint'] . '/open');
                $request->setMethod(Request::METHOD_POST);
                $request->setContent(json_encode($attrs));

                $client = new Client();

                try {
                    /** @var Response $response */
                    $response = $client->dispatch($request);
                } catch (\Laminas\Http\Client\Exception\RuntimeException $e) {
                    // No answer from the websocket
                    _log()->err($e->getMessage(), $attrs);

                    throw new Exception('Commande de porte temporairement inaccessible, essaie plus tard ou contacte un administrateur');
                }

                $content = json_decode($response->getContent(), true);

                if ($response->getStatusCode() === 200) {
                    _log()->info(LogRepository::DOOR_OPENED . $doorIndex, $attrs);

                    return $content;
                }

                if (preg_match('/^5[0-9]{2}/', (string) $response->getStatusCode())) {
                    $errorMsg = "Commande de porte inaccessible en raison d'une erreur serveur, essaie plus tard ou contacte un administrateur";
                } else {
                    $errorMsg = $content['message'] ?? 'Erreur de commande de porte, essaie plus tard ou contacte un administrateur';
                }

                // Log body if we have anything
                $body = trim($response->getBody());
                if ($body) {
                    _log()->err($response->getBody(), $attrs);
                }

                throw new Exception($errorMsg);
            },
        ];
    }
}
