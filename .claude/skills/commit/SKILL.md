---
name: commit
description: Crea un commit convencional (tipo(scope): descripción) en FlowSync a partir de los cambios ya preparados en Git (staged). Analiza el diff preparado, propone el mensaje, pide aprobación antes de commitear y muestra el hash resultante. Nunca prepara archivos, nunca modifica código y nunca hace push.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git branch:*), Read, Grep, Glob
---

# /commit

## Reglas que no se rompen

- **Solo entra lo que ya está en staging.** Prohibido `git add`, `git rm`, `git mv`, `git restore`, `git reset`, `git stash`, `git commit -a`, `git commit --amend` y `git commit <ruta>` (con ruta, Git mete también lo que no está preparado de esos archivos).
- **No se modifica ningún archivo** del árbol de trabajo ni del índice.
- **Nunca `git push`**, ni siquiera si lo piden las reglas de proceso: eso queda fuera de esta skill.
- **Nunca `--no-verify`.** Si un hook rechaza el commit, se informa y se detiene.
- **No se commitea sin aprobación explícita** del mensaje exacto que se va a usar.

## Paso 1 — Comprobar que hay algo preparado

```bash
git status --short
git diff --cached --name-status
```

- Si `git diff --cached` está vacío: **detente** y avisa: «No hay cambios preparados. Prepáralos con `git add <archivos>` y vuelve a lanzar /commit». No ofrezcas prepararlos tú.
- Si además hay cambios sin preparar o archivos sin seguimiento, lístalos aparte y aclara que **no** van a entrar en el commit.

## Paso 2 — Buscar información sensible en lo preparado

Revisa la lista de archivos y el diff preparado (`git diff --cached`) buscando:

- Archivos de entorno o credenciales: `.env`, `.env.*` (salvo `.env.example` con valores de ejemplo), `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `credentials*`, `*.sqlite`/`*.db` con datos, `.claude/settings.local.json`.
- En las líneas añadidas (`+`): claves privadas (`-----BEGIN ... PRIVATE KEY-----`), `APP_KEY=` con valor real, tokens de acceso de AdonisJS (`oat_...`), tokens de API (`sk-`, `ghp_`, `github_pat_`, `xox[bp]-`, `AKIA...`, tokens de Atlassian), cabeceras `Authorization: Bearer <valor>`, contraseñas o secretos asignados literalmente (`password=`, `secret=`, `token=`, `api_key=` con valor), cadenas de conexión con usuario y contraseña.

Si encuentras algo: **detente sin commitear** y avisa indicando el archivo y la línea, **sin reproducir el secreto entero** (enmascáralo, p. ej. `oat_ab…`). Sugiere sacarlo del staging con `git restore --staged <archivo>`, pero no lo ejecutes. Si es claramente un valor de ejemplo o de test, dilo y pregunta antes de seguir.

## Paso 3 — Analizar los cambios y elegir tipo y scope

Lee el diff preparado completo (`git diff --cached`; si es muy grande, `git diff --cached --stat` y luego archivo por archivo). Mira `git log --format=%s -20` para seguir el estilo del repo.

**Tipo**, según lo que hacen realmente los cambios:

| Tipo | Cuándo |
|---|---|
| `feat` | funcionalidad nueva visible para el usuario o la API |
| `fix` | corrige un comportamiento incorrecto |
| `refactor` | cambia el código sin cambiar el comportamiento |
| `perf` | mejora de rendimiento |
| `test` | añade o corrige tests, sin tocar código de producción |
| `docs` | solo documentación (README, `docs/`, comentarios) |
| `style` | formato, sin cambio de lógica |
| `build` | dependencias, `package.json`, configuración de Vite/TS/build |
| `ci` | pipelines de integración continua |
| `chore` | mantenimiento que no encaja en lo anterior (configuración del agente, harness, scripts) |

Si se mezclan varios tipos, gana el principal (lo que motiva el cambio: `feat` con sus tests sigue siendo `feat`). Si son cambios sin relación entre sí, **dilo** y sugiere partirlos en varios commits; no lo hagas tú.

**Scope**, según dónde están los cambios. Usa los del repo:

- `frontend`: cambios en `frontend/`; si es algo concreto, el scope puede ser más fino (`auth`, `ui`, `router`) cuando todo el commit cae ahí.
- `backend`: cambios en `backend/`.
- `harness`: configuración del agente (`CLAUDE.md`, `AGENTS.md`, `.claude/`, `.mcp.json`).
- `deps`: solo dependencias.
- Otros ya usados en el historial (`s1`, `slides`…) cuando encajen.

Si el cambio cruza varias áreas, usa la dominante.

**Descripción**: en español, imperativo o descriptiva como en el historial, en minúscula, sin punto final, que el título completo no pase de unos 72 caracteres. Debe decir **qué cambia y para qué**, no repetir nombres de archivo.

**Cuerpo** (opcional): solo si el título no basta. Líneas de hasta 72 caracteres explicando el porqué o los detalles que importan. Si el harness indica un trailer de atribución (`Co-Authored-By: ...`), añádelo al final, separado por una línea en blanco.

## Paso 4 — Proponer y pedir aprobación

Muestra:

1. Los archivos que entran (de `git diff --cached --name-status`).
2. El mensaje completo propuesto, en un bloque de código, exactamente como se va a commitear.

Pide aprobación con `AskUserQuestion`. Opciones: **Commitear**, **Ajustar el mensaje** y **Cancelar**. La opción libre «Other» sirve para escribir un mensaje o una corrección directamente.

- **Commitear**: pasa al paso 5.
- **Ajustar / texto libre**: rehace el mensaje con lo que pida el usuario y vuelve a mostrarlo y a pedir aprobación. El staging no se toca. Si el mensaje del usuario no sigue `tipo(scope): descripción`, avísalo y propone la versión corregida; si insiste, respeta su texto.
- **Cancelar**: detente sin commitear y sin tocar nada.

## Paso 5 — Commitear y mostrar el resultado

Justo antes, comprueba que el staging no cambió desde el análisis (`git diff --cached --name-status`). Si cambió, vuelve al paso 1.

Commitea solo lo preparado, pasando el mensaje aprobado por stdin para respetar saltos de línea y comillas:

```bash
git commit -F - <<'EOF'
tipo(scope): descripción

Cuerpo opcional.
EOF
```

Después muestra el resultado:

```bash
git log -1 --format='%H%n%s' && git show --stat --format= HEAD
```

Informa del **hash** (completo y corto), el título, la rama (`git branch --show-current`) y los archivos incluidos. Si quedaron cambios sin preparar, recuérdalo en una línea. No hagas push.

Si `git commit` falla (hook, conflicto, identidad sin configurar), muestra el error tal cual y detente. No reintentes con otras opciones.
