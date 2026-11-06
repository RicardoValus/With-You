Estou começando um projeto novo neste repositório vazio. O arquivo `ARQUITETURA.md`, na raiz do repo, é a especificação completa — leia ele inteiro antes de escrever qualquer código e siga exatamente a stack, a estrutura de pastas e o modelo de dados definidos lá.

Contexto rápido: é um contador de tempo (anos/meses/dias/horas/minutos/segundos) desde 05/11/2026 12:36, com uma frase, uma galeria de fotos e um player de música, e um painel admin protegido por senha pra editar tudo isso. Stack: Ionic + Angular + Capacitor, Angular Material (nada de componentes visuais do Ionic), dados e arquivos no Vercel Blob, escrita protegida por Vercel Functions — sem Firebase.

Quero que você trabalhe em etapas, me mostrando o resultado de cada uma antes de passar pra próxima:

1. **Scaffold inicial** — criar o projeto Ionic+Angular+Capacitor, adicionar Angular Material, configurar a estrutura de pastas da seção 4 da arquitetura, remover o que não for usado do Ionic visual.
2. **Tela Home (estática)** — montar o layout da seção 7.1 com dados mockados (sem API ainda): grid do contador funcionando de verdade com `date-fns`, frase, foto de fundo, player de música, responsivo mobile/desktop conforme a seção 8.
3. **Camada de dados** — criar as três Vercel Functions (`/api/login`, `/api/content`, `/api/gallery`) conforme a seção 5 e 6, com o `content.json` inicial de exemplo pra testar local com `vercel dev`.
4. **Ligar a Home nos dados reais** — trocar o mock pelo `content.service.ts` consumindo `/api/content`.
5. **Galeria** — grid + lightbox (seção 7.2).
6. **Admin** — login por senha (seção 6), edição de título/frase/data, upload e remoção de fotos, upload/troca de música (seção 7.3).
7. **Deploy** — `vercel.json`, lista do que precisa ser configurado como variável de ambiente na Vercel antes do primeiro deploy.

Algumas regras importantes:
- Nunca commitar a senha ou qualquer segredo — tudo via variável de ambiente, com um `.env.example` mostrando os nomes esperados (`ADMIN_PASSWORD`, `AUTH_SECRET`, `BLOB_READ_WRITE_TOKEN`).
- Usar standalone components e signals do Angular (nada de NgModules desnecessários).
- Todo componente de UI vem do Angular Material — se precisar de algo que o Material não tem, construir manual com Angular CDK, não usar `ion-*`.
- Código em TypeScript estrito, sem `any` desnecessário.
- Comentários e nomes de variáveis em português, já que é só eu que vou mexer nisso.

Pode começar pela etapa 1. Me avise quando terminar cada etapa antes de seguir pra próxima.
