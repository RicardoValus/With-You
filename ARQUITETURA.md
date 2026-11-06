# Contador — Arquitetura Técnica

> App web mobile-first (com cara de app nativo) que mostra, desde 05/11/2026 às 12:36, há quanto tempo vocês se conhecem — com frase personalizada, galeria de fotos e player de música, tudo editável por trás de uma senha. Ainda não é “juntos”: o tom é de se conhecendo.

## 1. Visão geral

- **Tela pública:** contador ao vivo (anos / meses / dias / horas / minutos / segundos), frase, foto de fundo, player de música, galeria.
- **Área protegida (senha `Freya`):** trocar a frase/título, subir ou remover fotos, subir ou trocar a música atual.
- **Sem instalação de app de verdade necessária:** é uma PWA/web app responsiva; o Capacitor fica pronto na estrutura caso você queira empacotar pra Android/iOS depois, mas não é obrigatório agora.

## 2. Direção de design (misturando as duas referências)

| Da imagem 1 (mockup do celular) | Da imagem 2 (card "Canım Sevgilim") |
|---|---|
| Foto de fundo do casal com overlay escuro | Ícone de coração no topo |
| Grid 3×2 de caixas (anos/meses/dias/horas/min/seg) | Citação em itálico abaixo do título |
| Tipografia script para o título | Player de música com barra de progresso |
| Visual de "card de celular" centralizado | Botão "Sana bir sürprizim var!" → aqui vira botão de surpresa/coração |

**Proposta de fusão:** tema escuro, foto de fundo (a que você marcar como capa na galeria) com overlay, coração pulsando no topo, título em fonte script, frase em itálico, grid de 6 caixas translúcidas estilo "glassmorphism", player de música compacto embaixo, e um botão de coração que abre a galeria em tela cheia.

Paleta sugerida: tema escuro com base em **roxo** (ela ama roxo) — overlay em vinho/púrpura sobre a foto, acentos em lilás/rosa-roxo e detalhes dourados suaves. Evitar o “roxo genérico de IA” (neon purple-on-white); preferir tons quentes e profundos (`#2D1B4E`, `#5B2C6F`, `#9B59B6`) com highlight `#C39BD3` / `#E8DAEF`. Fonte script: `Great Vibes` ou `Dancing Script` (Google Fonts) pro título; `Poppins` pro resto.

## 3. Stack tecnológica

- **Ionic 8 + Angular 22** (standalone components, signals) — Capacitor 8 incluído desde o início, mas build web é o alvo imediato.
- **Angular Material + Angular CDK** para TODOS os componentes de UI (`mat-button`, `mat-card`, `mat-dialog`, `mat-form-field`, `mat-snack-bar`, `BreakpointObserver`). Não usar os componentes do Ionic (`ion-button`, `ion-card`, `ion-input` etc.) — manter só `ion-app` / roteamento, se necessário.
- **Hospedagem/dados: Vercel, sem Firebase.** Em vez de Firebase, uso 100% do ecossistema Vercel:
  - **Vercel Blob** — guarda os arquivos (fotos, áudio) e um `content.json` com os dados editáveis.
  - **Vercel Functions** (pasta `/api`, TypeScript) — rotas serverless pra login e pras operações que escrevem dado (upload, remoção, edição), validando a senha no servidor.
- Isso evita criar um projeto Firebase à parte e mantém tudo num único provedor/deploy. Se no futuro você preferir Firebase (ex.: quiser app mobile offline-first com Capacitor "de verdade"), a troca é só na camada de dados — ver seção 11.

## 4. Estrutura de pastas

```
contador-app/
├── api/                              # Vercel Functions (Node/TS)
│   ├── login.ts                      # POST — valida senha, devolve token assinado
│   ├── content.ts                    # GET (público) / PUT (protegido) — título, frase, data, música
│   └── gallery.ts                    # POST (upload) / DELETE (remover) — protegido
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── content.service.ts     # busca/edita content.json via /api/content
│   │   │   │   ├── auth.service.ts        # login, guarda token em sessionStorage
│   │   │   │   └── gallery.service.ts     # upload/remoção de fotos via /api/gallery
│   │   │   └── models/
│   │   │       └── content.model.ts
│   │   ├── features/
│   │   │   ├── home/                      # tela pública principal
│   │   │   ├── gallery/                   # galeria em tela cheia (lightbox)
│   │   │   └── admin/                     # painel protegido por senha
│   │   ├── shared/components/
│   │   │   ├── counter-grid/              # as 6 caixas do contador
│   │   │   ├── music-player/
│   │   │   ├── password-dialog/
│   │   │   └── heart-button/
│   │   ├── app.routes.ts
│   │   └── app.config.ts
│   ├── theme/variables.scss
│   └── assets/
├── capacitor.config.ts
├── vercel.json
├── angular.json
└── package.json
```

## 5. Modelo de dados

Um único arquivo `content.json` dentro do Vercel Blob guarda tudo que é editável:

