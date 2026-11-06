import CategoriaBadge from '@/components/igreja/categoria-badge';
import AdminLayout from '@/layouts/admin-layout';
import { haQuanto, dataLonga } from '@/lib/format';
import type { Paginado } from '@/types/igreja';
import { Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type Linha = {
    id: number;
    assunto: string;
    categoria: { nome: string; cor: string };
    publicar_em: string;
    data_evento: string | null;
    anunciar_na_missa: boolean;
    estado: 'rascunho' | 'agendado' | 'publicado';
    pode_apagar: boolean;
};

const ESTADO: Record<Linha['estado'], string> = {
    rascunho: 'bg-[#F6ECD3] text-[#8A6516]',
    agendado: 'bg-[#ECE8F5] text-[#5B4B8A]',
    publicado: 'bg-[#E1F0E8] text-[#2F6B4F]',
};

const FILTROS: { rotulo: string; valor: string | null }[] = [
    { rotulo: 'Todos', valor: null },
    { rotulo: 'Publicados', valor: 'publicado' },
    { rotulo: 'Agendados', valor: 'agendado' },
    { rotulo: 'Rascunhos', valor: 'rascunho' },
];

export default function Index({ estado, avisos }: { estado: string | null; avisos: Paginado<Linha> }) {
    const apagar = (a: Linha) => {
        if (confirm(`Apagar o aviso "${a.assunto}"?`)) router.delete(`/admin/avisos/${a.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout titulo="Avisos">
            <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex gap-2 overflow-x-auto">
                    {FILTROS.map((f) => (
                        <Link
                            key={f.rotulo}
                            href={f.valor ? `/admin/avisos?estado=${f.valor}` : '/admin/avisos'}
                            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm ${estado === f.valor ? 'border-[#1F3A5F] bg-[#1F3A5F] text-white' : 'border-[#E3E6EA] bg-white text-[#5E6877]'}`}
                        >
                            {f.rotulo}
                        </Link>
                    ))}
                </div>
                <Link href="/admin/avisos/create" className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#B8892B] px-4 py-2 text-sm font-medium text-white">
                    <Plus size={16} /> Novo
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#E3E6EA] bg-white">
                {avisos.data.length === 0 && <p className="p-4 text-sm text-[#5E6877]">Sem avisos.</p>}
                {avisos.data.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 border-b border-[#E3E6EA] px-4 py-3 last:border-b-0">
                        <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap gap-1.5">
                                <CategoriaBadge categoria={a.categoria} />
                                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ${ESTADO[a.estado]}`}>{a.estado}</span>
                                {a.anunciar_na_missa && <span className="rounded-full bg-[#F8E4E2] px-2.5 py-0.5 text-[11px] font-medium text-[#A93636]">Na missa</span>}
                            </div>
                            <p className="truncate font-medium">{a.assunto}</p>
                            <p className="text-xs text-[#5E6877]">
                                Publica {haQuanto(a.publicar_em)}{a.data_evento && ` · Evento: ${dataLonga(a.data_evento)}`}
                            </p>
                        </div>
                        <Link href={`/admin/avisos/${a.id}/edit`} aria-label="Editar" className="p-2 text-[#5E6877]"><Pencil size={18} /></Link>
                        {a.pode_apagar && (
                            <button type="button" onClick={() => apagar(a)} aria-label="Apagar" className="p-2 text-[#A93636]"><Trash2 size={18} /></button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between text-sm font-medium text-[#1F3A5F]">
                {avisos.prev_page_url ? <Link href={avisos.prev_page_url}>← Anteriores</Link> : <span />}
                {avisos.next_page_url && <Link href={avisos.next_page_url}>Seguintes →</Link>}
            </div>
        </AdminLayout>
    );
}
