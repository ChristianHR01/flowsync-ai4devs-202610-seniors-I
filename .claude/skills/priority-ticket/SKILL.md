---
name: priority-ticket
description: Trae de Jira el ticket de mayor prioridad asignado al usuario en el espacio FLOW y en «Por hacer», resume sus criterios de aceptación, prepara en plan mode un plan de implementación basado en el código y las convenciones de FlowSync y, solo cuando el plan se aprueba, mueve el ticket a «En curso» y lo implementa.
disable-model-invocation: true
allowed-tools: mcp__atlassian__getAccessibleAtlassianResources, mcp__atlassian__atlassianUserInfo, mcp__atlassian__searchJiraIssuesUsingJql, mcp__atlassian__getJiraIssue, mcp__atlassian__discover, mcp__atlassian__executeRead, Read, Grep, Glob
---

# /priority-ticket

Flujo en cinco fases. **El orden es obligatorio**: nada de las fases 1–3 cambia código ni Jira.

## Reglas que no se rompen

- Antes de la aprobación del plan (fase 4) **no se edita ningún archivo del repo** (solo el archivo de plan que indica plan mode) **ni se escribe nada en Jira**: ni transiciones, ni comentarios, ni ediciones de campos.
- La única escritura en Jira que hace esta skill es la transición a «En curso», y solo después de que `ExitPlanMode` vuelva aprobado.
- Si algo es ambiguo (varios sitios de Atlassian, ningún ticket, transición inexistente o duplicada, criterio de aceptación contradictorio con el backend), **se pregunta al usuario con `AskUserQuestion`**; no se asume.

## Fase 0 — Entrar en plan mode

- Si la sesión ya está en plan mode, sigue.
- Si no, llama a `EnterPlanMode` (carga su esquema con `ToolSearch` si hace falta). Si el usuario rechaza entrar, detente y no hagas nada más.

## Fase 1 — Encontrar el ticket

1. Obtén el `cloudId` con `mcp__atlassian__getAccessibleAtlassianResources` (una sola vez). Si hay más de un sitio con Jira, pregunta cuál usar.
2. Busca con `mcp__atlassian__searchJiraIssuesUsingJql`:

   ```
   project = FLOW AND assignee = currentUser() AND statusCategory = "new"
   ORDER BY priority DESC, Rank ASC, created ASC
   ```

   con `fields: ["summary", "status", "priority", "issuetype", "assignee"]` y `maxResults: 10`.

   - `statusCategory = "new"` es la categoría «Por hacer». En FLOW el estado concreto se llama «Tareas por hacer»; filtrar por categoría evita depender del nombre.
   - Las incidencias de FLOW pueden no tener campo Prioridad. Por eso el orden es: prioridad si existe, luego posición en el tablero/backlog (`Rank`), luego antigüedad.
3. Toma el **primer** resultado. Muestra también los demás candidatos en una línea cada uno (clave, resumen, prioridad), para que el usuario vea por qué ganó ese.
4. Si no hay resultados, dilo (proyecto, asignado, estado buscados) y detente. No busques en otros estados ni en tickets sin asignar.
5. Lee el ticket completo con `mcp__atlassian__getJiraIssue` (`view: "evidence"`) para tener descripción, subtareas y enlaces.

## Fase 2 — Resumir el ticket

Presenta al usuario, en español y breve:

- **Clave, título y enlace** (`webUrl`), tipo, prioridad (o «sin prioridad») y estado actual.
- **Criterios de aceptación**, numerados, tal como vienen en el ticket (sin reinterpretarlos).
- **Huecos del ticket**: lo que el ticket no especifica y habrá que sacar del código (formatos de datos, validaciones, errores, rutas, librerías).

## Fase 3 — Explorar el código y escribir el plan

Antes de proponer nada, lee:

