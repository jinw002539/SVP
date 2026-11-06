import MemoriaTile from '@/components/igreja/memoria-tile';
import Reveal from '@/components/igreja/reveal';
import { dataLonga } from '@/lib/format';
import type { Memoria, Paginado } from '@/types/igreja';
import { Head, Link } from '@inertiajs/react';

type Props = { tipo: 'foto' | 'video' | null; memorias: Paginado<Memoria> };

const FILTROS: { rotulo: string; valor: 'foto' | 'video' | null }[] = [
    { rotulo: 'Todas', valor: null },
    { rotulo: 'Fotos', valor: 'foto' },
    { rotulo: 'Vídeos', valor: 'video' },
];

export default function Memorias({ tipo, memorias }: Props) {
    const grupos = memorias.data.reduce<Map<string, Memoria[]>>((mapa, m) => {
        mapa.set(m.data_celebracao, [...(mapa.get(m.data_celebracao) ?? []), m]);
        return mapa;
    }, new Map());

    return (
        <>
            <Head title="Memórias" />

            <section className="ig-sec">
                <Reveal>
                    <div className="ig-chips">
                        {FILTROS.map((f) => (
                            <Link key={f.rotulo} href={f.valor ? `/memorias?tipo=${f.valor}` : '/memorias'} className={`ig-chip ${tipo === f.valor ? 'is-on' : ''}`}>
                                {f.rotulo}
                            </Link>
                        ))}
                    </div>
                </Reveal>
            </section>

            {memorias.data.length === 0 && (
                <section className="ig-sec">
                    <div className="ig-glass ig-empty">Ainda não há memórias.</div>
                </section>
            )}

            {[...grupos.entries()].map(([data, itens]) => (
                <section key={data} className="ig-sec">
                    <Reveal>
                        <h2 className="ig-h2" style={{ margin: '0 4px 12px' }}>{dataLonga(data)}</h2>
                    </Reveal>
                    <div className="ig-grid2">
                        {itens.map((m, i) => (
                            <Reveal key={m.id} delay={i * 70}>
                                <MemoriaTile memoria={m} />
                                <p className="ig-cap">{m.titulo}</p>
                            </Reveal>
                        ))}
                    </div>
                </section>
            ))}

            <section className="ig-sec">
                <div className="ig-pager">
                    {memorias.prev_page_url ? <Link href={memorias.prev_page_url}>← Mais recentes</Link> : <span />}
                    {memorias.next_page_url && <Link href={memorias.next_page_url}>Mais antigas →</Link>}
                </div>
            </section>
        </>
    );
}
