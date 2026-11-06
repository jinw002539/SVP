import AdminLayout from '@/layouts/admin-layout';
import { dataLonga } from '@/lib/format';
import type { Paginado } from '@/types/igreja';
import { Link, router } from '@inertiajs/react';
import { Check, Pencil, Plus, Trash2 } from 'lucide-react';

type Linha = { id: number; data: string; santo_nome: string | null; tem_historia: boolean; tem_foto: boolean; leituras: string[] };

const ROTULO: Record<string, string> = { primeira: '1.ª', salmo: 'Salmo', segunda: '2.ª', evangelho: 'Evangelho' };

export default function Index({ hoje, dias }: { hoje: string; dias: Paginado<Linha> }) {
    const apagar = (d: Linha) => {
        if (confirm(`Remover o conteúdo escrito à mão para ${dataLonga(d.data)}? O site volta a usar as fontes automáticas.`)) {
            router.delete(`/admin/liturgia/${d.id}`, { preserveScroll: true });
        }
    };

    return (
        <AdminLayout titulo="Liturgia do dia">
            <p className="mb-4 text-sm text-[#55657f]">
                Quando as leituras ou o santo vêm incompletos, escreva-os aqui. O que preencher substitui o automático, só para esse dia.
            </p>

            <div className="mb-4 flex flex-wrap gap-2">
                <Link href={`/admin/liturgia/create?data=${hoje}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#2f5d9a] px-4 py-2 text-sm font-medium text-white">
                    <Plus size={16} /> Preencher hoje
                </Link>
                <Link href="/admin/liturgia/create" className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e8ee] bg-white px-4 py-2 text-sm font-medium">
                    Outro dia
                </Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#e5e8ee] bg-white">
                {dias.data.length === 0 && <p className="p-4 text-sm text-[#55657f]">Ainda não há entradas escritas à mão.</p>}
                {dias.data.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 border-b border-[#e5e8ee] px-4 py-3 last:border-b-0">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">{dataLonga(d.data)}</p>
                            <p className="truncate text-xs text-[#55657f]">
                                {d.santo_nome ?? 'Sem santo manual'}
                                {d.leituras.length > 0 && ` · ${d.leituras.map((t) => ROTULO[t] ?? t).join(', ')}`}
                            </p>
                            <p className="mt-1 flex gap-3 text-[11px] text-[#2f6b4f]">
                                {d.tem_historia && <span className="inline-flex items-center gap-1"><Check size={11} /> história</span>}
                                {d.tem_foto && <span className="inline-flex items-center gap-1"><Check size={11} /> foto</span>}
                            </p>
                        </div>
                        <Link href={`/admin/liturgia/${d.id}/edit`} aria-label="Editar" className="p-2 text-[#55657f]"><Pencil size={18} /></Link>
                        <button type="button" onClick={() => apagar(d)} aria-label="Remover" className="p-2 text-[#a23a30]"><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between text-sm font-medium text-[#2f5d9a]">
                {dias.prev_page_url ? <Link href={dias.prev_page_url}>← Mais recentes</Link> : <span />}
                {dias.next_page_url && <Link href={dias.next_page_url}>Mais antigas →</Link>}
            </div>
        </AdminLayout>
    );
}
