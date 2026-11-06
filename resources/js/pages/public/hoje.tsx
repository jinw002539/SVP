import LiturgiaSkeleton from '@/components/igreja/liturgia-skeleton';
import Leituras from '@/components/igreja/leituras';
import Reveal from '@/components/igreja/reveal';
import SantoCompleto from '@/components/igreja/santo-card';
import type { Liturgia } from '@/types/igreja';
import { Deferred, Head } from '@inertiajs/react';
import { ExternalLink } from 'lucide-react';

function Conteudo({ liturgia }: { liturgia: Liturgia }) {
    return (
        <>
            {liturgia.celebracao && (
                <section className="ig-sec">
                    <Reveal>
                        <p className="ig-celebra">{liturgia.celebracao}</p>
                    </Reveal>
                </section>
            )}

            <section className="ig-sec">
                <Reveal>
                    <p className="ig-eyebrow">Santo do dia</p>
                </Reveal>
                <Reveal delay={80}>
                    {liturgia.santo ? (
                        <SantoCompleto santo={liturgia.santo} />
                    ) : (
                        <div className="ig-glass ig-empty">
                            Não foi possível carregar o santo do dia agora.
                            <div style={{ marginTop: 14 }}>
                                <a className="ig-btn ig-btn--ghost" href={liturgia.links.santo} target="_blank" rel="noopener noreferrer">
                                    Ver no Vatican News <ExternalLink size={15} />
                                </a>
                            </div>
                        </div>
                    )}
                </Reveal>
            </section>

            <section className="ig-sec">
                <Reveal>
                    <p className="ig-eyebrow">Leituras do dia</p>
                </Reveal>
                <Reveal delay={80}>
                    {liturgia.leituras.length > 0 ? (
                        <Leituras leituras={liturgia.leituras} />
                    ) : (
                        <div className="ig-glass ig-empty">Não foi possível carregar as leituras agora.</div>
                    )}
                    <p className="ig-credit" style={{ textAlign: 'center' }}>
                        Leituras:{' '}
                        <a href="https://www.evangelizo.org" target="_blank" rel="noopener noreferrer">Evangelizo.org</a>
                        {' · '}
                        <a href={liturgia.links.palavra} target="_blank" rel="noopener noreferrer">Ouvir e ler no Vatican News</a>
                    </p>
                </Reveal>
            </section>
        </>
    );
}

export default function Hoje({ liturgia }: { liturgia?: Liturgia }) {
    return (
        <>
            <Head title="Hoje na Igreja" />
            <Deferred
                data="liturgia"
                fallback={
                    <section className="ig-sec" style={{ display: 'grid', gap: 14 }}>
                        <LiturgiaSkeleton altura={340} />
                        <LiturgiaSkeleton altura={200} />
                    </section>
                }
            >
                {liturgia && <Conteudo liturgia={liturgia} />}
            </Deferred>
        </>
    );
}
