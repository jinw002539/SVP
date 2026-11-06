<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = ['user_id', 'acao', 'entidade', 'entidade_id', 'campos', 'ip'];

    protected function casts(): array
    {
        return ['campos' => 'array', 'created_at' => 'datetime'];
    }
}
