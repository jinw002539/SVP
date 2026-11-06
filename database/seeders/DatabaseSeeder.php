<?php

namespace Database\Seeders;

use App\Enums\Role;
use App\Models\Categoria;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['avisos', 'Avisos da comunidade', 'violet', 1],
            ['ordem', 'Ordem dos avisos', 'blue', 2],
            ['proclamas', 'Proclamas', 'green', 3],
            ['financas', 'Finanças', 'blue', 4],
            ['encontros', 'Encontros', 'blue', 5],
            ['eventos', 'Eventos', 'gold', 6],
        ];

        foreach ($categorias as [$slug, $nome, $cor, $ordem]) {
            Categoria::updateOrCreate(['slug' => $slug], compact('nome', 'cor', 'ordem'));
        }

        // Primeiro administrador: credenciais vêm do .env (nunca ficam no código).
        // Depois de correr o seed, APAGUE ADMIN_PASSWORD do .env.
        $email = env('ADMIN_EMAIL');
        $senha = env('ADMIN_PASSWORD');

        if ($email && $senha && ! User::where('email', $email)->exists()) {
            $admin = new User([
                'name' => env('ADMIN_NAME', 'Administrador'),
                'email' => $email,
                'password' => $senha,
            ]);
            $admin->role = Role::Admin;
            $admin->email_verified_at = now();
            $admin->save();
        }
    }
}
