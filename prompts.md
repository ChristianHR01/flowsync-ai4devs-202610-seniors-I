# Prompts

## Prompt 1

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
/init
```

**Qué salió:** Se generó el archivo inicial `CLAUDE.md` del proyecto.

## Prompt 2

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Crea una skill de proyecto llamada /priority-ticket para FlowSync, utilizando el MCP de Atlassian ya configurado.

Objetivo: obtener el ticket de mayor prioridad asignado a mi usuario en Jira (espacio FLOW, estado "Por hacer") y preparar un plan de implementación.

Criterios de éxito:
- Identifica el ticket y resume sus criterios de aceptación.
- Consulta el código y las convenciones del proyecto antes de proponer el plan.
- Utiliza Plan Mode y solicita aprobación antes de implementar.
- Solo después de aprobar el plan, mueve el ticket a "En curso".

Restricciones:
- No modificar código ni el estado del ticket durante la planificación.
- La skill debe quedar disponible dentro del repositorio y ser reutilizable.

Si existe alguna ambigüedad sobre el comportamiento de Plan Mode o las transiciones de Jira, consúltame antes de asumir.
```

**Respuestas seleccionadas en el menú de Claude (no son prompts adicionales):**
- «Las incidencias de FLOW no tienen campo Prioridad. ¿Cómo decide la skill cuál es 'la de mayor prioridad'?» → «Prioridad, luego tablero (Recommended)».
- «Al aprobar el plan (ExitPlanMode), ¿qué hace la skill después de mover el ticket a «En curso»?» → «Mover e implementar».
- «¿Cómo entra en Plan Mode?» → «La skill lo activa (Recommended)».

**Qué salió:** Se creó la skill `/priority-ticket` con selección del ticket, planificación y aprobación previa a la implementación.

## Prompt 3

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Crea una skill de proyecto llamada /commit para FlowSync.

Objetivo: generar commits convencionales a partir de los cambios preparados en Git.

Criterios de éxito:
- Analiza los cambios staged antes de crear el commit.
- Genera un mensaje con el formato tipo(scope): descripción.
- Elige el tipo y el scope según los cambios reales.
- Muestra el resultado del commit, incluyendo su hash.
- Antes de ejecutar el commit, muestra el mensaje convencional propuesto y solicita mi aprobación. Si lo rechazo, permite ajustar el mensaje sin modificar los archivos preparados.

Restricciones:
- No incluir archivos que no estén en staging.
- No modificar código ni preparar archivos automáticamente.
- No ejecutar git push.
- Si no hay cambios preparados o detectas información sensible, detente y avisa.

Guarda la skill dentro del proyecto para que pueda versionarse con Git.
```

**Qué salió:** Se creó la skill `/commit` para revisar cambios preparados y solicitar aprobación del mensaje antes de confirmar.

## Prompt 4

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Crea un subagente de proyecto llamado adversarial-reviewer para FlowSync.

Objetivo: realizar revisiones adversariales de pull requests, buscando defectos, riesgos y posibles incumplimientos de los criterios de aceptación.

Criterios de éxito:
- Analiza el diff del PR y el contexto necesario del proyecto.
- Busca errores funcionales, problemas de seguridad, regresiones e incumplimientos de convenciones.
- Presenta hallazgos concretos, ordenados por severidad, indicando archivo, línea, impacto y corrección sugerida.
- Distingue los problemas comprobados de los riesgos que requieren verificación.
- Si no encuentra problemas, indica qué revisó y qué no pudo verificar.

Restricciones:
- Solo lectura: no modificar archivos, ejecutar commits ni cambiar el PR.
- No aprobar el código por defecto.
- No inventar hallazgos para llenar el reporte.

Guarda el subagente dentro del repositorio para versionarlo con Git.
```

**Qué salió:** Se creó el subagente `adversarial-reviewer` y se configuraron mecanismos para restringir su uso a revisión.

## Prompt 5

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Configura un hook de proyecto para FlowSync que formatee automáticamente con Prettier los archivos del frontend después de que Claude Code los edite.

Criterios de éxito:
- Prettier queda instalado en frontend/ como dependencia de desarrollo.
- El hook se ejecuta después de las ediciones realizadas por Claude Code.
- Solo formatea archivos dentro de frontend/src/.
- No modifica archivos del backend ni de la copia sin harness.
- La configuración queda dentro del repositorio y puede versionarse.

Restricciones:
- Utiliza el mecanismo oficial de hooks de Claude Code.
- No interfieras con el hook de solo lectura del subagente adversarial-reviewer.
- No formatees todo el repositorio ni realices commits o push.

