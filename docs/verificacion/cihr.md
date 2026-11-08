# Matriz de trazabilidad — «Lo que cada tarea muestra de su responsable»

- **Requisito:** «Lo que cada tarea muestra de su responsable» (`openspec/specs/tasks/spec.md`, líneas 97–114)
- **Total de escenarios del requisito: 3**
- **Tests revisados en la fase inicial:** todos los de `backend/tests/` — solo existían `functional/auth/{signup,login,session,initials}.spec.ts`. Ninguno llamaba a una ruta de `/api/v1/tasks` ni leía un campo `assignee`.
- **Tests añadidos después:** `backend/tests/functional/tasks/assignee.spec.ts`, grupo `Tasks | responsable`, uno por escenario. Cada uno comprueba el `assignee` en la lista (`GET /api/v1/tasks`) y en la tarea suelta (`GET /api/v1/tasks/:id?today=2026-11-08`).
- **Resultado de la ejecución:** 2 PASSED, 1 FAILED. Suite completa: 22 passed, 1 failed (23).

> **Cobertura ≠ cumplimiento.** «Cubierto» significa que hay una aserción que comprueba el comportamiento requerido. Que el comportamiento se cumpla lo dice el resultado del test. Un escenario puede estar cubierto y no cumplirse.

| Scenario | Test que lo cubre | Estado | Qué falta para decidir |
|---|---|---|---|
| Responsable identificable | `Tasks \| responsable` › `el responsable llega con su nombre y sus iniciales` | **Inicial:** No cubierto · **Ahora:** Cubierto — PASSED (se cumple) | Nada para el estado. El test afirma `fullName === 'Ada Lovelace'` e `initials === 'AL'` en la lista y en la tarea suelta. Antes, la única aserción parecida (`Auth \| iniciales`) era sobre `data.user` del login, no sobre una tarea. «Bastan para saber quién la lleva» se redujo a nombre + iniciales; el `id` no se comprueba porque la spec no lo menciona. |
| La tarea no filtra datos de cuenta | `Tasks \| responsable` › `el responsable de una tarea no expone el email ni datos de acceso` | **Inicial:** No cubierto · **Ahora:** Cubierto en la lista — FAILED (no se cumple). Detalle sin verificar | **Fallo:** `AssertionError: lista: expone el email: expected { id: 2, …(5) } to not have nested property 'email'`. Esperado: `assignee` sin `email`. Observado: un objeto de 6 campos que coincide con `UserTransformer` (`id`, `fullName`, `email`, `createdAt`, `updatedAt`, `initials`). Causa probable: `TaskTransformer` usa `UserTransformer` en vez de `TaskAssigneeTransformer` (`backend/app/transformers/task_transformer.ts:9`). **La comprobación del detalle no se alcanzó**: el test cae en la lista, que se comprueba primero. El código del detalle usa `TaskAssigneeTransformer` (sin email), pero ninguna aserción lo ha confirmado. Tampoco se probaron las respuestas de `POST /tasks` ni de `PATCH /tasks/:id/status`, que usan el mismo transformer que la lista. |
| Responsable sin nombre | `Tasks \| responsable` › `un responsable sin nombre llega con el nombre nulo y con iniciales` | **Inicial:** No cubierto · **Ahora:** Cubierto — PASSED (se cumple tal como se interpretó) | El test afirma que `fullName` existe y es `null`, y que `initials` es un texto no vacío, en la lista y en la tarea suelta. **Incertidumbre abierta:** `User.initials` deriva las iniciales del email (`ada@example.com` → `AE`, según `Auth \| iniciales`). No está claro si eso choca con «sin recurrir a su email»: la interfaz no usa el email, pero las iniciales revelan parte de él. El test no comprueba el valor de las iniciales; no se decidió si la spec lo prohíbe. |

**Cobertura inicial: 0 de 3** (No cubierto: 3 · No lo sé: 0)
**Cobertura tras los tests nuevos: 3 de 3** (el escenario 2 solo en la lista; el detalle sin verificar)
**Cumplimiento comprobado: 2 de 3** (falla «La tarea no filtra datos de cuenta»)

## Parte B: las tres líneas

1. **Escenarios que creía cubiertos antes de mirar / que lo estaban:** 10 estimados; 0 cubiertos originalmente.
2. **El escenario del que no supe si era un hueco de test o de spec, y por qué:** En «Responsable sin nombre», no sabía si faltaba una prueba que prohibiera derivar las iniciales del email o si esa restricción nunca estuvo definida en la especificación.
3. **Algo que el escenario no decidía por mí y tuve que decidir al escribir el test:** En «La tarea no filtra datos de cuenta», interpreté los datos de acceso como email y contraseña. Decidí no exigir la ausencia de createdAt y updatedAt, porque la especificación no establece claramente si deben excluirse.
