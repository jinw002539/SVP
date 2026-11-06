<?php

namespace App\Console\Commands;

use App\Services\LiturgiaService;
use Illuminate\Console\Command;
use Illuminate\Support\Carbon;

class LiturgiaTestar extends Command
{
    protected $signature = 'liturgia:testar {data? : AAAA-MM-DD (por omissão, hoje)}';

    protected $description = 'Testa a obtenção do santo do dia e das leituras (ignora a cache)';

    public function handle(LiturgiaService $servico): int
    {
        $dia = $this->argument('data') ? Carbon::parse($this->argument('data')) : now();
        $servico->esquecer($dia);

        $r = $servico->doDia($dia);

        $this->info('Data: '.$r['data'].'   Celebração: '.($r['celebracao'] ?? '—'));
        $this->line('Santo: '.($r['santo']['nome'] ?? '—'));
        $this->line('  foto: '.($r['santo']['foto'] ?? '—').'   parágrafos: '.count($r['santo']['historia'] ?? []));
        foreach ($r['leituras'] as $l) {
            $this->line(sprintf('  %-12s %-14s %d caracteres', $l['rotulo'], $l['referencia'] ?? '—', mb_strlen($l['texto'])));
        }
        $r['completo'] ? $this->info('OK: tudo obtido.') : $this->warn('Incompleto: veja storage/logs/laravel.log. O site continua a funcionar com ligações de reserva.');

        return $r['completo'] ? self::SUCCESS : self::FAILURE;
    }
}
