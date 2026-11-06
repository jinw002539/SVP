import ShaderBackground from '@/components/igreja/shader-background';
import { dataLonga, hoje } from '@/lib/format';
import { useGlobalMotion } from '@/lib/motion';
import { Link, usePage } from '@inertiajs/react';
import '@fontsource-variable/fraunces';
import { Archive, BookOpen, CalendarDays, Church, Home, Image as ImageIcon, Lock } from 'lucide-react';
import { useRef, type CSSProperties, type PropsWithChildren } from 'react';
import '../../css/igreja.css';

const NAV = [
    { href: '/', label: 'Início', titulo: 'Comunidade São Vicente de Paulo', curto: 'São Vicente de Paulo', Icon: Home },
    { href: '/hoje', label: 'Hoje', titulo: 'Hoje na Igreja', curto: 'Hoje na Igreja', Icon: BookOpen },
    { href: '/calendario', label: 'Calendário', titulo: 'Calendário', curto: 'Calendário', Icon: CalendarDays },
    { href: '/memorias', label: 'Memórias', titulo: 'Memórias', curto: 'Memórias', Icon: ImageIcon },
    { href: '/arquivo', label: 'Arquivo', titulo: 'Arquivo de avisos', curto: 'Arquivo', Icon: Archive },
];

/**
 * Layout PERSISTENTE das páginas públicas (registado em app.tsx).
 * O fundo WebGL nunca reinicia ao navegar; o cabeçalho anima entre "grande" (início)
 * e "compacto"; uma barra fina aparece no topo quando se desce a página.
 */
export default function PublicShell({ children }: PropsWithChildren) {
    const page = usePage<{ auth?: { user?: unknown } }>();
    const caminho = page.url.split('?')[0];
    const autenticado = Boolean(page.props.auth?.user);
    const indice = Math.max(
        0,
        NAV.findIndex((n) => (n.href === '/' ? caminho === '/' : caminho.startsWith(n.href))),
    );
    const compacto = caminho !== '/';

    const heroRef = useRef<HTMLElement>(null);
    const progressoRef = useRef<HTMLDivElement>(null);
    const barraRef = useRef<HTMLDivElement>(null);
    useGlobalMotion({ hero: heroRef, progress: progressoRef, bar: barraRef });

    return (
        <div className="ig-root">
            <div className="ig-bg" aria-hidden="true" />
            <ShaderBackground />
            <div className="ig-scrim" aria-hidden="true" />
            <div ref={progressoRef} className="ig-progress" aria-hidden="true" />

            <div ref={barraRef} className="ig-topbar" data-on="false">
                <span className="ig-orb"><Church size={16} /></span>
                <span className="ig-topbar-title">{NAV[indice].curto}</span>
                <Link href={autenticado ? '/admin/avisos' : '/login'} className="ig-pill" aria-label="Área restrita">
                    <Lock size={13} />
                </Link>
            </div>

            <header ref={heroRef} className="ig-hero" data-compact={compacto}>
                <div className="ig-hero-inner">
                    <div className="ig-top">
                        <div className="ig-brand">
                            <span className="ig-orb"><Church size={21} /></span>
                            <span className="ig-brand-name">São Vicente de Paulo</span>
                        </div>
                        <Link href={autenticado ? '/admin/avisos' : '/login'} className="ig-pill">
                            <Lock size={13} /> {autenticado ? 'Painel' : 'Área restrita'}
                        </Link>
                    </div>

                    <h1 className="ig-title">
                        <span key={caminho} className="ig-title-in">{NAV[indice].titulo}</span>
                    </h1>

                    <div className="ig-tag">
                        <div>
                            <p>Avisos, calendário e memórias da nossa comunidade.</p>
                            <span className="ig-live"><i /> {dataLonga(hoje())}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main key={page.url} className="ig-page" data-page={caminho}>{children}</main>

            <nav className="ig-nav" style={{ '--i': indice } as CSSProperties} aria-label="Principal">
                <span className="ig-nav-ind" aria-hidden="true" />
                {NAV.map(({ href, label, Icon }, i) => (
                    <Link key={href} href={href} aria-current={i === indice ? 'page' : undefined}>
                        <Icon size={21} />
                        {label}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
