import CategoriaBadge from '@/components/igreja/categoria-badge';
import Reveal from '@/components/igreja/reveal';
import { dataLonga, hoje, horario, mesIso, nomeMes } from '@/lib/format';
import type { Aviso } from '@/types/igreja';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

export default function Calendario({ mes, eventos }: { mes: string; eventos: Aviso[] }) {
    const [ano, m] = mes.split('-').map(Number);
    const primeiro = new Date(ano, m - 1, 1).getDay();
    const total = new Date(ano, m, 0).getDate();
    const anterior = mesIso(new Date(ano, m - 2, 1));
    const seguinte = mesIso(new Date(ano, m, 1));
    const hojeIso = hoje();

    const porDia = useMemo(() => {
        const mapa: Record<string, Aviso[]> = {};
        eventos.forEach((e) => {
            if (e.data_evento) (mapa[e.data_evento] ??= []).push(e);
        });
        return mapa;
    }, [eventos]);

    const [sel, setSel] = useState<string>(() => (hojeIso.startsWith(mes) ? hojeIso : (Object.keys(porDia).sort()[0] ?? `${mes}-01`)));
    const doDia = porDia[sel] ?? [];
    const celulas: (number | null)[] = [...Array(primeiro).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)];

    return (
        <>
            <Head title="Calendário" />

            <section className="ig-sec">
                <Reveal>
                    <div className="ig-glass ig-cal" data-spot>
                        <div className="ig-cal-head">
                            <Link href={`/calendario?mes=${anterior}`} className="ig-icon-btn" aria-label="Mês anterior">
                                <ChevronLeft size={20} />
                            </Link>
                            <h2 className="ig-h2">{nomeMes(ano, m)}</h2>
                            <Link href={`/calendario?mes=${seguinte}`} className="ig-icon-btn" aria-label="Mês seguinte">
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                        <div className="ig-cal-grid">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                                <div key={i} className="ig-dow">{d}</div>
                            ))}
                            {celulas.map((d, i) => {
                                if (d === null) return <div key={i} />;
                                const iso = `${mes}-${String(d).padStart(2, '0')}`;
                                return (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setSel(iso)}
                                        aria-pressed={iso === sel}
                                        className={`ig-day ${iso === sel ? 'is-sel' : ''} ${iso === hojeIso ? 'is-today' : ''}`}
                                    >
                                        {d}
                                        {porDia[iso] && <i />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </Reveal>
            </section>

            <section className="ig-sec">
                <Reveal delay={80}>
                    <p className="ig-eyebrow">{dataLonga(sel)}</p>
                </Reveal>
                <div className="ig-stack" key={sel}>
                    {doDia.length === 0 ? (
                        <div className="ig-glass ig-empty">Sem eventos neste dia.</div>
                    ) : (
                        doDia.map((e, i) => (
                            <Reveal key={e.id} delay={i * 90}>
                                <article className="ig-glass ig-ev-card" data-spot>
                                    <CategoriaBadge categoria={e.categoria} />
                                    <h3>{e.assunto}</h3>
                                    <p className="ig-row-meta">{[horario(e.hora_inicio, e.hora_fim), e.local].filter(Boolean).join(' · ')}</p>
                                    <p>{e.contexto}</p>
                                    {e.itens.length > 0 && (
                                        <ul>
                                            {e.itens.map((t, k) => (
                                                <li key={k}>{t}</li>
                                            ))}
                                        </ul>
                                    )}
                                </article>
                            </Reveal>
                        ))
                    )}
                </div>
            </section>
        </>
    );
}
