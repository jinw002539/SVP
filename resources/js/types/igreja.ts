export type Categoria = { slug: string; nome: string; cor: string };

export type Aviso = {
    id: number;
    assunto: string;
    contexto: string;
    categoria: Categoria;
    publicar_em: string;
    data_evento: string | null;
    hora_inicio: string | null;
    hora_fim: string | null;
    local: string | null;
    anunciar_na_missa: boolean;
    itens: string[];
};

export type Memoria = {
    id: number;
    titulo: string;
    data_celebracao: string;
    tipo: 'foto' | 'video';
    url: string | null;
    youtube_id: string | null;
};

export type Paginado<T> = {
    data: T[];
    next_page_url: string | null;
    prev_page_url: string | null;
};

/* ---------- Liturgia do dia ---------- */
export type Leitura = {
    tipo: 'primeira' | 'salmo' | 'segunda' | 'evangelho';
    rotulo: string;
    referencia: string | null;
    texto: string;
};

export type Santo = {
    nome: string;
    resumo: string | null;
    historia: string[];
    foto: string | null;
    link: string | null;
};

export type Liturgia = {
    data: string;
    celebracao: string | null;
    santo: Santo | null;
    leituras: Leitura[];
    links: { palavra: string; santo: string };
    completo: boolean;
};
