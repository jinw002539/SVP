import { useEffect } from 'react';

/** Estado partilhado (lido pelo shader a cada frame, sem re-render do React). */
export const motion = { sy: 0, progress: 0, px: 0, py: 0 };

export const prefereMenosMovimento = (): boolean =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type Ref<T> = { current: T | null };

/**
 * Um único "ouvinte" de scroll e de ponteiro para todo o site:
 *  - --sy  (px de scroll) no hero            -> paralaxe e desvanecer;
 *  - --p   (0..1) na barra de leitura;
 *  - data-on na barra superior               -> aparece depois de descer a página;
 *  - --py  nos elementos [data-parallax]     -> a foto "flutua" dentro da moldura;
 *  - --mx/--my nos elementos [data-spot]     -> brilho que segue o cursor.
 */
export function useGlobalMotion({ hero, progress, bar }: { hero: Ref<HTMLElement>; progress: Ref<HTMLElement>; bar: Ref<HTMLElement> }) {
    useEffect(() => {
        let scrollFrame = 0;
        let pointerFrame = 0;
        let lastPointer: PointerEvent | null = null;

        const apply = () => {
            scrollFrame = 0;
            const y = window.scrollY;
            const vh = window.innerHeight;
            const max = Math.max(1, document.documentElement.scrollHeight - vh);
            motion.sy = y;
            motion.progress = Math.min(1, Math.max(0, y / max));
            hero.current?.style.setProperty('--sy', String(Math.round(Math.min(y, 700))));
            progress.current?.style.setProperty('--p', motion.progress.toFixed(4));
            if (bar.current) bar.current.dataset.on = String(y > 150);

            if (!prefereMenosMovimento()) {
                document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
                    const r = el.getBoundingClientRect();
                    if (r.bottom < -80 || r.top > vh + 80) return;
                    const centro = r.top + r.height / 2 - vh / 2;
                    el.style.setProperty('--py', (-centro * 0.08).toFixed(1));
                });
            }
        };
        const onScroll = () => {
            if (!scrollFrame) scrollFrame = requestAnimationFrame(apply);
        };

        const onPointer = (e: PointerEvent) => {
            motion.px = e.clientX / window.innerWidth - 0.5;
            motion.py = e.clientY / window.innerHeight - 0.5;
            lastPointer = e;
            if (pointerFrame) return;
            pointerFrame = requestAnimationFrame(() => {
                pointerFrame = 0;
                const e2 = lastPointer;
                const alvo = e2?.target instanceof Element ? e2.target.closest<HTMLElement>('[data-spot]') : null;
                if (!e2 || !alvo) return;
                const r = alvo.getBoundingClientRect();
                alvo.style.setProperty('--mx', `${e2.clientX - r.left}px`);
                alvo.style.setProperty('--my', `${e2.clientY - r.top}px`);
            });
        };

        apply();
        // Conteúdo carregado depois (ex.: santo do dia) muda a altura da página: reavaliar.
        const observador = new ResizeObserver(onScroll);
        observador.observe(document.body);
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        window.addEventListener('pointermove', onPointer, { passive: true });
        return () => {
            cancelAnimationFrame(scrollFrame);
            cancelAnimationFrame(pointerFrame);
            observador.disconnect();
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            window.removeEventListener('pointermove', onPointer);
        };
    }, [hero, progress, bar]);
}
