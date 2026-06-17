/** Tailwind classes por tipo de Pokémon. Classes completas para o JIT não purgar. */
export const TYPE_STYLES = {
    normal:   { bg: 'bg-gray-400',    ring: 'ring-gray-400',    text: 'text-white' },
    fire:     { bg: 'bg-orange-500',  ring: 'ring-orange-500',  text: 'text-white' },
    water:    { bg: 'bg-blue-500',    ring: 'ring-blue-500',    text: 'text-white' },
    grass:    { bg: 'bg-green-500',   ring: 'ring-green-500',   text: 'text-white' },
    electric: { bg: 'bg-yellow-400',  ring: 'ring-yellow-400',  text: 'text-gray-900' },
    ice:      { bg: 'bg-cyan-400',    ring: 'ring-cyan-400',    text: 'text-white' },
    fighting: { bg: 'bg-red-700',     ring: 'ring-red-700',     text: 'text-white' },
    poison:   { bg: 'bg-purple-600',  ring: 'ring-purple-600',  text: 'text-white' },
    ground:   { bg: 'bg-yellow-600',  ring: 'ring-yellow-600',  text: 'text-white' },
    flying:   { bg: 'bg-indigo-400',  ring: 'ring-indigo-400',  text: 'text-white' },
    psychic:  { bg: 'bg-pink-500',    ring: 'ring-pink-500',    text: 'text-white' },
    bug:      { bg: 'bg-lime-500',    ring: 'ring-lime-500',    text: 'text-white' },
    rock:     { bg: 'bg-yellow-700',  ring: 'ring-yellow-700',  text: 'text-white' },
    ghost:    { bg: 'bg-purple-800',  ring: 'ring-purple-800',  text: 'text-white' },
    dragon:   { bg: 'bg-indigo-700',  ring: 'ring-indigo-700',  text: 'text-white' },
    dark:     { bg: 'bg-gray-800',    ring: 'ring-gray-800',    text: 'text-white' },
    steel:    { bg: 'bg-gray-500',    ring: 'ring-gray-500',    text: 'text-white' },
    fairy:    { bg: 'bg-pink-300',    ring: 'ring-pink-300',    text: 'text-gray-900' },
};

export function getTypeStyle(slug) {
    return TYPE_STYLES[slug] ?? { bg: 'bg-gray-400', ring: 'ring-gray-400', text: 'text-white' };
}

/** Formata número do Pokémon como #001, #025, etc. */
export function formatPokedexNumber(n) {
    return '#' + String(n).padStart(3, '0');
}

/** Stat bars: returns a width percentage (capped at 100%) */
export function statPercent(value, max = 255) {
    return Math.min(100, Math.round((value / max) * 100));
}

export const STAT_LABELS = {
    base_hp:              { label: 'HP',   color: 'bg-red-500' },
    base_attack:          { label: 'Atk',  color: 'bg-orange-500' },
    base_defense:         { label: 'Def',  color: 'bg-yellow-500' },
    base_special_attack:  { label: 'SpAtk', color: 'bg-blue-500' },
    base_special_defense: { label: 'SpDef', color: 'bg-green-500' },
    base_speed:           { label: 'Vel',  color: 'bg-pink-500' },
};
