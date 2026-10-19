# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Contexto

FlowSync es el proyecto de un ejercicio de curso (ver `README.md`, generado: no se edita a mano). Monorepo TypeScript con dos apps independientes, cada una con su propio `package.json` y `node_modules`:

- `backend/`: API REST en AdonisJS 7 (Lucid + SQLite, VineJS, auth por access tokens). **Ya existe y en este ejercicio no se modifica**: se lee para saber qué exige la API.
- `frontend/`: React 19 + Vite, todavía con la plantilla por defecto de Vite (sin router, sin shadcn/ui, sin tests; formateado con Prettier). Aquí se trabaja.

La documentación y los commits del repo están en español. Requiere **Node.js 24+** (con versiones anteriores falla con `Unknown file extension ".ts"`).

## Comandos

Backend (desde `backend/`):

```bash
npm install && cp .env.example .env && node ace generate:key && node ace migration:run   # primera vez
npm run dev          # node ace serve --hmr → http://localhost:3333
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm run format       # prettier (@adonisjs/prettier-config)
npm test             # node ace test (suites: unit, functional)
node ace test functional                              # una suite
node ace test --files tests/functional/auth.spec.ts   # un archivo
node ace test --tests "nombre del test"               # un test
node ace make:migration <nombre>                      # nunca editar tablas a mano
```

Todavía no hay ningún test: las suites buscan `tests/unit/**/*.spec.ts` y `tests/functional/**/*.spec.ts`. Los tests usan `.env.test` y el servidor HTTP se levanta solo para la suite `functional`.

Frontend (desde `frontend/`, en otra terminal):

```bash
npm install
npm run dev       # vite → http://localhost:5173
npm run build     # tsc -b && vite build
npm run lint      # oxlint
```

## Arquitectura del backend

Flujo de una petición: `start/routes.ts` → controlador (`app/controllers`) → validador VineJS (`app/validators`) → modelo Lucid (`app/models`) → transformer (`app/transformers`) → `ctx.serialize()`.

- **Imports por alias** (`#controllers/*`, `#models/*`, `#validators/*`, etc.), definidos en `imports` de `backend/package.json`, apuntando a `.js` aunque los fuentes sean `.ts`.
- **Archivos generados, no editar**: `backend/.adonisjs/**` (registro de controladores y rutas tipadas para Tuyau, regenerado por los hooks de `adonisrc.ts`) y `backend/database/schema.ts` (clases `*Schema` de columnas, regenerado por `node ace migration:run`). Los modelos extienden esas clases (`User extends compose(UserSchema, ...)`), así que las columnas salen de las migraciones, no se declaran en el modelo.
- Las rutas referencian controladores vía `controllers.X` de `#generated/controllers`, no con imports directos.
- **Respuestas envueltas en `data`**: `providers/api_provider.ts` añade `ctx.serialize()`, que devuelve `{ "data": ... }`. El transformer decide qué campos salen (el password nunca).
- `force_json_response_middleware` fuerza `Accept: application/json`, así que los errores también salen en JSON.
- **Auth**: guard por defecto `api` (tokens opacos con prefijo `oat_`, tabla `auth_access_tokens`). Se envían como `Authorization: Bearer <token>`. El guard `web` (sesión) existe pero no lo usa ninguna ruta.
- CORS: en desarrollo acepta cualquier origen (`config/cors.ts`).

### Contrato de la API de auth (prefijo `/api/v1`)

| Método y ruta | Auth | Body | Respuesta |
|---|---|---|---|
| `POST /auth/signup` | no | `fullName` (string o null), `email`, `password`, `passwordConfirmation` | `{ data: { user, token } }` |
| `POST /auth/login` | no | `email`, `password` | `{ data: { user, token } }` |
| `GET /account/profile` | token | — | `{ data: user }` |
| `POST /account/logout` | token | — | `{ message }` |

Reglas de `app/validators/user.ts` que un ticket de producto suele omitir: el signup **exige `passwordConfirmation`** igual a `password`; password de 8 a 32 caracteres; email válido, máx. 254 y único en `users`. `user` incluye `id`, `fullName`, `email`, `createdAt`, `updatedAt`, `initials`. Ante un fallo de validación (p. ej. email ya registrado) VineJS responde 422 con `{ errors: [{ field, rule, message }] }`; las credenciales inválidas en login lanzan `E_INVALID_CREDENTIALS`. Ante cualquier duda sobre la forma de los datos, el validador es la fuente de verdad.

## Frontend

