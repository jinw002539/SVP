// Regista o Service Worker só em produção (em dev atrapalha o hot reload).
if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            /* sem SW o site continua a funcionar normalmente */
        });
    });
}
