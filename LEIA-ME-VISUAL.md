# Novo visual: "Luz de Vitral"

Fundo WebGL (shader), animações guiadas pelo scroll e microanimações. As funcionalidades não mudam.

## Instalar
1. Na pasta do projeto (`igreja_avisos`), instala a fonte dos títulos (é local, sem pedidos externos):
   ```
   npm install @fontsource-variable/fraunces
   ```
2. Copia o conteúdo desta pasta por cima do projeto (substitui os ficheiros com o mesmo nome).
   Isto inclui o `resources/js/app.tsx`: se tiveres alterado esse ficheiro depois da última vez, compara antes.
3. Apaga o ficheiro antigo, que já não é usado:
   ```
   rm resources/js/layouts/public-layout.tsx
   ```
4. Corre:
   ```
   npx tsc --noEmit
   npm run build
   composer run dev
   ```

## O que mudou
- `layouts/public-shell.tsx` — layout persistente: o fundo WebGL nunca reinicia ao navegar; o cabeçalho encolhe entre "início" e as outras páginas; a barra de navegação tem um indicador que desliza.
- `components/igreja/shader-background.tsx` — o fundo WebGL.
- `lib/motion.ts` — um único ouvinte de scroll e de rato (paralaxe, barra de leitura, brilho que segue o cursor).
- `css/igreja.css` — todo o estilo (cores e animações no topo do ficheiro).
- `pages/public/*` — páginas públicas redesenhadas.
- `layouts/admin-layout.tsx` e `lib/ui.ts` — painel com cabeçalho em aurora e botões/campos animados.

## Pensado para dados móveis e bateria
- O shader desenha a ~50% da resolução, a ~30 fps, e pára quando o separador está escondido.
- Com "reduzir movimento" no telemóvel, fica um fundo estático e sem animações.
- Com "poupar dados" ligado, não usa WebGL (fica o gradiente CSS).
- Se o WebGL falhar, fica o gradiente CSS por baixo.
- A segurança não muda: a política CSP e o PWA continuam a funcionar.

## Para mexer no estilo
- Cores: variáveis `--ig-*` no início de `igreja.css`.
- Cores do fundo animado: `deep`, `blue`, `teal` e `gold` dentro do `FRAG` em `shader-background.tsx`.
- Velocidade: `u_time * 0.055` no mesmo ficheiro (mais baixo = mais lento).
