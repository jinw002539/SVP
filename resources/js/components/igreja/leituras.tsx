import type { Leitura } from '@/types/igreja';
import { ChevronRight } from 'lucide-react';
import { useId, useState } from 'react';

const NUM: Record<Leitura['tipo'], string> = { primeira: '1', salmo: 'S', segunda: '2', evangelho: '✝' };

function Item({ leitura, aberta, alternar }: { leitura: Leitura; aberta: boolean; alternar: () => void }) {
    const id = useId();
    return (
        <div className={`ig-acc ig-lt--${leitura.tipo}`} data-open={aberta} style={{ borderBottom: '1px solid var(--ig-line)' }}>
            <button type="button" className="ig-lt-head" aria-expanded={aberta} aria-controls={id} onClick={alternar}>
                <span className="ig-lt-num" aria-hidden="true">{NUM[leitura.tipo]}</span>
                <span className="ig-row-main">
                    <span className="ig-row-title" style={{ display: 'block' }}>{leitura.rotulo}</span>
                    {leitura.referencia && <span className="ig-lt-ref">{leitura.referencia}</span>}
                </span>
                <ChevronRight size={18} className="ig-chev" />
            </button>
            <div id={id} role="region" className="ig-panel" data-open={aberta}>
                <div>
                    <p className="ig-lt-text">{leitura.texto}</p>
                </div>
            </div>
        </div>
    );
}

/** Leituras em acordeão. O Evangelho abre por omissão. A/A− mudam o tamanho do texto. */
export default function Leituras({ leituras }: { leituras: Leitura[] }) {
    const [abertas, setAbertas] = useState<Set<string>>(new Set(['evangelho']));
    const [tamanho, setTamanho] = useState(17);

    const alternar = (tipo: string) =>
        setAbertas((a) => {
            const n = new Set(a);
            if (n.has(tipo)) n.delete(tipo);
            else n.add(tipo);
            return n;
        });

    return (
        <div className="ig-leituras" style={{ '--lt': `${tamanho}px` } as React.CSSProperties}>
            <div className="ig-tools" style={{ justifyContent: 'flex-end', marginBottom: 10 }}>
                <button type="button" className="ig-tool" aria-label="Diminuir o texto" onClick={() => setTamanho((t) => Math.max(14, t - 1))}>A−</button>
                <button type="button" className="ig-tool" aria-label="Aumentar o texto" onClick={() => setTamanho((t) => Math.min(24, t + 1))}>A+</button>
            </div>
            <div className="ig-glass" data-spot>
                {leituras.map((l) => (
                    <Item key={l.tipo} leitura={l} aberta={abertas.has(l.tipo)} alternar={() => alternar(l.tipo)} />
                ))}
            </div>
        </div>
    );
}
