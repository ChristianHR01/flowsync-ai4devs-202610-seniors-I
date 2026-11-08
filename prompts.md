## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
## 1. Contexto y rol
Actúa como ingeniero de QA especializado en verificación funcional y trazabilidad de requisitos dentro del proyecto FlowSync.

## 2. Objetivo
Analiza exclusivamente el requisito "Lo que cada tarea muestra de su responsable" del archivo openspec/specs/tasks/spec.md.

Contrasta cada uno de sus escenarios con los tests existentes y genera una matriz de trazabilidad en docs/verificacion/cihr.md.

## 3. Criterios de éxito
- Identifica el número total de escenarios del requisito.
- Genera exactamente una fila por escenario.
- Utiliza cuatro columnas: Scenario, Test que lo cubre, Estado, Qué falta para decidir.
- En la columna del test, utiliza su nombre exacto en la suite, solo si verificaste sus aserciones.
- Clasifica cada escenario como Cubierto, No cubierto o No lo sé.
- Marca Cubierto únicamente cuando una aserción compruebe el comportamiento requerido.
- Si no encuentras evidencia suficiente, registra No lo sé y explica brevemente la incertidumbre.
- Incluye al principio el número total de escenarios y al final el número de escenarios realmente cubiertos.
- Bajo la matriz, prepara las tres líneas de la Parte B. Registra la estimación inicial de 10 escenarios cubiertos y deja sin completar los resultados y reflexiones que todavía no hayamos determinado.

## 4. Restricciones
- No modifiques código de producción.
- No crees, edites ni ejecutes tests nuevos en esta primera fase.
- No cambies la spec viva.
- No analices otros requisitos de la capability de tareas.
- No asumas cobertura por el nombre de un test ni por tener la suite en verde.
- No inventes nombres de tests ni comportamientos.
- Solo puedes crear o modificar docs/verificacion/cihr.md.
- Si existe incertidumbre, mantenla explícita. No fuerces conclusiones.

## 5. Recursos y referencias
- Spec viva: openspec/specs/tasks/spec.md
- Tests existentes: backend/tests/
- Tests de referencia: backend/tests/functional/auth/
- Código de tareas: backend/
- Rama actual: trazabilidad-cihr
- Estimación humana previa: 10 escenarios cubiertos.

## 6. Resultado esperado
Genera docs/verificacion/cihr.md con la matriz solicitada y la sección de reflexión inicial.

Al finalizar, informa:
- Número total de escenarios.
- Número cubierto, no cubierto y no determinado.
- Evidencia relevante encontrada.
- Qué escenarios requieren pruebas nuevas.

Detente después de generar la matriz. No implementes tests todavía.

