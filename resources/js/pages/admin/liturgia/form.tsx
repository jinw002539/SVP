import AdminLayout from '@/layouts/admin-layout';
import { dataLonga } from '@/lib/format';
import { botao, botaoPrimario, campo, erroTexto, rotulo } from '@/lib/ui';
import { Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';

type Leitura = { referencia: string | null; texto: string };
type Dia = {
    id: number;
    celebracao: string | null;
    santo_nome: string | null;
    santo_historia: string | null;
    santo_link: string | null;
    foto: string | null;
    leituras: Partial<Record<Tipo, Leitura>>;
};
type Tipo = 'primeira' | 'salmo' | 'segunda' | 'evangelho';
type Props = {
    dia: Dia | null;
    data: string;
    automatico: { leituras: string[]; santo: string | null; celebracao: string | null } | null;
};

const TIPOS: { tipo: Tipo; rotulo: string }[] = [
    { tipo: 'primeira', rotulo: '1.ª leitura' },
    { tipo: 'salmo', rotulo: 'Salmo' },
    { tipo: 'segunda', rotulo: '2.ª leitura' },
    { tipo: 'evangelho', rotulo: 'Evangelho' },
];

export default function Form({ dia, data, automatico }: Props) {
    const f = useForm({
        data,
        celebracao: dia?.celebracao ?? '',
        santo_nome: dia?.santo_nome ?? '',
        santo_historia: dia?.santo_historia ?? '',
        santo_link: dia?.santo_link ?? '',
        foto: null as File | null,
        remover_foto: false,
        leituras: {
            primeira: { referencia: dia?.leituras.primeira?.referencia ?? '', texto: dia?.leituras.primeira?.texto ?? '' },
            salmo: { referencia: dia?.leituras.salmo?.referencia ?? '', texto: dia?.leituras.salmo?.texto ?? '' },
            segunda: { referencia: dia?.leituras.segunda?.referencia ?? '', texto: dia?.leituras.segunda?.texto ?? '' },
            evangelho: { referencia: dia?.leituras.evangelho?.referencia ?? '', texto: dia?.leituras.evangelho?.texto ?? '' },
        },
    });
    const { data: d, setData, errors } = f;

    const setLeitura = (tipo: Tipo, campoNome: 'referencia' | 'texto', valor: string) =>
        setData('leituras', { ...d.leituras, [tipo]: { ...d.leituras[tipo], [campoNome]: valor } });

    const guardar = (e: FormEvent) => {
        e.preventDefault();
        if (dia) {
            // PUT com ficheiro: o Laravel lê o método em _method.
            f.transform((x) => ({ ...x, _method: 'put' }));
            f.post(`/admin/liturgia/${dia.id}`, { forceFormData: true });
        } else {
            f.post('/admin/liturgia', { forceFormData: true });
        }
    };

    return (
        <AdminLayout titulo="Liturgia do dia">
            <form onSubmit={guardar} className="space-y-6">
                <div>
                    <h2 className="font-serif text-xl font-semibold">{dia ? 'Editar' : 'Preencher'}: {dataLonga(d.data)}</h2>
                    {automatico ? (
                        <p className="mt-1 rounded-xl bg-[#eaf1fa] px-3 py-2 text-xs text-[#1f3a5f]">
                            Já veio automaticamente: {automatico.leituras.length} de 4 leituras
                            {automatico.santo ? ` e o santo (${automatico.santo})` : ', sem santo'}. Preencha só o que falta ou o que estiver errado.
                        </p>
                    ) : (
                        <p className="mt-1 text-xs text-[#55657f]">Ainda não há dados automáticos guardados para este dia.</p>
                    )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className={rotulo} htmlFor="data">Dia</label>
                        <input id="data" type="date" className={campo} value={d.data} onChange={(e) => setData('data', e.target.value)} />
                        {errors.data && <p className={erroTexto}>{errors.data}</p>}
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="celebracao">Celebração (opcional)</label>
                        <input id="celebracao" className={campo} maxLength={160} placeholder="Ex.: 31.º Domingo do Tempo Comum" value={d.celebracao} onChange={(e) => setData('celebracao', e.target.value)} />
                    </div>
                </div>

                <fieldset className="space-y-4 rounded-2xl border border-[#e5e8ee] p-4">
                    <legend className="px-2 text-sm font-semibold">Santo do dia</legend>
                    <div>
                        <label className={rotulo} htmlFor="santo_nome">Nome</label>
                        <input id="santo_nome" className={campo} maxLength={160} placeholder="São Martinho de Porres, religioso" value={d.santo_nome} onChange={(e) => setData('santo_nome', e.target.value)} />
                        {errors.santo_nome && <p className={erroTexto}>{errors.santo_nome}</p>}
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="santo_historia">História (separe os parágrafos com uma linha em branco)</label>
                        <textarea id="santo_historia" rows={8} maxLength={8000} className={campo} value={d.santo_historia} onChange={(e) => setData('santo_historia', e.target.value)} />
                        {errors.santo_historia && <p className={erroTexto}>{errors.santo_historia}</p>}
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="santo_link">Ligação para saber mais (opcional, https)</label>
                        <input id="santo_link" inputMode="url" className={campo} maxLength={300} value={d.santo_link} onChange={(e) => setData('santo_link', e.target.value)} />
                        {errors.santo_link && <p className={erroTexto}>{errors.santo_link}</p>}
                    </div>
                    <div>
                        <label className={rotulo} htmlFor="foto">Imagem do santo (JPG, PNG ou WebP)</label>
                        {dia?.foto && !d.remover_foto && <img src={dia.foto} alt="" className="mb-2 h-32 w-24 rounded-xl border border-[#e5e8ee] object-cover" />}
                        <input id="foto" type="file" accept="image/jpeg,image/png,image/webp" className={campo} onChange={(e) => setData('foto', e.target.files?.[0] ?? null)} />
                        {errors.foto && <p className={erroTexto}>{errors.foto}</p>}
                        {dia?.foto && (
                            <label className="mt-2 flex items-center gap-2 text-sm text-[#55657f]">
                                <input type="checkbox" checked={d.remover_foto} onChange={(e) => setData('remover_foto', e.target.checked)} /> Remover a imagem atual
                            </label>
                        )}
                        <p className="mt-1 text-xs text-[#8190a8]">Use só imagens que pode publicar (por exemplo, de domínio público ou com licença livre).</p>
                    </div>
                </fieldset>

                {TIPOS.map(({ tipo, rotulo: nome }) => (
                    <fieldset key={tipo} className="space-y-3 rounded-2xl border border-[#e5e8ee] p-4">
                        <legend className="px-2 text-sm font-semibold">
                            {nome}
                            {automatico?.leituras.includes(tipo) && <span className="ml-2 rounded-full bg-[#e5f4ed] px-2 py-0.5 text-[11px] font-medium text-[#1f6b52]">já veio automático</span>}
                        </legend>
                        <div>
                            <label className={rotulo} htmlFor={`ref-${tipo}`}>Referência</label>
                            <input id={`ref-${tipo}`} className={campo} maxLength={60} placeholder="Ex.: Lc 14,15-24" value={d.leituras[tipo].referencia} onChange={(e) => setLeitura(tipo, 'referencia', e.target.value)} />
                        </div>
                        <div>
                            <label className={rotulo} htmlFor={`txt-${tipo}`}>Texto (deixe vazio para usar o automático)</label>
                            <textarea id={`txt-${tipo}`} rows={7} maxLength={20000} className={campo} value={d.leituras[tipo].texto} onChange={(e) => setLeitura(tipo, 'texto', e.target.value)} />
                            {errors[`leituras.${tipo}.texto` as keyof typeof errors] && <p className={erroTexto}>{errors[`leituras.${tipo}.texto` as keyof typeof errors]}</p>}
                        </div>
                    </fieldset>
                ))}

                <div className="flex gap-2">
                    <Link href="/admin/liturgia" className={`${botao} flex-1`}>Cancelar</Link>
                    <button type="submit" className={`${botaoPrimario} flex-1`} disabled={f.processing}>{f.processing ? 'A guardar…' : 'Guardar'}</button>
                </div>
            </form>
        </AdminLayout>
    );
}
