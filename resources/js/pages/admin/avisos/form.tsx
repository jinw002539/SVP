import AdminLayout from '@/layouts/admin-layout';
import { hoje, dataLonga } from '@/lib/format';
import { botao, botaoPrimario, campo, erroTexto, rotulo } from '@/lib/ui';
import { Link, useForm } from '@inertiajs/react';
import { ArrowDown, ArrowUp, MessageCircle, Plus, X } from 'lucide-react';
import type { FormEvent } from 'react';

type AvisoForm = {
    id: number;
    categoria_id: number;
    assunto: string;
    contexto: string;
    publicar_em: string;
    data_evento: string | null;
    hora_inicio: string | null;
    hora_fim: string | null;
    local: string | null;
    anunciar_na_missa: boolean;
    status: string;
    itens: string[];
};

type Props = { aviso: AvisoForm | null; categorias: { id: number; nome: string }[] };

// Número público (VITE_ expõe no browser). Vazio = o WhatsApp pede para escolher o contacto.
const WHATSAPP = (import.meta.env.VITE_WHATSAPP_NUMERO as string | undefined) ?? '';

export default function Form({ aviso, categorias }: Props) {
    const f = useForm({
        categoria_id: aviso?.categoria_id ?? categorias[0]?.id ?? 0,
        assunto: aviso?.assunto ?? '',
        contexto: aviso?.contexto ?? '',
        publicar_em: aviso?.publicar_em ?? hoje(),
        data_evento: aviso?.data_evento ?? '',
        hora_inicio: aviso?.hora_inicio ?? '',
        hora_fim: aviso?.hora_fim ?? '',
        local: aviso?.local ?? '',
        anunciar_na_missa: aviso?.anunciar_na_missa ?? false,
        status: aviso?.status ?? 'rascunho',
        itens: aviso?.itens ?? ([] as string[]),
    });
    const { data, setData, errors } = f;

    const guardar = (status: 'rascunho' | 'publicado') => {
        f.transform((d) => ({ ...d, status, itens: d.itens.map((t) => t.trim()).filter(Boolean) }));
        if (aviso) f.put(`/admin/avisos/${aviso.id}`);
        else f.post('/admin/avisos');
    };

    const submeter = (e: FormEvent) => {
        e.preventDefault();
        guardar('publicado');
    };

    const setItem = (i: number, v: string) => setData('itens', data.itens.map((x, k) => (k === i ? v : x)));
    const remover = (i: number) => setData('itens', data.itens.filter((_, k) => k !== i));
    const mover = (i: number, delta: number) => {
        const a = [...data.itens];
        const j = i + delta;
        if (j < 0 || j >= a.length) return;
        [a[i], a[j]] = [a[j], a[i]];
        setData('itens', a);
    };

    const textoWhatsApp = [
        `*${data.assunto}*`,
        data.data_evento ? `📅 ${dataLonga(data.data_evento)}${data.hora_inicio ? ` · ${data.hora_inicio}` : ''}` : '',
        data.local ? `📍 ${data.local}` : '',
        '',
        data.contexto,
        ...data.itens.filter(Boolean).map((t) => `• ${t}`),
    ].filter((l, i) => l !== '' || i > 0).join('\n');

    const errosItens = Object.entries(errors).filter(([k]) => k.startsWith('itens'));

    return (
        <AdminLayout titulo={aviso ? 'Editar aviso' : 'Novo aviso'}>
            <form onSubmit={submeter} className="space-y-4 rounded-2xl border border-[#E3E6EA] bg-white p-4">
                <h2 className="font-serif text-lg font-semibold">{aviso ? 'Editar aviso' : 'Novo aviso'}</h2>

                <div>
                    <label className={rotulo} htmlFor="categoria">Categoria</label>
                    <select id="categoria" className={campo} value={data.categoria_id} onChange={(e) => setData('categoria_id', Number(e.target.value))}>
                        {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    {errors.categoria_id && <p className={erroTexto}>{errors.categoria_id}</p>}
                </div>

                <div>
                    <label className={rotulo} htmlFor="assunto">Assunto</label>
                    <input id="assunto" className={campo} maxLength={160} value={data.assunto} onChange={(e) => setData('assunto', e.target.value)} />
                    {errors.assunto && <p className={erroTexto}>{errors.assunto}</p>}
                </div>

                <div>
                    <label className={rotulo} htmlFor="contexto">Contexto</label>
                    <textarea id="contexto" rows={4} maxLength={5000} className={campo} value={data.contexto} onChange={(e) => setData('contexto', e.target.value)} />
                    {errors.contexto && <p className={erroTexto}>{errors.contexto}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className={rotulo} htmlFor="publicar">Publicar em</label>
                        <input id="publicar" type="date" className={campo} value={data.publicar_em} onChange={(e) => setData('publicar_em', e.target.value)} />
                        {errors.publicar_em && <p className={erroTexto}>{errors.publicar_em}</p>}
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="evento">Data do evento</label>
                        <input id="evento" type="date" className={campo} value={data.data_evento} onChange={(e) => setData('data_evento', e.target.value)} />
                        {errors.data_evento && <p className={erroTexto}>{errors.data_evento}</p>}
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="inicio">Hora de início</label>
                        <input id="inicio" type="time" className={campo} value={data.hora_inicio} onChange={(e) => setData('hora_inicio', e.target.value)} />
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="fim">Hora de fim</label>
                        <input id="fim" type="time" className={campo} value={data.hora_fim} onChange={(e) => setData('hora_fim', e.target.value)} />
                    </div>
                </div>

                <div>
                    <label className={rotulo} htmlFor="local">Local</label>
                    <input id="local" className={campo} maxLength={160} value={data.local} onChange={(e) => setData('local', e.target.value)} />
                </div>

                <div>
                    <span className={rotulo}>Itens</span>
                    <div className="overflow-hidden rounded-xl border border-[#E3E6EA]">
                        {data.itens.map((t, i) => (
                            <div key={i} className="flex items-center gap-1 border-b border-[#E3E6EA] p-1.5">
                                <input aria-label={`Item ${i + 1}`} className={`${campo} border-0`} maxLength={300} value={t} onChange={(e) => setItem(i, e.target.value)} />
                                <button type="button" onClick={() => mover(i, -1)} aria-label="Subir" className="p-1.5 text-[#5E6877]"><ArrowUp size={16} /></button>
                                <button type="button" onClick={() => mover(i, 1)} aria-label="Descer" className="p-1.5 text-[#5E6877]"><ArrowDown size={16} /></button>
                                <button type="button" onClick={() => remover(i)} aria-label="Remover" className="p-1.5 text-[#A93636]"><X size={16} /></button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setData('itens', [...data.itens, ''])}
                            disabled={data.itens.length >= 30}
                            className="flex w-full items-center gap-1.5 px-3 py-2.5 text-sm font-medium text-[#1F3A5F]"
                        >
                            <Plus size={15} /> Adicionar item
                        </button>
                    </div>
                    {errosItens.map(([k, msg]) => <p key={k} className={erroTexto}>{msg}</p>)}
                </div>

                <label className="flex items-center gap-3 rounded-xl border border-[#E6D3A0] bg-[#F6ECD3] p-3">
                    <input type="checkbox" className="h-5 w-5" checked={data.anunciar_na_missa} onChange={(e) => setData('anunciar_na_missa', e.target.checked)} />
                    <span>
                        <span className="block text-sm font-medium">Anunciar na missa</span>
                        <span className="block text-xs text-[#6B5A2B]">Desmarcado: só aparece na plataforma</span>
                    </span>
                </label>

                <div className="flex flex-wrap gap-2">
                    <button type="button" className={`${botao} flex-1`} disabled={f.processing} onClick={() => guardar('rascunho')}>Guardar rascunho</button>
                    <a
                        className={`${botao} flex-1 !border-[#25D366] !bg-[#25D366] !text-[#073B1B]`}
                        href={`https://wa.me/${WHATSAPP.replace(/\D/g, '')}?text=${encodeURIComponent(textoWhatsApp)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <MessageCircle size={16} /> WhatsApp
                    </a>
                </div>
                <button type="submit" className={`${botaoPrimario} w-full`} disabled={f.processing}>Publicar aviso</button>
                <Link href="/admin/avisos" className="block text-center text-sm text-[#5E6877]">Cancelar</Link>
            </form>
        </AdminLayout>
    );
}