```

**Qué salió:**


## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
## 1. Contexto y rol

Actúa como ingeniero de QA especializado en pruebas funcionales, trazabilidad y verificación de requisitos.

La matriz ya está creada en docs/verificacion/cihr.md.

El requisito "Lo que cada tarea muestra de su responsable" contiene 3 escenarios y ninguno tiene cobertura comprobada en los tests existentes.

Tu responsabilidad es verificar, no corregir la implementación.

## 2. Objetivo

Implementa los tests faltantes para los tres escenarios del requisito ubicado en:

openspec/specs/tasks/spec.md

Crea un test por escenario dentro de:

backend/tests/functional/tasks/

Sigue las convenciones de los tests existentes en backend/tests/functional/auth/.

## 3. Criterios de éxito

- Lee el texto exacto de los tres escenarios antes de implementar.
- Identifica los endpoints, controladores y transformers involucrados.
- Crea exactamente un test por escenario.
- Cada test debe tener un nombre descriptivo relacionado con el comportamiento que comprueba.
- Verifica el comportamiento mediante aserciones explícitas, no solamente mediante el código HTTP.
- Comprueba las representaciones de lista y detalle cuando el escenario sea aplicable a ambas.
- Utiliza datos de prueba aislados y reproduce el estilo del proyecto.
- Ejecuta los tests nuevos y registra cuáles pasan y cuáles fallan.
- Si un test falla por una desviación de la implementación, consérvalo sin modificar sus expectativas.
- Reporta la evidencia de cada fallo, incluyendo el comportamiento esperado y el observado.

## 4. Restricciones

- NO modifiques código de producción.
- NO modifiques la spec viva.
- NO modifiques los transformers, controladores, rutas ni modelos.
- NO modifiques los tests de autenticación existentes.
- NO cambies los criterios de aceptación para adaptarlos a la implementación.
- NO debilites las aserciones para conseguir tests verdes.
- NO inventes reglas de negocio que la spec no defina.
- NO crees archivos fuera de backend/tests/functional/tasks/.
- Si una regla es ambigua, explica la ambigüedad antes de decidir cómo probarla.
- No realices commits ni push.

## 5. Recursos y referencias

Spec viva:
openspec/specs/tasks/spec.md

Matriz:
docs/verificacion/cihr.md

Tests de referencia:
backend/tests/functional/auth/

Implementación actual:
backend/app/

Hallazgos de la fase anterior:
- Tres escenarios sin tests.
- Posible exposición del email del responsable en determinadas respuestas.
- Posible ambigüedad entre las iniciales derivadas del email y la regla de no exponer el email.
- Lista y detalle pueden utilizar serializers diferentes.

## 6. Resultado esperado

Entrega:

1. Los tres tests correspondientes a los escenarios.
2. Nombre exacto y ubicación de cada test.
3. Resultado de la ejecución: PASSED o FAILED.
4. Evidencia de los errores encontrados.
5. Decisiones que tuviste que tomar porque la spec no las especificaba completamente.

No corrijas los fallos encontrados.

Termina mostrando el resumen de tests y detente para revisión humana.

```

**Qué salió:**


## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
## 1. Contexto y rol

Actúa como ingeniero de QA especializado en trazabilidad
y documentación de evidencias de verificación.


## 2. Objetivo

Actualiza docs/verificacion/cihr.md con los resultados
obtenidos después de implementar los tests.


## 3. Criterios de éxito

- Conserva la estimación humana inicial: 10.
- Conserva la cobertura original: 0 de 3 escenarios.
- Identifica los tres tests nuevos por su nombre exacto.
- Registra que dos tests pasaron y uno falló.
- Distingue entre cobertura de pruebas y cumplimiento.
- Documenta el fallo de exposición del email en el listado.
- Señala que la comprobación del detalle no se alcanzó
  dentro del test fallido.
- Conserva la incertidumbre sobre iniciales derivadas
  del email.

Completa la Parte B con estas reflexiones:

1. Estimación inicial: 10; cobertura original: 0.
2. En "Responsable sin nombre" no quedó claro si
   derivar iniciales del email estaba prohibido
   por la spec o si era una restricción no definida.
3. Para "datos de acceso" se decidió comprobar
   email y contraseña, sin exigir la ausencia de
   createdAt y updatedAt.

Mantén la matriz con sus cuatro columnas y una fila
por escenario. Si actualizas su estado de cobertura,
distingue explícitamente la cobertura inicial de la
que existe después de añadir los nuevos tests.

## 4. Restricciones

- No modifiques código de producción.
- No modifiques tests.
- No cambies la spec viva.
- No ejecutes correcciones para conseguir tests verdes.
- No inventes resultados ni evidencias.
- No hagas commit ni push.

## 5. Recursos

- docs/verificacion/cihr.md
- backend/tests/functional/tasks/assignee.spec.ts
- openspec/specs/tasks/spec.md
- prompts.md

## 6. Resultado esperado

Actualiza la matriz y las tres líneas.

Al finalizar, muestra un resumen de los archivos
modificados y detente.

```

**Qué salió:**
