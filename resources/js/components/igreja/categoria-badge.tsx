import type { Categoria } from '@/types/igreja';

const CORES = ['blue', 'gold', 'green', 'violet', 'red'];

export default function CategoriaBadge({ categoria }: { categoria: Pick<Categoria, 'nome' | 'cor'> }) {
    const cor = CORES.includes(categoria.cor) ? categoria.cor : 'blue';
    return <span className={`ig-badge ig-badge--${cor}`}>{categoria.nome}</span>;
}
