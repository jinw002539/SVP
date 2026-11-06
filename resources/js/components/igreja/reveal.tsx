import { prefereMenosMovimento } from '@/lib/motion';
import { useEffect, useRef, useState, type CSSProperties, type PropsWithChildren } from 'react';

/** Faz o conteúdo "subir" e aparecer quando entra no ecrã. `delay` (ms) cria o efeito escalonado. */
export default function Reveal({ children, delay = 0, className = '' }: PropsWithChildren<{ delay?: number; className?: string }>) {
    const ref = useRef<HTMLDivElement>(null);
    const [visivel, setVisivel] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!('IntersectionObserver' in window) || prefereMenosMovimento()) {
            setVisivel(true);
            return;
        }
        const obs = new IntersectionObserver(
            ([entrada]) => {
                if (entrada.isIntersecting) {
                    setVisivel(true);
                    obs.disconnect();
                }
            },
            { rootMargin: '0px 0px -6% 0px', threshold: 0.04 },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={ref} className={`ig-reveal ${visivel ? 'is-in' : ''} ${className}`} style={{ '--d': `${delay}ms` } as CSSProperties}>
            {children}
        </div>
    );
}
