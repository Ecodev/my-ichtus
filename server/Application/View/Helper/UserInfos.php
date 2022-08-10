<?php

declare(strict_types=1);

namespace Application\View\Helper;

use Application\Model\User;
use Laminas\View\Helper\AbstractHelper;

class UserInfos extends AbstractHelper
{
    public function __invoke(User $user): string
    {
        $url = $this->view->serverUrl . '/admin/user/' . $user->getId();

        $result = '<ul>';
        $result .= '<li>' . $this->view->escapeHtml($user->getName()) . '</li>';
        if ($user->getEmail()) {
            $result .= '<li><a href="mailto:' . $user->getEmail() . '">' . $this->view->escapeHtml($user->getEmail()) . '</a></li>';
        }
        $result .= '<li><a href="' . $url . '">' . $this->view->escapeHtml($url) . '</a></li>';
        $result .= '</ul>';

        return $result;
    }
}
