import AvisoCard from '@/components/igreja/aviso-card';
import MemoriaTile from '@/components/igreja/memoria-tile';
import Reveal from '@/components/igreja/reveal';
import { dia, horario, mesCurto } from '@/lib/format';
import type { Aviso, Memoria } from '@/types/igreja';
import LiturgiaSkeleton from '@/components/igreja/liturgia-skeleton';
import { SantoResumo } from '@/components/igreja/santo-card';
import type { Liturgia } from '@/types/igreja';
import { Deferred, Head, Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';

type Props = { urgentes: Aviso[]; eventos: Aviso[]; avisos: Aviso[]; memorias: Memoria[]; liturgia?: Liturgia };

export default function Home({ urgentes, eventos, avisos, memorias, liturgia }: Props) {
    return (
        <>
            <Head title="Início" />

            <div className="ig-cols">

            {urgentes.length > 0 && (
                <section className="ig-sec ig-o1">
                    <Reveal>
                        <p className="ig-eyebrow">Anunciados na missa</p>
                    </Reveal>
                    <div className="ig-stack">
                        {urgentes.map((a, i) => (
                            <Reveal key={a.id} delay={i * 110}>
                                <article className="ig-alert">
                                    <div className="ig-alert-head">
                                        <span>
                                            <i /> Urgente · {a.categoria.nome}
                                        </span>
                                        {a.data_evento && <span>{dia(a.data_evento)} {mesCurto(a.data_evento)}</span>}
                                    </div>
                                    <h3>{a.assunto}</h3>
                                    <p>{a.contexto}</p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </section>
            )}

            <section className="ig-sec ig-side ig-o2">
                <Reveal>
                    <p className="ig-eyebrow">Hoje na Igreja</p>
                </Reveal>
                <Reveal delay={80}>
                    <Deferred data="liturgia" fallback={<LiturgiaSkeleton altura={176} />}>
                        {liturgia?.santo ? (
                            <SantoResumo santo={liturgia.santo} />
                        ) : (
                            <Link href="/hoje" className="ig-glass ig-teaser" data-spot style={{ gridTemplateColumns: '1fr' }}>
                                <div>
                                    <p className="ig-kicker">Palavra do dia</p>
                                    <h3>Leituras e Evangelho de hoje</h3>
                                    <span className="ig-link">Ler agora <ChevronRight size={15} /></span>
                                </div>
                            </Link>
                        )}
                    </Deferred>
                </Reveal>
            </section>

            {eventos.length > 0 && (
                <section className="ig-sec ig-o3">
                    <Reveal>
                        <p className="ig-eyebrow">Próximos eventos</p>
                    </Reveal>
                    <Reveal delay={80}>
                        <div className="ig-glass" data-spot>
                            {eventos.map((e) => (
                                <Link key={e.id} href={`/calendario?mes=${e.data_evento!.slice(0, 7)}`} className="ig-row">
                                    <span className="ig-date">
                                        <small>{mesCurto(e.data_evento!)}</small>
                                        <b>{dia(e.data_evento!)}</b>
                                    </span>
                                    <span className="ig-row-main">
                                        <span className="ig-row-title" style={{ display: 'block' }}>{e.assunto}</span>
                                        <span className="ig-row-meta">{[horario(e.hora_inicio, e.hora_fim), e.local].filter(Boolean).join(' · ')}</span>
                                    </span>
                                    <ChevronRight size={18} className="ig-chev" />
                                </Link>
                            ))}
                        </div>
                    </Reveal>
                </section>
            )}

            <section className="ig-sec ig-o4">
                <Reveal>
                    <p className="ig-eyebrow">Outros avisos</p>
                </Reveal>
                <Reveal delay={80}>
                    {avisos.length === 0 ? (
                        <div className="ig-glass ig-empty">Sem avisos por agora.</div>
                    ) : (
                        <div className="ig-glass" data-spot>
                            {avisos.map((a) => (
                                <AvisoCard key={a.id} aviso={a} />
                            ))}
                        </div>
                    )}
                    <Link href="/arquivo" className="ig-more">Ver arquivo de avisos →</Link>
                </Reveal>
            </section>

            </div>

            {memorias.length > 0 && (
                <section className="ig-sec">
                    <Reveal>
                        <p className="ig-eyebrow">Memórias recentes</p>
                    </Reveal>
                    <div className="ig-bento">
                        {memorias.map((m, i) => (
                            <Reveal key={m.id} delay={i * 90}>
                                <MemoriaTile memoria={m} larga={i === 0} />
                            </Reveal>
                        ))}
                    </div>
                    <Link href="/memorias" className="ig-more">Ver todas →</Link>
                </section>
            )}
        </>
    );
}
