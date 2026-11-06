import { Head, Link, router, usePage } from '@inertiajs/react';
import '@fontsource-variable/fraunces';
import { BookOpen, Check, FileText, Image as ImageIcon, LogOut, Users } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import '../../css/igreja.css';

type Shared = {
    auth: { user: { name: string; role: string } };
    flash?: { success?: string | null };
};

export default function AdminLayout({ titulo, children }: PropsWithChildren<{ titulo: string }>) {
    const page = usePage<Shared>();
    const { auth, flash } = page.props;
    const caminho = page.url.split('?')[0];
    const admin = auth.user.role === 'admin';

    const itens = [
        { href: '/admin/avisos', label: 'Avisos', Icon: FileText },
        { href: '/admin/memorias', label: 'Memórias', Icon: ImageIcon },
        { href: '/admin/liturgia', label: 'Liturgia', Icon: BookOpen },
        ...(admin ? [{ href: '/admin/utilizadores', label: 'Utilizadores', Icon: Users }] : []),
    ];

    return (
        <>
            <Head title={`${titulo} · Painel`} />
            <div className="ig-admin text-[#1B2433]">
                <div className="ig-admin-bg" aria-hidden="true" />

                <header className="ig-admin-head">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h1 className="font-serif text-2xl font-semibold tracking-tight">Painel de gestão</h1>
                            <p className="text-xs text-[#55657f]">
                                {auth.user.name} · {admin ? 'Administrador' : 'Editor'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href="/" className="ig-admin-link">Ver site</Link>
                            <button type="button" onClick={() => router.post('/logout')} className="ig-admin-link">
                                <LogOut size={14} /> Sair
                            </button>
                        </div>
                    </div>
                    <nav className="mt-5 flex gap-2 overflow-x-auto pb-1" aria-label="Painel">
                        {itens.map(({ href, label, Icon }) => (
                            <Link key={href} href={href} className={`ig-admin-link ${caminho.startsWith(href) ? 'is-on' : ''}`}>
                                <Icon size={15} /> {label}
                            </Link>
                        ))}
                    </nav>
                </header>

                <div className="ig-admin-sheet">
                    {flash?.success && (
                        <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl bg-[#E1F0E8] px-4 py-2.5 text-sm text-[#2F6B4F]" role="status">
                            <Check size={16} /> {flash.success}
                        </div>
                    )}
                    <main className="px-5 pb-6 pt-6">{children}</main>
                </div>
            </div>
        </>
    );
}
