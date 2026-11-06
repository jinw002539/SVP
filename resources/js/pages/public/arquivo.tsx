import AvisoCard from '@/components/igreja/aviso-card';
import Reveal from '@/components/igreja/reveal';
import type { Aviso, Paginado } from '@/types/igreja';
import { Head, Link, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export default function Arquivo({ q, avisos }: { q: string; avisos: Paginado<Aviso> }) {
    const [texto, setTexto] = useState(q);

    const pesquisar = (e: FormEvent) => {
        e.preventDefault();
        router.get('/arquivo', texto.trim() ? { q: texto.trim() } : {}, { preserveState: true });
    };

    return (
        <>
            <Head title="Arquivo" />

            <section className="ig-sec">
                <Reveal>
                    <form onSubmit={pesquisar} className="ig-search" role="search">
                        <Search size={18} />
                        <input
                            value={texto}
                            onChange={(e) => setTexto(e.target.value)}
                            maxLength={60}
                            placeholder="Procurar por assunto"
                            aria-label="Procurar avisos"
                        />
                    </form>
                </Reveal>
            </section>

            <section className="ig-sec">
                <Reveal delay={80}>
                    {avisos.data.length === 0 ? (
                        <div className="ig-glass ig-empty">Nenhum aviso encontrado.</div>
                    ) : (
                        <div className="ig-glass" data-spot>
                            {avisos.data.map((a) => (
                                <AvisoCard key={a.id} aviso={a} />
                            ))}
                        </div>
                    )}
                </Reveal>
                <div className="ig-pager">
                    {avisos.prev_page_url ? <Link href={avisos.prev_page_url}>← Mais recentes</Link> : <span />}
                    {avisos.next_page_url && <Link href={avisos.next_page_url}>Mais antigos →</Link>}
                </div>
            </section>
        </>
    );
}
