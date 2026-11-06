import type { Santo } from '@/types/igreja';
import { ChevronRight, Sun } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

function Retrato({ foto, nome }: { foto: string | null; nome: string }) {
    const [ok, setOk] = useState(false);
    const img = useRef<HTMLImageElement>(null);
    useEffect(() => {
        if (img.current?.complete && img.current.naturalWidth > 0) setOk(true);
    }, []);

    return (
        <div className="ig-arch" data-parallax>
            {foto ? (
                <img ref={img} src={foto} alt={`Imagem de ${nome}`} className={ok ? 'is-loaded' : ''} onLoad={() => setOk(true)} onError={() => setOk(false)} loading="lazy" decoding="async" />
            ) : (
                <span className="ig-arch-ph" aria-hidden="true">
                    <Sun size={44} />
                </span>
            )}
        </div>
    );
}

/** Versão pequena para a página inicial. */
export function SantoResumo({ santo }: { santo: Santo }) {
    return (
        <Link href="/hoje" className="ig-glass ig-teaser" data-spot>
            <div className="ig-halo">
                <Retrato foto={santo.foto} nome={santo.nome} />
            </div>
            <div>
                <p className="ig-kicker">Santo do dia</p>
                <h3>{santo.nome.split(',')[0]}</h3>
                {santo.resumo && <p>{santo.resumo}</p>}
                <span className="ig-link">
                    Conhecer a história <ChevronRight size={15} />
                </span>
            </div>
        </Link>
    );
}

/** Versão completa para a página "Hoje". */
export default function SantoCompleto({ santo }: { santo: Santo }) {
    const [nome, ...resto] = santo.nome.split(',');
    return (
        <article className="ig-santo">
            <div className="ig-halo">
                <Retrato foto={santo.foto} nome={santo.nome} />
            </div>
            <div className="ig-santo-body">
                <div>
                    <h2 className="ig-santo-name">{nome}</h2>
                    {resto.length > 0 && <p className="ig-santo-role">{resto.join(',').trim()}</p>}
                </div>
                {santo.historia.length > 0 ? (
                    <div className="ig-story">
                        {santo.historia.map((p, i) => (
                            <p key={i}>{p}</p>
                        ))}
                    </div>
                ) : (
                    <p className="ig-santo-lead">A história deste santo está disponível no Vatican News.</p>
                )}
                <p className="ig-credit">
                    Texto e imagem: Wikipédia / Wikimedia Commons (CC BY-SA)
                    {santo.link && (
                        <>
                            {' '}
                            ·{' '}
                            <a href={santo.link} target="_blank" rel="noopener noreferrer">
                                ver artigo, autores e licença
                            </a>
                        </>
                    )}
                </p>
            </div>
        </article>
    );
}
