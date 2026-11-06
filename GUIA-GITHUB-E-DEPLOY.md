# Do teu computador ao GitHub e à internet

## 1. Antes de enviar: segurança (2 minutos)
O GitHub guarda o histórico para sempre. Se uma palavra-passe entrar uma vez, considera-a perdida.
```
cd ~/Trojan/SVP/igreja_avisos
git status                       # se já for um repositório; senão passa ao ponto 2
git ls-files | grep -E '(^|/)\.env$' && echo "PERIGO: .env está no git" || echo "ok: .env fora do git"
grep -nE "^/?\.env$|vendor|node_modules|public/build" .gitignore    # o Laravel já ignora estes
```
Acrescenta ao `.gitignore` (se ainda não estiver):
```
/public/uploads/*
!/public/uploads/.htaccess
/storage/*.key
```
**Se alguma vez enviares o `.env` por engano:** muda já a palavra-passe da base de dados e gera nova `APP_KEY`
(`php artisan key:generate`), e só depois limpa o histórico. Apagar o ficheiro num commit novo não chega.

## 2. Criar o repositório e enviar
Cria o repositório **privado** no GitHub (New repository > "igreja-avisos" > Private, sem README). Depois:
```
git init -b main                               # ignora se já existir
git add .
git status                                     # confirma que NÃO aparece .env nem vendor
git commit -m "Sistema de avisos da comunidade"
git remote add origin git@github.com:O_TEU_UTILIZADOR/igreja-avisos.git
git push -u origin main
```
(Com HTTPS em vez de SSH, usa o endereço `https://github.com/...` e um *token* no lugar da palavra-passe. Alternativa: `gh auth login` e `gh repo create igreja-avisos --private --source=. --push`.)
A partir daqui, cada alteração é: `git add . && git commit -m "o que mudou" && git push`.

## 3. Onde hospedar, ligado ao GitHub (honesto, com o que existe hoje)
| Opção | Custo | Ligação ao GitHub | Pontos de atenção |
|---|---|---|---|
| **Render (gratuito)** | 0 | sim, deploy automático | precisa de Docker (já vai no kit); **adormece** após 15 min sem visitas (1.ª visita demora até ~1 min); **o disco é apagado a cada deploy**, por isso as fotos têm de ir para um bucket (passo 5); sem consola no plano gratuito |
| **Laravel Cloud** | cerca de 5 USD/mês (1.º mês grátis) | sim | o mais simples, sem Docker; também sem disco permanente (fotos em bucket) |
| **VM Oracle "Always Free"** | 0 | com GitHub Actions | grátis a sério e com disco, mas pede cartão para registar e dá mais trabalho a gerir |
| InfinityFree | 0 | **não** | sem Git nem terminal; já o discutimos |

Escolhi o **Render** para o passo a passo porque é gratuito e liga ao GitHub. Confirma os limites no site deles antes de decidir:
os planos gratuitos mudam com frequência.

## 4. Base de dados gratuita onde podes mexer nas tabelas
- **Aiven for MySQL (recomendada):** MySQL a sério (igual ao teu computador), 1 GB, sem cartão e sem prazo. Limites: 76 ligações,
  e a Aiven pode **desligar** o serviço se não houver atividade (avisa antes; ligas de novo no painel). Exige ligação TLS (por isso o `ca.pem`).
- **TiDB Cloud Starter:** compatível com MySQL, sem servidor (escala a zero), tem consola SQL no browser e quota gratuita maior.
  Boa alternativa se a Aiven desligar demasiadas vezes.

**Como alterar tabelas quando quiseres:** o jeito certo é uma *migration* do Laravel
(`php artisan make:migration ...`), enviada para o GitHub: o deploy aplica-a sozinho e o teu computador fica igual ao servidor.
Para ver ou corrigir dados à mão, liga-te com o DBeaver ou o TablePlus usando os dados de ligação do painel (host, porta, utilizador, palavra-passe, `ca.pem`).

## 5. Fotos: bucket compatível com S3
Como o disco do Render é apagado, as fotos vão para um bucket externo: **Cloudflare R2**, **Backblaze B2** ou **Supabase Storage**
(todos falam S3; confirma o espaço grátis e se pedem cartão). Cria um bucket **com leitura pública** e anota:
chave, segredo, nome do bucket, *endpoint* e o endereço público (`UPLOADS_URL`).
No teu projeto, uma só vez:
```
composer require league/flysystem-aws-s3-v3 "^3.0"
sed -i 's#^\];#    App\\Providers\\UploadsDiskServiceProvider::class,\n];#' bootstrap/providers.php
tail -4 bootstrap/providers.php
```
(O kit já inclui o provider e a atualização do CSP para o domínio das fotos. No teu computador continua tudo a funcionar com a pasta local, porque `UPLOADS_DRIVER` só vale `s3` no Render.)

## 6. Publicar no Render
1. Cria a base de dados na Aiven, descarrega o `ca.pem` para `docker/ca.pem` do projeto e faz `git add docker/ca.pem`.
2. Copia o conteúdo desta pasta (`kit5`) por cima do projeto e corre `php artisan migrate` localmente (cria a tabela nova) e `npx tsc --noEmit`.
3. `git add . && git commit -m "Deploy" && git push`.
4. No Render: **New > Blueprint**, escolhe o repositório. Ele lê o `render.yaml`.
5. Preenche as variáveis marcadas (ver `.env.render.example`). `APP_KEY`: `php artisan key:generate --show` no teu computador.
   `APP_URL`: o endereço que o Render der.
6. No primeiro arranque as tabelas criam-se sozinhas (`AUTORUN_LARAVEL_MIGRATION`).
7. **Criar o administrador (uma vez, a partir do teu computador),** porque o plano gratuito não tem consola:
```
DB_CONNECTION=mysql DB_HOST=... DB_PORT=... DB_DATABASE=... DB_USERNAME=... DB_PASSWORD=... \
MYSQL_ATTR_SSL_CA=docker/ca.pem ADMIN_NAME="O Teu Nome" ADMIN_EMAIL=teu@email.com ADMIN_PASSWORD='uma-senha-forte' \
php artisan db:seed --force
```
8. Abre o endereço, entra em `/login` e ativa o 2FA na tua conta.
Depois disto, **cada `git push` para `main` faz deploy sozinho.**

Opcional: um serviço gratuito de monitorização que visite `/up` a cada 10 minutos evita a espera de "acordar" (vê os termos do Render).

## 7. O que NÃO consegui testar daqui
Não tenho Docker nem PHP neste ambiente. O `Dockerfile`, o `render.yaml` e o disco S3 seguem a documentação das imagens e do Laravel,
mas o primeiro deploy pode pedir pequenos ajustes. Se o build falhar, cola o final do log do Render e eu corrijo.

## 8. Liturgia à mão (novo)
No painel há agora o separador **Liturgia**: o editor escolhe o dia e escreve o santo (nome, história, imagem) e/ou as leituras.
O que preencher **substitui só esse campo** nesse dia; o resto continua automático. Para aplicar:
`php artisan migrate`, copiar o kit e `npm run build`.
