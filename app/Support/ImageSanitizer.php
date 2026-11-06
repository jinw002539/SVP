<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Re-codifica a imagem para WebP:
 *  - remove metadados EXIF (incluindo localização GPS) -> confidencialidade;
 *  - destrói ficheiros "poliglota" (imagem + código escondido) -> segurança;
 *  - reduz o tamanho -> poupa dados móveis e espaço.
 */
class ImageSanitizer
{
    private const LADO_MAX = 1600;

    /** Upload feito por um utilizador autenticado. */
    public static function guardar(UploadedFile $ficheiro, string $pasta): string
    {
        $conteudo = (string) file_get_contents($ficheiro->getRealPath());
        $caminho = trim($pasta, '/').'/'.Str::random(40).'.webp';

        return self::guardarConteudo($conteudo, $caminho, $ficheiro->getMimeType() === 'image/jpeg');
    }

    /** Imagem já em memória (ex.: descarregada de uma fonte externa). Devolve o caminho relativo. */
    public static function guardarConteudo(string $conteudo, string $caminho, bool $jpegComExif = false): string
    {
        $img = $conteudo !== '' ? @imagecreatefromstring($conteudo) : false;

        if ($img === false) {
            throw ValidationException::withMessages(['foto' => 'Não foi possível processar a imagem.']);
        }

        // Respeitar a orientação das fotos de telemóvel antes de apagar o EXIF.
        if ($jpegComExif && function_exists('exif_read_data')) {
            $exif = @exif_read_data('data://image/jpeg;base64,'.base64_encode($conteudo));
            $graus = match ((int) ($exif['Orientation'] ?? 1)) {
                3 => 180, 6 => -90, 8 => 90, default => 0,
            };
            if ($graus !== 0 && ($rodada = imagerotate($img, $graus, 0)) !== false) {
                $img = $rodada;
            }
        }

        $l = imagesx($img);
        $a = imagesy($img);
        $razao = min(1, self::LADO_MAX / $l, self::LADO_MAX / $a);
        if ($razao < 1 && ($reduzida = imagescale($img, (int) round($l * $razao))) !== false) {
            $img = $reduzida;
        }

        imagepalettetotruecolor($img);
        imagealphablending($img, true);
        imagesavealpha($img, true);

        ob_start();
        imagewebp($img, null, 80);
        $binario = (string) ob_get_clean();

        if ($binario === '') {
            throw ValidationException::withMessages(['foto' => 'Não foi possível converter a imagem.']);
        }

        Storage::disk('uploads')->put($caminho, $binario);

        return $caminho;
    }
}
