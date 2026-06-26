<?php

namespace App\Exceptions;

use DateTimeInterface;
use RuntimeException;

class RouletteCooldownException extends RuntimeException
{
    public function __construct(
        public readonly DateTimeInterface $nextSpinAt,
    ) {
        parent::__construct('A roleta ainda está em recarga.');
    }
}
