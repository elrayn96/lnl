# Link&Live

O frontend foi migrado para React + Vite. O Spring Boot continua responsável por
sessões anónimas, persistência, salas, WebSocket/STOMP, sinalização WebRTC e anúncios.

## Desenvolvimento

Pré-requisitos: Java 17+, Node.js 20+ e PostgreSQL configurado.

1. Inicie o backend:
   `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
2. Noutro terminal:
   `cd frontend`
3. Instale e inicie:
   `npm install`
   `npm run dev`
4. Abra `http://localhost:5173`.

O Vite encaminha `/api` e `/ws` para `http://localhost:8080` e envia cookies de
sessão. Para outro backend, defina `VITE_API_BASE_URL`.

## Deploy no Render

O repositório inclui um Blueprint em `render.yaml` e um Dockerfile multi-stage.

1. Envie o repositório para GitHub, GitLab ou Bitbucket.
2. No Render escolha **New → Blueprint**.
3. Ligue o repositório e seleccione o `render.yaml`.
4. Confirme os recursos e clique em **Apply**.

O Blueprint cria o PostgreSQL e um único serviço web. Durante o deploy, o
Dockerfile compila o React, empacota o Spring Boot e inicia a aplicação na porta
fornecida pelo Render. Não crie um Static Site separado.

No plano gratuito, o primeiro acesso depois de algum tempo sem tráfego pode ser
mais lento devido ao cold start do Render.

## Produção manual

Execute `cd frontend && npm ci && npm run build`. O resultado é colocado em
`src/main/resources/static/app`. Depois execute `mvnw.cmd clean package` e inicie
o JAR em `target/`. As rotas React são encaminhadas pelo `HomeController`.

Para ligações fora de redes simples, configure:

- `VITE_TURN_URL`
- `VITE_TURN_USERNAME`
- `VITE_TURN_CREDENTIAL`

Sem essas variáveis, o cliente usa somente o STUN público e não expõe credenciais
TURN no código-fonte.

## Contratos mantidos

- SockJS/STOMP: `/ws`
- Sala: publica em `/app/room.message`; subscreve
  `/topic/room/{uuid}/messages`
- Vídeo: `/app/get-session-id`, `/app/video.join`, `/app/video.signal`;
  tópicos `/topic/welcome-ack`, `/topic/pair/{sessionId}` e
  `/topic/signal/{sessionId}`
- Anúncios: `POST /api/ad/impression`

Foi adicionada uma camada REST fina em `FrontendApiController` para React:
`/api/users/anonymous`, `/api/video/session`, `/api/rooms` e `/api/reports`.
Nenhuma entidade, tabela ou regra de negócio existente foi removida.

O endpoint de denúncia guarda um registo de auditoria no servidor. O backend
original não associa o ID efémero do socket WebRTC a um `AppUser`; por isso não
inventa um utilizador denunciado nem grava uma relação incorrecta no banco.
