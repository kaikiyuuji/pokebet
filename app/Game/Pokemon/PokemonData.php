<?php

namespace App\Game\Pokemon;

class PokemonData
{
    /**
     * @param MoveData[] $moves
     */
    public function __construct(
        public readonly int     $pokeapiId,
        public readonly string  $name,
        public readonly string  $slug,
        public readonly string  $sprite,
        public readonly int     $baseHp,
        public readonly int     $baseAttack,
        public readonly int     $baseDefense,
        public readonly int     $baseSpecialAttack,
        public readonly int     $baseSpecialDefense,
        public readonly int     $baseSpeed,
        public readonly string  $primaryTypeSlug,
        public readonly ?string $secondaryTypeSlug,
        public readonly string  $primaryTypeName,
        public readonly ?string $secondaryTypeName,
        public readonly array   $moves,
    ) {}

    public function baseTotal(): int
    {
        return $this->baseHp + $this->baseAttack + $this->baseDefense
            + $this->baseSpecialAttack + $this->baseSpecialDefense + $this->baseSpeed;
    }

    public function toSnapshot(): array
    {
        return [
            'pokeapi_id'           => $this->pokeapiId,
            'name'                 => $this->name,
            'slug'                 => $this->slug,
            'sprite'               => $this->sprite,
            'base_hp'              => $this->baseHp,
            'base_attack'          => $this->baseAttack,
            'base_defense'         => $this->baseDefense,
            'base_special_attack'  => $this->baseSpecialAttack,
            'base_special_defense' => $this->baseSpecialDefense,
            'base_speed'           => $this->baseSpeed,
            'primary_type_slug'    => $this->primaryTypeSlug,
            'secondary_type_slug'  => $this->secondaryTypeSlug,
            'primary_type_name'    => $this->primaryTypeName,
            'secondary_type_name'  => $this->secondaryTypeName,
        ];
    }

    public static function fromSnapshot(array $snap): self
    {
        return new self(
            pokeapiId:           $snap['pokeapi_id'],
            name:                $snap['name'],
            slug:                $snap['slug'],
            sprite:              $snap['sprite'],
            baseHp:              $snap['base_hp'],
            baseAttack:          $snap['base_attack'],
            baseDefense:         $snap['base_defense'],
            baseSpecialAttack:   $snap['base_special_attack'],
            baseSpecialDefense:  $snap['base_special_defense'],
            baseSpeed:           $snap['base_speed'],
            primaryTypeSlug:     $snap['primary_type_slug'],
            secondaryTypeSlug:   $snap['secondary_type_slug'] ?? null,
            primaryTypeName:     $snap['primary_type_name'],
            secondaryTypeName:   $snap['secondary_type_name'] ?? null,
            moves:               [],
        );
    }
}
