<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RouletteTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_view_the_roulette(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('roulette.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Roulette/Index')
                ->has('segments', 10)
                ->where('roulette.can_spin', true)
                ->where('roulette.bonus_spins', 0)
            );
    }

    public function test_guest_cannot_access_the_roulette(): void
    {
        $this->get(route('roulette.index'))
            ->assertRedirect(route('login'));

        $this->postJson(route('roulette.spin'))
            ->assertRedirect(route('login'));
    }

    public function test_coin_reward_is_selected_and_applied_only_by_the_backend(): void
    {
        Config::set('roulette.outcomes', [[
            'key' => 'coins_50',
            'type' => 'coins',
            'label' => '50 moedas',
            'coins' => 50,
            'weight' => 1,
        ]]);

        $user = User::factory()->create(['coins' => 1_000]);

        $this->actingAs($user)
            ->postJson(route('roulette.spin'), [
                'coins' => 999_999,
                'outcome' => 'coins_25000',
            ])
            ->assertOk()
            ->assertJsonPath('outcome.key', 'coins_50')
            ->assertJsonPath('outcome.coins', 50)
            ->assertJsonPath('balance', 1_050);

        $this->assertSame(1_050, $user->fresh()->coins);
        $this->assertDatabaseHas('roulette_spins', [
            'user_id' => $user->id,
            'outcome_key' => 'coins_50',
            'coins_awarded' => 50,
            'balance_after' => 1_050,
        ]);
        $this->assertDatabaseHas('coin_transactions', [
            'user_id' => $user->id,
            'amount' => 50,
            'type' => 'roulette_reward',
            'balance_after' => 1_050,
        ]);
    }

    public function test_regular_spin_is_limited_to_once_per_hour(): void
    {
        $this->configureNothingOutcome();
        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('roulette.spin'))
            ->assertOk();

        $this->actingAs($user)
            ->postJson(route('roulette.spin'))
            ->assertStatus(429)
            ->assertJsonStructure(['message', 'next_spin_at']);

        $this->travel(61)->minutes();

        $this->actingAs($user)
            ->postJson(route('roulette.spin'))
            ->assertOk();

        $this->assertDatabaseCount('roulette_spins', 2);
    }

    public function test_reroll_grants_one_immediate_bonus_spin_without_resetting_cooldown(): void
    {
        Config::set('roulette.outcomes', [[
            'key' => 'reroll',
            'type' => 'reroll',
            'label' => 'Gire novamente',
            'coins' => 0,
            'weight' => 1,
        ]]);

        $user = User::factory()->create();

        $this->actingAs($user)
            ->postJson(route('roulette.spin'))
            ->assertOk()
            ->assertJsonPath('outcome.type', 'reroll')
            ->assertJsonPath('roulette.bonus_spins', 1)
            ->assertJsonPath('roulette.can_spin', true);

        $this->configureNothingOutcome();

        $this->actingAs($user)
            ->postJson(route('roulette.spin'))
            ->assertOk()
            ->assertJsonPath('roulette.bonus_spins', 0)
            ->assertJsonPath('roulette.can_spin', false);

        $this->actingAs($user)
            ->postJson(route('roulette.spin'))
            ->assertStatus(429);

        $this->assertDatabaseHas('roulette_spins', [
            'user_id' => $user->id,
            'outcome_key' => 'nothing',
            'used_bonus_spin' => true,
        ]);
    }

    public function test_configured_probabilities_use_the_expected_integer_scale(): void
    {
        $outcomes = config('roulette.outcomes');
        $nothing = collect($outcomes)->firstWhere('key', 'nothing');

        $this->assertSame(
            1_000_000,
            array_sum(array_column($outcomes, 'weight'))
        );
        $this->assertSame(50_000, $nothing['weight']);
    }

    private function configureNothingOutcome(): void
    {
        Config::set('roulette.outcomes', [[
            'key' => 'nothing',
            'type' => 'nothing',
            'label' => 'Nada',
            'coins' => 0,
            'weight' => 1,
        ]]);
    }
}
