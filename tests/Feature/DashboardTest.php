<?php

use App\Models\User;

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))->assertRedirect(route('login'));
});

test('authenticated users are sent to the admin panel', function () {
    $this->actingAs(User::factory()->create());

    $this->get(route('dashboard'))->assertRedirect('/admin/avisos');
});
