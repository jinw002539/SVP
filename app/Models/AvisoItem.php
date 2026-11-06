<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AvisoItem extends Model
{
    protected $table = 'aviso_itens';

    public $timestamps = false;

    protected $fillable = ['texto', 'ordem'];
}
