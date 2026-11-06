<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Onde ficam as fotos:
 *  - UPLOADS_DRIVER=local (omissão): pasta public/uploads (desenvolvimento e hospedagem com disco).
 *  - UPLOADS_DRIVER=s3: bucket compatível com S3 (Cloudflare R2, Backblaze B2, Supabase...).
 *    Necessário em hospedagens gratuitas cujo disco é apagado a cada deploy (ex.: Render).
 */
class UploadsDiskServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if (env('UPLOADS_DRIVER', 'local') !== 's3') {
            return;
        }

        config(['filesystems.disks.uploads' => [
            'driver' => 's3',
            'key' => env('UPLOADS_KEY'),
            'secret' => env('UPLOADS_SECRET'),
            'region' => env('UPLOADS_REGION', 'auto'),
            'bucket' => env('UPLOADS_BUCKET'),
            'endpoint' => env('UPLOADS_ENDPOINT'),
            'url' => env('UPLOADS_URL'), // endereço PÚBLICO do bucket, ex.: https://fotos.exemplo.org
            'use_path_style_endpoint' => filter_var(env('UPLOADS_PATH_STYLE', true), FILTER_VALIDATE_BOOL),
            'throw' => true,
            // sem 'visibility': o R2 não aceita ACLs; o acesso público define-se no bucket.
        ]]);
    }
}