- Lint con oxlint (`.oxlintrc.json`: `react/rules-of-hooks` es error). TypeScript estricto con `noUnusedLocals`/`noUnusedParameters`, `verbatimModuleSyntax` (usar `import type` para tipos) y `erasableSyntaxOnly` (sin `enum` ni parameter properties).
- shadcn/ui es la librería de componentes prevista: los componentes se copian al repo, no se instalan como dependencia.
- Prettier (`frontend/.prettierrc.json`: sin punto y coma, comillas simples). Un hook de `.claude/settings.json` formatea automáticamente cada archivo de `frontend/src/` que edita Claude Code, así que no hace falta ejecutar `npm run format` a mano ni formatear otros directorios.

## Reglas de proceso

### Cuándo se aplican

Solo cuando hay una **orden de implementar**: un plan aprobado en `ExitPlanMode` (por ejemplo, en la fase 4 de `/priority-ticket`) o una petición explícita del usuario de implementar algo.

No se aplican a planificar, explorar, revisar ni responder preguntas. Mientras se planifica (plan mode), o si el usuario rechaza el plan, **no se crean ramas, commits, push ni PR, y no se toca Jira**. En la comparación de planes del ejercicio el plan no se aprueba, así que de aquí no sale nada.

Nada de esta sección sustituye las aprobaciones humanas de las skills: `/priority-ticket` pide aprobar el plan y `/commit` pide aprobar el mensaje. Si el usuario rechaza en cualquiera de esos puntos, el flujo se detiene ahí.

### Flujo, en este orden

1. **Rama nueva antes de tocar código.** Antes de la primera edición:
   - Apunta la rama actual (`git branch --show-current`): es la **rama de partida** y será la base del PR.
   - Si `git status` muestra cambios sin commitear, detente y pregunta antes de cambiar de rama.
   - Crea la rama desde la de partida: `git switch -c <tipo>/<FLOW-XX>-<descripcion-corta>` (p. ej. `feat/FLOW-4-login-frontend`; sin ticket, `<tipo>/<descripcion-corta>`).
   - No se trabaja nunca directamente sobre la rama de partida ni sobre `main`.
2. **Implementar** dentro del alcance del plan aprobado. Si hace falta algo que no estaba en el plan, para y pregunta. Antes de cerrar, ejecuta la verificación del plan (como mínimo `npm run lint` y `npm run build` en `frontend/`) y, si algo falla, arréglalo antes de seguir.
3. **Commit con `/commit`.**
   - `/commit` no prepara archivos: antes, añade al staging **solo los archivos del cambio, por ruta** (`git add <ruta>...`). Nunca `git add -A`, `git add .` ni `git commit -a`.
   - No se crea ningún commit fuera de `/commit` ni sin la aprobación del mensaje que pide.
   - Si el cambio mezcla cosas sin relación, haz varios commits, cada uno con `/commit`.
4. **Push de la rama, solo a `origin`** (tu fork): `git push -u origin <rama>`.
   - Nunca a `upstream`, nunca `--force`.
   - Si la rama de partida no existe en `origin` (`git ls-remote --heads origin <rama-de-partida>`), pide permiso antes de subirla.
5. **Pull request con `gh pr create`**, siempre contra el fork y la rama de partida, porque hay dos remotos y `gh` no tiene repo por defecto:

   ```bash
   gh pr create --repo ChristianHR01/flowsync-ai4devs-202610-seniors-I \
     --base <rama-de-partida> --head <rama> \
     --title "<tipo(scope): descripción del commit principal>" --body-file - <<'EOF'
   ...
   EOF
   ```

   - El cuerpo, en español, lleva: el ticket (`FLOW-XX` y su enlace de Jira), los criterios de aceptación como checklist, un resumen de los cambios y la verificación ejecutada con su resultado.
   - Nunca se abren PR contra el repo del curso (`LIDR-academy/...`) ni contra `upstream`. El PR de entrega del ejercicio lo abre el usuario a mano, como dice el README.
6. **Revisión adversarial.**
   - Lanza el subagente `adversarial-reviewer` con la URL del PR.
   - Cuando termine, publica su informe **tal cual** como comentario del PR: `gh pr comment <url> --body-file -`. Lo publica el agente principal; el revisor es de solo lectura.
   - No se aplican correcciones ni se aprueba el PR a partir de la revisión sin que el usuario lo pida.
7. **En el chat, solo la URL del PR.** El último mensaje del flujo es la URL y nada más: ni resumen, ni hallazgos, ni hash. Las preguntas y aprobaciones intermedias (plan, mensaje del commit, permisos) se hacen con normalidad. Si una verificación falla, primero intenta corregir el problema dentro del alcance del plan aprobado y vuelve a verificar. Solo si no puede resolverse así, o si falla otro paso (push rechazado, error de `gh`), no lo rodees: detente e informa del error y del paso donde te detuviste, en lugar de dar la URL.

Jira: la única transición automática es la que hace `/priority-ticket` a «En curso». No se mueve el ticket a otros estados.
