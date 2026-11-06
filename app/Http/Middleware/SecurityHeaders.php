<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\Facades\View;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        // Nonce por pedido: só scripts com este nonce correm (defesa contra XSS).
        $nonce = base64_encode(random_bytes(16));
        Vite::useCspNonce($nonce);
        View::share('cspNonce', $nonce);

        $response = $next($request);
        $h = $response->headers;

        $h->set('X-Content-Type-Options', 'nosniff');
        $h->set('X-Frame-Options', 'DENY');
        $h->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $h->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
        $h->set('Cross-Origin-Opener-Policy', 'same-origin');

        // Páginas autenticadas nunca ficam em cache do browser/proxy.
        if ($request->is('admin', 'admin/*', 'login', 'settings/*', 'two-factor-challenge')) {
            $h->set('Cache-Control', 'no-store, private');
        }

        // Fotos guardadas num serviço externo (S3/R2): o domínio tem de constar no CSP.
        $hostFotos = parse_url((string) config('filesystems.disks.uploads.url'), PHP_URL_HOST);
        $imgExtra = $hostFotos ? ' https://'.$hostFotos : '';

        // CSP e HSTS só em produção (em desenvolvimento o Vite precisa de mais liberdade).
        if (app()->isProduction()) {
            $h->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
            $h->set('Content-Security-Policy', implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'nonce-{$nonce}'",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
                "img-src 'self' data: https://i.ytimg.com{$imgExtra}",
                "font-src 'self' data: https://fonts.bunny.net",
                "connect-src 'self'",
                "frame-src 'none'",
                "worker-src 'self'",
                "manifest-src 'self'",
                "object-src 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "frame-ancestors 'none'",
            ]));
        }

        return $response;
    }
}
