# Tema claro + "Hoje na Igreja" (santo do dia e leituras)

Parte do princípio de que já aplicaste o kit visual anterior (`igreja-visual-kit`). Este kit **substitui** vários ficheiros dele.

## 1. Copiar
Copia o conteúdo da pasta `kit3` por cima do projeto (substitui os ficheiros com o mesmo nome).
Não precisas de instalar mais nada com npm ou composer.

## 2. Registar a rota /hoje (um comando, em routes/web.php)
```
sed -i "\#Route::get('/calendario'#i\    Route::get('/hoje', [PublicController::class, 'hoje'])->name('hoje');" routes/web.php
php artisan route:list | grep hoje
```

## 3. Testar as fontes de conteúdo (importante)
O servidor vai buscar as leituras e o santo a serviços gratuitos. Eu não consegui testar essas ligações a partir do meu ambiente, por isso confirma no teu:
```
php artisan liturgia:testar
```
Deve listar a celebração, o santo, a foto e as 4 leituras com "OK: tudo obtido".
Se aparecer "Incompleto", cola-me o resultado e o final de `storage/logs/laravel.log` e eu ajusto o nome dos campos do feed.
O site nunca fica partido: sem fontes, aparecem botões que levam ao Vatican News.

## 4. Compilar e correr
```
php artisan test
npx tsc --noEmit
npm run build
composer run dev
```

## De onde vem o conteúdo (e os direitos)
- **Leituras e nome do santo:** feed gratuito do Evangelizo.org (a página mostra o crédito e a ligação).
- **História e foto do santo:** Wikipédia em português / Wikimedia Commons (licença CC BY-SA; a página mostra o crédito e leva ao artigo, onde estão os autores).
- **Vatican News:** só levamos o leitor até lá (ligações por data). Não copiamos os textos deles, que têm direitos reservados.
- A foto do santo é descarregada uma vez por dia, convertida para WebP e guardada em `public/uploads/santos/`. Fotos com mais de 14 dias são apagadas sozinhas.
- Se quiseres usar as leituras de forma permanente, convém escrever ao Evangelizo a avisar e a pedir autorização.

## Para mexer no estilo
- Cores: variáveis `--ig-*` no topo de `resources/css/igreja.css`.
- Fundo animado: `FRAG` em `shader-background.tsx` (cores `sky`, `gold`, `rose`, `mint`).