1. `CLAUDE.md` (y `AGENTS.md` si existe) completo: comandos, convenciones, reglas de proceso, qué no se toca.
2. La parte del código que toca el ticket. En FlowSync, para un ticket de frontend que consume la API:
   - `backend/start/routes.ts`, los controladores implicados y **los validadores de `backend/app/validators/`**, que son la fuente de verdad de lo que exige la API (campos obligatorios, longitudes, confirmaciones, formato de errores 422 `{ errors: [{ field, rule, message }] }`, `E_INVALID_CREDENTIALS`). El backend no se modifica: solo se lee.
   - Los transformers (`backend/app/transformers/`) para saber qué devuelve cada endpoint (respuestas envueltas en `data`).
   - `frontend/package.json`, `frontend/tsconfig*.json`, `frontend/.oxlintrc.json`, `frontend/vite.config.*` y `frontend/src/`: dependencias reales, restricciones de TypeScript (`verbatimModuleSyntax`, `erasableSyntaxOnly`, sin `enum`), lint.
3. Si el ticket pide algo que el proyecto aún no tiene (router, shadcn/ui, tests…), compruébalo en el código, no lo supongas.

Escribe el plan en el archivo de plan que indica plan mode, con estas secciones:

1. **Ticket**: clave, título, enlace.
2. **Criterios de aceptación → cómo se cumple cada uno** (una línea por criterio, con el archivo que lo resuelve).
3. **Lo que exige el backend y el ticket no dice** (con la ruta del validador/archivo de donde sale cada regla).
4. **Archivos a crear o modificar**, con una frase por archivo. Ninguno dentro de `backend/`.
5. **Dependencias nuevas** y cómo se instalan (p. ej. componentes shadcn/ui copiados al repo, no como dependencia).
6. **Convenciones del proyecto que se aplican** (citadas de `CLAUDE.md`).
7. **Verificación**: comandos concretos (`npm run build`, `npm run lint` en `frontend/`, pasos manuales contra `http://localhost:3333`).
8. **Al aprobar**: «Mover FLOW-XX a En curso e implementar».

Si durante la exploración surge una decisión de producto que el código no resuelve, pregúntala con `AskUserQuestion` antes de cerrar el plan. Después llama a `ExitPlanMode` para pedir aprobación.

## Fase 4 — Aprobación

- **Si el usuario rechaza o pide cambios**: no toques Jira. Ajusta el plan y vuelve a pedir aprobación con `ExitPlanMode`.
- **Si lo aprueba**, en este orden:
  1. Lista las transiciones del ticket: `mcp__atlassian__executeRead` con `name: "listJiraIssueTransitions"`, `cloudId` y `inputs: { issueIdOrKey }`.
  2. Elige la transición cuyo **estado destino** (`to.name`) es «En curso». No te fíes del nombre de la transición ni de un id fijo. Si no hay ninguna o hay más de una, pregunta.
  3. Ejecuta `mcp__atlassian__transitionJiraIssue` con ese `transitionId`.
  4. Confirma al usuario el estado en que quedó el ticket (lo devuelve la propia llamada). Si la transición falla, informa del error y **no empieces a implementar** hasta que el usuario decida.

## Fase 5 — Implementar

Implementa el plan aprobado tal cual:

- Sigue las reglas de proceso de `CLAUDE.md` si las hay (p. ej. rama nueva antes de tocar código, `/commit`, pull request).
- No te salgas del alcance del plan; si hace falta algo que no estaba, para y pregunta.
- Al terminar, ejecuta la verificación del plan y sigue el flujo de `CLAUDE.md` hasta el final (commit, push, PR y revisión adversarial). Si todo termina bien, tu respuesta final es **solo la URL del pull request**. Si la verificación falla, corrígelo dentro del alcance del plan antes de seguir, como dice `CLAUDE.md`. Si no se puede corregir, o si falla cualquier otro paso (commit, push, `gh`, revisión), detente sin rodearlo e informa del error y del paso donde te detuviste, en lugar de dar la URL.
