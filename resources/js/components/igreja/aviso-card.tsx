import { haQuanto } from '@/lib/format';
import type { Aviso } from '@/types/igreja';
import { ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';
import CategoriaBadge from './categoria-badge';

/** Aviso em acordeão: abre com uma transição suave de altura (sem saltos). */
export default function AvisoCard({ aviso }: { aviso: Aviso }) {
    const [aberto, setAberto] = useState(false);
    const id = useId();
    const n = aviso.itens.length;

    return (
        <div className="ig-acc" data-open={aberto}>
            <button type="button" className="ig-row" aria-expanded={aberto} aria-controls={id} onClick={() => setAberto((v) => !v)}>
                <span className="ig-row-main">
                    <CategoriaBadge categoria={aviso.categoria} />
                    <span className="ig-row-title" style={{ display: 'block', marginTop: 6 }}>{aviso.assunto}</span>
                    <span className="ig-row-meta">
                        {n > 0 && `${n} ${n === 1 ? 'item' : 'itens'} · `}
                        {haQuanto(aviso.publicar_em)}
                    </span>
                </span>
                <ChevronRight size={18} className="ig-chev" />
            </button>
            <div id={id} role="region" className="ig-panel" data-open={aberto}>
                <div>
                    <div className="ig-panel-body">
                        <p>{aviso.contexto}</p>
                        {n > 0 && (
                            <ul>
                                {aviso.itens.map((t, i) => (
                                    <li key={i}>{t}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