```json
{
  "startDate": "2026-11-05T12:36:00-03:00",
  "title": "Desde que te conheci",
  "phrase": "que cabelo lindo, amei seus cachos",
  "coverImageId": "img_01",
  "music": { "url": "https://.../musica.mp3", "name": "Nome da música" },
  "gallery": [
    { "id": "img_01", "url": "https://.../foto1.jpg", "uploadedAt": "2026-11-06T10:00:00-03:00" }
  ]
}
```

- Leitura (`GET /api/content`) é pública — qualquer um com o link vê o contador.
- Escrita (`PUT /api/content`, `POST/DELETE /api/gallery`) exige o header `Authorization: Bearer <token>` gerado no login.

## 6. Autenticação (senha `Freya`)

1. Senha fica só no servidor, como variável de ambiente da Vercel: `ADMIN_PASSWORD=Freya` (nunca commitada no repo).
2. `POST /api/login { password }` → a function compara com `process.env.ADMIN_PASSWORD` e, se bater, devolve um token assinado (HMAC com outra env var `AUTH_SECRET`) com validade de algumas horas.
3. O front guarda o token em `sessionStorage` e manda em toda chamada que edita dado.
4. As functions de escrita sempre revalidam o token — a senha nunca fica exposta no bundle do front (diferente de uma checagem só client-side).

## 7. Funcionalidades

### 7.1 Home (pública)
- Contador ao vivo desde `startDate`, recalculado a cada segundo (RxJS `interval` ou `setInterval` + signal).
- Cálculo de "anos/meses/dias" com diferença de calendário de verdade (não só dividir milissegundos) — usar `date-fns` (`differenceInYears`, depois `differenceInMonths` no resto, etc.).
- Frase + título vindos de `content.json`.
- Foto de capa como fundo, com overlay escuro em gradiente.
- Player de música (se `music` existir): play/pause, barra de progresso, usando `<audio>` nativo controlado por Angular.
- Botão de coração → abre a galeria.

### 7.2 Galeria
- Grid responsivo das fotos de `gallery`, lightbox ao clicar (ex.: `mat-dialog` fullscreen).

### 7.3 Admin (atrás da senha)
- Tela de login (campo de senha).
- Editar título/frase/data.
- Upload de foto (manda pro `/api/gallery`, que sobe pro Blob e atualiza `content.json`) e exclusão.
- Marcar foto como capa.
- Upload/troca da música atual (mesmo fluxo, aceitando `.mp3`).

## 8. Responsividade (mobile-first + web desktop)

- Mobile: ocupa a tela inteira, como um app.
- Desktop (`min-width: 768px` via `BreakpointObserver` do CDK): container centralizado, `max-width: 420px`, cantos arredondados e sombra — simulando o "card de celular" da imagem 1, com o fundo da página (fora do card) em gradiente suave como na imagem 2.

## 9. Deploy (Vercel)

- Build do Angular: `ng build --configuration production`, output em `dist/contador-app/browser`.
- `vercel.json`:
  ```json
  {
    "rewrites": [
      { "source": "/api/(.*)", "destination": "/api/$1" },
      { "source": "/(.*)", "destination": "/index.html" }
    ]
  }
  ```
- Variáveis de ambiente na Vercel (não no repo): `ADMIN_PASSWORD`, `AUTH_SECRET`, token do Vercel Blob (`BLOB_READ_WRITE_TOKEN`, gerado automaticamente ao criar o Blob store no painel da Vercel).

## 10. Checklist de setup (resumo pro Cursor seguir)

1. `npm create vite@latest` descartado — usar `ionic start contador-app blank --type=angular --capacitor` (ou `ng new` + adicionar Capacitor manualmente).
2. Adicionar `@angular/material @angular/cdk`, rodar `ng add @angular/material`.
3. Remover dependência visual do `@ionic/angular` (manter só o necessário pro Capacitor funcionar).
4. Instalar `@vercel/blob` e `date-fns`.
5. Criar as três functions em `/api`.
6. Implementar serviços, componentes e rotas conforme a seção 4.
7. Criar `content.json` inicial no Blob (pode ser via um script `scripts/seed.ts` rodado uma vez).
8. Testar local (`vercel dev` roda front + functions juntos).
9. Configurar `vercel.json` e variáveis de ambiente, fazer o deploy.

## 11. Alternativa B — Firebase (se preferir no futuro)

Caso em algum momento prefira Firebase em vez do Vercel Blob/Functions (ex.: quiser sincronização offline ou um app mobile "de verdade" via Capacitor com cache local):
- Trocar `content.json` por um documento no **Firestore** (`config/content`).
- Trocar o Blob por **Firebase Storage** (fotos e música).
- Login continua igual (senha validada numa Cloud Function, não client-side) pra não expor a senha no bundle.
- Todo o resto (componentes, grid do contador, player) não muda — só a camada `content.service.ts` / `gallery.service.ts`.
