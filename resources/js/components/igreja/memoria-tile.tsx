import type { Memoria } from '@/types/igreja';
import { ImageOff, Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Foto com "blur-up" (esqueleto brilhante até carregar). Vídeo abre no YouTube: não gasta dados do site. */
export default function MemoriaTile({ memoria, larga = false }: { memoria: Memoria; larga?: boolean }) {
    const [carregada, setCarregada] = useState(false);
    const [erro, setErro] = useState(false);
    const img = useRef<HTMLImageElement>(null);
    const video = memoria.tipo === 'video' && Boolean(memoria.youtube_id);
    const src = video ? `https://i.ytimg.com/vi/${memoria.youtube_id}/mqdefault.jpg` : memoria.url;

    useEffect(() => {
        if (img.current?.complete && img.current.naturalWidth > 0) setCarregada(true);
    }, []);

    const classe = `ig-tile ${larga ? 'ig-tile--wide' : ''} ${carregada || erro || !src ? 'is-loaded' : ''}`;
    const conteudo = (
        <>
            {src && !erro ? (
                <img
                    ref={img}
                    src={src}
                    alt={video ? '' : memoria.titulo}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className={carregada ? 'is-loaded' : ''}
                    onLoad={() => setCarregada(true)}
                    onError={() => setErro(true)}
                />
            ) : video ? null : (
                <span className="ig-tile-ph" aria-hidden="true">
                    <ImageOff size={26} />
                </span>
            )}
            {video && (
                <span className="ig-play">
                    <span>
                        <Play size={20} fill="currentColor" />
                    </span>
                </span>
            )}
        </>
    );

    if (video) {
        return (
            <a href={`https://www.youtube.com/watch?v=${memoria.youtube_id}`} target="_blank" rel="noopener noreferrer" className={classe} aria-label={`Ver vídeo: ${memoria.titulo}`}>
                {conteudo}
            </a>
        );
    }

    return <div className={classe}>{conteudo}</div>;
}
