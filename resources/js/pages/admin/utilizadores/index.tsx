import AdminLayout from '@/layouts/admin-layout';
import { botaoPrimario, campo, erroTexto, rotulo } from '@/lib/ui';
import { router, useForm } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import type { FormEvent } from 'react';

type U = { id: number; name: string; email: string; role: 'admin' | 'editor'; sou_eu: boolean };

export default function Index({ utilizadores }: { utilizadores: U[] }) {
    const f = useForm({ name: '', email: '', password: '', role: 'editor' });
    const { data, setData, errors } = f;

    const criar = (e: FormEvent) => {
        e.preventDefault();
        f.post('/admin/utilizadores', { preserveScroll: true, onSuccess: () => f.reset() });
    };

    const apagar = (u: U) => {
        if (confirm(`Remover o acesso de ${u.name}?`)) router.delete(`/admin/utilizadores/${u.id}`, { preserveScroll: true });
    };

    return (
        <AdminLayout titulo="Utilizadores">
            <div className="mb-6 overflow-hidden rounded-2xl border border-[#E3E6EA] bg-white">
                {utilizadores.map((u) => (
                    <div key={u.id} className="flex items-center gap-3 border-b border-[#E3E6EA] px-4 py-3 last:border-b-0">
                        <div className="min-w-0 flex-1">
                            <p className="font-medium">{u.name}{u.sou_eu && <span className="ml-2 text-xs text-[#5E6877]">(você)</span>}</p>
                            <p className="truncate text-xs text-[#5E6877]">{u.email}</p>
                        </div>
                        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${u.role === 'admin' ? 'bg-[#E8EEF6] text-[#1F3A5F]' : 'bg-[#F6ECD3] text-[#8A6516]'}`}>
                            {u.role === 'admin' ? 'Administrador' : 'Editor'}
                        </span>
                        {!u.sou_eu && (
                            <button type="button" onClick={() => apagar(u)} aria-label={`Remover ${u.name}`} className="p-2 text-[#A93636]"><Trash2 size={18} /></button>
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={criar} className="space-y-3 rounded-2xl border border-[#E3E6EA] bg-white p-4">
                <h2 className="font-serif text-lg font-semibold">Novo utilizador</h2>
                <div>
                    <label className={rotulo} htmlFor="nome">Nome</label>
                    <input id="nome" className={campo} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                    {errors.name && <p className={erroTexto}>{errors.name}</p>}
                </div>
                <div>
                    <label className={rotulo} htmlFor="email">Email</label>
                    <input id="email" type="email" autoComplete="off" className={campo} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                    {errors.email && <p className={erroTexto}>{errors.email}</p>}
                </div>
                <div>
                    <label className={rotulo} htmlFor="senha">Palavra-passe inicial</label>
                    <input id="senha" type="password" autoComplete="new-password" className={campo} value={data.password} onChange={(e) => setData('password', e.target.value)} />
                    {errors.password && <p className={erroTexto}>{errors.password}</p>}
                </div>
                <div>
                    <label className={rotulo} htmlFor="papel">Papel</label>
                    <select id="papel" className={campo} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                        <option value="editor">Editor (avisos e memórias)</option>
                        <option value="admin">Administrador (tudo + utilizadores)</option>
                    </select>
                </div>
                <button type="submit" className={`${botaoPrimario} w-full`} disabled={f.processing}>Criar utilizador</button>
            </form>
        </AdminLayout>
    );
}