Verifica el funcionamiento con una prueba controlada y reporta qué archivos se modificaron.
```

**Qué salió:** Se configuró el hook `PostToolUse` para ejecutar Prettier sobre archivos de `frontend/src/`.

## Prompt 6

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Actualiza el archivo `CLAUDE.md` de FlowSync incorporando las reglas de proceso de la pieza 7 del harness, siguiendo las instrucciones del README del curso.

Objetivo: Definir el flujo de trabajo que Claude Code debe seguir desde el inicio de una implementación hasta la revisión del pull request.

Criterios de éxito:
- Las reglas reflejan fielmente el proceso descrito en el README.
- Se integran correctamente con las skills `/priority-ticket` y `/commit`, el subagente `adversarial-reviewer` y las configuraciones existentes.
- El flujo contempla la creación de una rama antes de modificar código, el commit convencional, la creación del PR y su revisión adversarial.
- Al finalizar el flujo de implementación, la respuesta en el chat contiene únicamente la URL del PR.

**Restricciones:**
- Conserva el contenido existente de `CLAUDE.md` y añade las reglas al final.
- No ejecutes el flujo ni crees ramas, commits o pull requests.
- Respeta las aprobaciones humanas definidas en las skills.
- Las reglas no deben provocar implementaciones durante la comparación de planes del ejercicio.

Consulta el README antes de modificar el archivo. Si detectas contradicciones con las instrucciones existentes, repórtalas antes de realizar cambios.
```

**Respuestas seleccionadas en el menú de Claude (no son prompts adicionales):**
- «Conflicto 1: /priority-ticket implementa al aprobar el plan, pero el README dice «No apliques el plan» en la comparación. ¿Cómo lo resolvemos?» → «Dejar la skill como está».
- «Conflicto 2: /commit no hace push y hay dos remotos sin repo por defecto en gh. ¿Contra qué se abren los PR del flujo?» → «Fork, base rama de partida (Recommended)».
- «Conflicto 3: el chat final solo lleva la URL. ¿Dónde queda el informe del adversarial-reviewer?» → «Comentario en el PR (Recommended)».
- «Conflicto 4: CLAUDE.md dice que el frontend va «sin formateador» y ya tiene Prettier y el hook. ¿Lo corrijo?» → «Corregir solo esa frase (Recommended)».

**Qué salió:** Se añadieron reglas de proceso al archivo `CLAUDE.md`.

## Prompt 7

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Ajusta únicamente la instrucción de cierre de la fase 5 de `/priority-ticket` para que sea consistente con las reglas de proceso de `CLAUDE.md`.

Criterios de éxito:
- Si la implementación y el flujo completo terminan correctamente, la respuesta final contiene únicamente la URL del pull request.
- Si algún paso falla, informa del error y del punto donde se detuvo.
- Durante la planificación, mantiene el comportamiento actual de presentar el plan para aprobación.

Restricciones:
- Conserva el resto de la skill sin cambios.
- No ejecutes la skill ni realices modificaciones en Jira, código funcional o Git.
- No alteres el comportamiento de aprobación del plan.

Verifica que ambas instrucciones sean coherentes después del ajuste.
```

**Qué salió:** Se ajustó la instrucción de cierre de `/priority-ticket` para alinearla con `CLAUDE.md`.

## Prompt 8

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code

```text
Corrige únicamente la ambigüedad del paso 7 de `CLAUDE.md` respecto a las verificaciones fallidas.

La regla debe establecer que, si una verificación falla, primero se intentará corregir el problema dentro del alcance del plan aprobado y se volverá a verificar. Solo si no puede resolverse, deberá detenerse el flujo e informar el error.

Conserva todas las demás instrucciones sin cambios. No ejecutes el flujo ni modifiques otros archivos.
```

**Qué salió:** Se aclaró el tratamiento de verificaciones fallidas en `CLAUDE.md`.

## Prompt 9 — Corrida sin harness

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code, copia `flowsync-sin-harness`

```text
Prepara un plan de implementación para el siguiente ticket de FlowSync. Analiza el código existente y entra en Plan Mode antes de proponer la solución.

No modifiques archivos ni implementes el plan.

Ticket: FLOW-4 — Implementar login en el frontend

Descripción

Implementar la autenticación en el frontend, consumiendo el backend de auth ya existente (`POST /api/v1/auth/signup`, `POST /api/v1/auth/login`). Usar shadcn/ui para los componentes.

Criterios de aceptación

- Pantalla de registro (email+password) que llama a `POST /api/v1/auth/signup`.
- Pantalla de login (email+password) que llama a `POST /api/v1/auth/login` y guarda el token recibido.
- Tras login exitoso: redirige a una vista protegida (p. ej. perfil) que consuma `GET /api/v1/account/profile`.
- Credenciales inválidas en login, o email ya registrado en signup, muestran un mensaje claro — no un error genérico ni de consola.
- Enlace de navegación entre login y registro.

Resume los criterios de aceptación, identifica lo que el ticket no especifica y presenta el plan para mi aprobación, sin ejecutarlo.
```

**Qué salió:** Claude preparó un plan de frontend con registro, login, perfil y logout; se detuvo antes de implementar.

## Prompt 10 — Corrida con harness

**Modelo:** Claude Opus 5.5  
**Herramienta:** Claude Code, copia con harness

```text
/priority-ticket
```

**Respuestas seleccionadas en el menú de Claude (no son prompts adicionales):**
- «¿Qué muestra el formulario de registro?» → «Email, password y confirmación (Recommended)».
- «El signup ya devuelve un token. ¿Qué pasa tras registrarse con éxito?» → «Sesión iniciada → perfil (Recommended)».
- «¿Dónde se guarda el token?» → «localStorage (Recommended)».
- «¿Lo incluyo en el perfil?» (logout) → «Sí, botón en el perfil (Recommended)».

**Qué salió:** Claude consultó `FLOW-4` con el MCP, solicitó cuatro aclaraciones de producto y generó un plan. No se aprobó ni implementó.
