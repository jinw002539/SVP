import MemoriaTile from '@/components/igreja/memoria-tile';
import AdminLayout from '@/layouts/admin-layout';
import { dataLonga, hoje } from '@/lib/format';
import { botaoPrimario, campo, erroTexto, rotulo } from '@/lib/ui';
import type { Memoria, Paginado } from '@/types/igreja';
import { Link, router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

type Linha = Memoria & { pode_apagar: boolean };

export default function Index({ memorias }: { memorias: Paginado<Linha> }) {
    const f = useForm({ titulo: '', data_celebracao: hoje(), tipo: 'foto', foto: null as File | null, youtube: '' });
    const { data, setData, errors } = f;

    const enviar = (e: FormEvent) => {
        e.preventDefault();
        f.post('/admin/memorias', { forceFormData: true, preserveScroll: true, onSuccess: () => f.reset('titulo', 'foto', 'youtube') });
    };

    const apagar = (m: Linha) => {
        if (confirm(`Remover "${m.titulo}"?`)) router.delete(`/admin/memorias/${m.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout titulo="Memórias">
            <form onSubmit={enviar} className="mb-6 space-y-3 rounded-2xl border border-[#E3E6EA] bg-white p-4">
                <h2 className="font-serif text-lg font-semibold">Adicionar memória</h2>

                <div className="flex gap-2">
                    {(['foto', 'video'] as const).map((t) => (
                        <button
                            key={t}
                            type="button"
                            onClick={() => setData('tipo', t)}
                            className={`rounded-full border px-4 py-1.5 text-sm ${data.tipo === t ? 'border-[#1F3A5F] bg-[#1F3A5F] text-white' : 'border-[#E3E6EA] text-[#5E6877]'}`}
                        >
                            {t === 'foto' ? 'Foto' : 'Vídeo (YouTube)'}
                        </button>
                    ))}
                </div>

                <div>
                    <label className={rotulo} htmlFor="titulo">Título</label>
                    <input id="titulo" className={campo} maxLength={160} value={data.titulo} onChange={(e) => setData('titulo', e.target.value)} />
                    {errors.titulo && <p className={erroTexto}>{errors.titulo}</p>}
                </div>
                <div>
                    <label className={rotulo} htmlFor="data">Data da celebração</label>
                    <input id="data" type="date" className={campo} value={data.data_celebracao} onChange={(e) => setData('data_celebracao', e.target.value)} />
                    {errors.data_celebracao && <p className={erroTexto}>{errors.data_celebracao}</p>}
                </div>

                {data.tipo === 'foto' ? (
                    <div>
                        <label className={rotulo} htmlFor="foto">Foto (JPG, PNG ou WebP)</label>
                        <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" className={campo} onChange={(e) => setData('foto', e.target.files?.[0] ?? null)} />
                        <p className="mt-1 text-xs text-[#5E6877]">A foto é reduzida e a localização (GPS) é removida automaticamente.</p>
                        {errors.foto && <p className={erroTexto}>{errors.foto}</p>}
                    </div>
                ) : (
                    <div>
                        <label className={rotulo} htmlFor="youtube">Link do YouTube</label>
                        <input id="youtube" inputMode="url" placeholder="https://youtu.be/..." className={campo} value={data.youtube} onChange={(e) => setData('youtube', e.target.value)} />
                        {errors.youtube && <p className={erroTexto}>{errors.youtube}</p>}
                    </div>
                )}

                <button type="submit" className={`${botaoPrimario} w-full`} disabled={f.processing}>
                    {f.processing ? 'A enviar…' : 'Adicionar'}
                </button>
            </form>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {memorias.data.map((m) => (
                    <div key={m.id} className="relative">
                        <MemoriaTile memoria={m} />
                        <p className="mt-1 truncate text-xs font-medium">{m.titulo}</p>
                        <p className="text-[11px] capitalize text-[#5E6877]">{dataLonga(m.data_celebracao)}</p>
                        {m.pode_apagar && (
                            <button type="button" onClick={() => apagar(m)} aria-label="Remover" className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1.5 text-[#A93636]">
                                <Trash2 size={15} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-4 flex justify-between text-sm font-medium text-[#1F3A5F]">
                {memorias.prev_page_url ? <Link href={memorias.prev_page_url}>← Mais recentes</Link> : <span />}
                {memorias.next_page_url && <Link href={memorias.next_page_url}>Mais antigas →</Link>}
            </div>
        </AdminLayout>
    );
}
