const MESES_CURTOS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];

const pad = (n: number) => String(n).padStart(2, '0');

/** Converte "2026-10-24" em Date local (sem saltos de fuso horário). */
export function parse(iso: string): Date {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d);
}

export const hoje = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const mesCurto = (iso: string) => MESES_CURTOS[parse(iso).getMonth()];
export const dia = (iso: string) => pad(parse(iso).getDate());
const cap = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);

export const nomeMes = (ano: number, mes: number) => cap(`${MESES[mes - 1]} de ${ano}`);
export const mesIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export function dataLonga(iso: string): string {
    const d = parse(iso);
    return cap(`${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`);
}

export function horario(inicio: string | null, fim: string | null): string | null {
    if (!inicio) return null;
    const h = (t: string) => (t.endsWith(':00') ? `${Number(t.slice(0, 2))}h` : `${Number(t.slice(0, 2))}h${t.slice(3, 5)}`);
    return fim ? `${h(inicio)} às ${h(fim)}` : h(inicio);
}

export function haQuanto(iso: string): string {
    const dias = Math.round((parse(hoje()).getTime() - parse(iso).getTime()) / 86_400_000);
    if (dias <= 0) return 'hoje';
    if (dias === 1) return 'ontem';
    if (dias < 7) return `há ${dias} dias`;
    const sem = Math.floor(dias / 7);
    if (dias < 30) return `há ${sem} ${sem === 1 ? 'semana' : 'semanas'}`;
    return `${parse(iso).getDate()} ${MESES_CURTOS[parse(iso).getMonth()].toLowerCase()} ${parse(iso).getFullYear()}`;
}
