<?php

namespace App\Game\Pokemon;

class MoveData
{
    public function __construct(
        public readonly string $name,
        public readonly string $slug,
        public readonly string $typeSlug,
        public readonly string $damageClass,
        public readonly ?int   $power,
        public readonly ?int   $accuracy,
        public readonly int    $pp,
    ) {}

    public function isDamaging(): bool
    {
        return $this->damageClass !== 'status' && $this->power !== null && $this->power > 0;
    }
}
