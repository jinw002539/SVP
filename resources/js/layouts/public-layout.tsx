import { dataLonga, hoje } from '@/lib/format';
import { Head, Link, usePage } from '@inertiajs/react';
import { Archive, CalendarDays, Church, Home, Image as ImageIcon, Lock } from 'lucide-react';
import type { PropsWithChildren } from 'react';

const NAV = [
    { href: '/', label: 'Início', Icon: Home },
    { href: '/calendario', label: 'Calendário', Icon: CalendarDays },
    { href: '/memorias', label: 'Memórias', Icon: ImageIcon },
    { href: '/arquivo', label: 'Arquivo', Icon: Archive },
];

type Props = PropsWithChildren<{ titulo: string; subtitulo?: string }>;

export default function PublicLayout({ titulo, subtitulo, children }: Props) {
    const page = usePage<{ auth?: { user?: unknown } }>();
    const caminho = page.url.split('?')[0];
    const autenticado = Boolean(page.props.auth?.user);
    const ativo = (href: string) => (href === '/' ? caminho === '/' : caminho.startsWith(href));

    return (
        <>
            <Head title={titulo} />
            <div className="mx-auto min-h-screen max-w-xl bg-[#F7F8FA] pb-24 text-[#1B2433]">
                <header className="bg-[#1F3A5F] px-5 pb-4 pt-5 text-white">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B8892B]">
                            <Church size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h1 className="font-serif text-base font-semibold leading-tight">Comunidade São Vicente de Paulo</h1>
                            <p className="text-xs opacity-80">{subtitulo ?? dataLonga(hoje())}</p>
                        </div>
                        <Link
                            href={autenticado ? '/admin/avisos' : '/login'}
                            className="flex items-center gap-1 rounded-full border border-white/30 px-3 py-1.5 text-xs"
                        >
                            <Lock size={13} /> {autenticado ? 'Painel' : 'Área restrita'}
                        </Link>
                    </div>
                </header>

                <main>{children}</main>

                <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-xl justify-around border-t border-[#E3E6EA] bg-white pb-3 pt-2">
                    {NAV.map(({ href, label, Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex flex-col items-center gap-0.5 text-[11px] ${ativo(href) ? 'font-semibold text-[#1F3A5F]' : 'text-[#5E6877]'}`}
                        >
                            <Icon size={22} />
                            {label}
                        </Link>
                    ))}
                </nav>
            </div>
        </>
    );
}
