## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Antes de definir el MVP de FlowSync, analiza el repositorio actual e identifica las capacidades ya implementadas y las entidades principales del modelo de datos. Resume tus hallazgos en 3–5 líneas. No propongas funcionalidades ni modifiques código.

```

**Qué salió:** Funcionó a la primera; identificó las funcionalidades existentes y el modelo de datos.


## Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
"Quiero que FlowSync sea una herramienta para que los equipos remotos sepan en qué está trabajando cada uno sin tener que hacer reuniones de sincronización. Algo tipo tareas compartidas pero más en tiempo real y menos rollo que Jira."

Antes de definir el MVP, necesito que identifiques las principales incertidumbres de esta propuesta.

Tu tarea:

Formúlame exactamente cinco preguntas que permitan aclarar el problema, los usuarios y el alcance del producto.

Restricciones:

Realiza una sola ronda de cinco preguntas.

Prioriza las preguntas que más influyan en las decisiones del MVP.

No propongas funcionalidades ni soluciones todavía.

No profundices en arquitectura, stack, modelos de datos ni endpoints.

No supongas respuestas a las preguntas.

Espera a que te proporcione la ficha de hechos del producto antes de continuar.

El objetivo es identificar qué necesitamos conocer antes de tomar decisiones sobre el alcance.

```

**Qué salió:** Funcionó a la primera; formuló las cinco preguntas sin proponer soluciones.


## Prompt 3

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Gracias por las cinco preguntas. Ahora te proporcionaré la ficha de hechos del producto FlowSync.

Esta ficha contiene las decisiones de producto ya establecidas para el ejercicio. Utilízala como fuente de verdad para responder tus preguntas y comprender las restricciones del MVP.

## Ficha de hechos de FlowSync

- **Qué duele hoy:** la daily de sincronización y el "¿en qué estás?" constante por Slack/chat. Nadie ve el estado del equipo sin interrumpir a alguien.
- **Quién cobra el valor:** los pares, no un lead. No hay reporte hacia arriba y a un manager le daría igual. Duele a los dos devs que descubren tarde que iban a lo mismo, y al que interrumpe a otro para preguntar.
- **Episodio concreto:** dos personas del equipo tocaron el mismo módulo la misma semana porque una empezó sin que la otra lo supiera. Dos días perdidos.
- **Qué reunión desaparece:** la daily NO desaparece entera. Desaparece la ronda de "¿en qué estás?", que hoy se come la mitad de los 15 minutos. La parte de bloqueos sigue, y este MVP no la resuelve.
- **Usuarios / equipo:** equipos remotos pequeños, 3–10 personas. Roles planos: en el MVP todos ven y editan lo mismo, sin jerarquía de permisos.
- **Primer usuario concreto:** equipo de 6 personas de producto SaaS, en 3 husos horarios, que hoy usa un gestor de tareas pesado y una daily de 15 minutos por videollamada. Es un CASO DE ESTUDIO, no un cliente real.
- **Fronteras:** un espacio único compartido, sin entidad "equipo". Varios equipos separados, o gente en más de uno, queda FUERA del MVP: se anota como supuesto en el PRD, no se construye.
- **"Tiempo real":** ver los cambios de estado de las tareas sin refrescar ni preguntar. NO es chat, NO es videollamada, NO es colaboración simultánea sobre el mismo documento.
- **Es frescura, no presencia:** el estado es de la TAREA, no de la persona. Nada de "quién está conectado ahora" ni indicadores de actividad; eso es vigilancia y lo rechazamos a propósito.
- **Forma de la señal:** resumen que espera, no aviso que interrumpe. El caso es "llego por la mañana o vuelvo de una reunión y veo qué se ha movido". Sin notificaciones push.
- **Qué decisión cambia:** no empezar algo que otra persona ya está tocando, y elegir lo siguiente sabiendo qué está libre. Si la única respuesta fuera "sentirse informado", el tiempo real no valdría lo que cuesta.
- **De dónde sale el estado:** lo teclea la persona que hace la tarea, en segundos. Derivarlo de señales externas (Git/PRs, CI, calendario) está FUERA del MVP: es otro producto, con integraciones y OAuth de terceros.
- **Por qué se sostiene:** no porque sea más agradable, sino porque son dos clics sobre una lista ya abierta, sin campos obligatorios, sin decidir sprint ni estimación. Y quien lo escribe cobra en el momento: esa misma lista es su cola de trabajo, la mira para decidir qué coge, y de paso deja de recibir interrupciones preguntándole cómo va. Si el beneficio fuera solo para los demás, no lo escribiría.
- **Si la información se queda vieja:** el producto pierde el sentido, y lo asumo. Es el riesgo #1 a validar, no un detalle. La mitigación es que actualizar cueste dos clics, no obligar a nadie.
- **Es donde se hace el trabajo, no donde se cuenta:** sustituye al gestor de tareas, no convive con él. FlowSync crea las tareas, no lee las de otro sitio. Convivir exigiría doble actualización, que es como muere esta categoría.
- **Renuncia explícita:** a sprints, estimaciones, épicas, backlog priorizado e informes. Un equipo que necesite eso no es nuestro usuario.
- **"Menos rollo que Jira":** crear una tarea y cambiarle el estado en segundos, sin flujos de configuración ni campos obligatorios. Lo mínimo para saber quién está en qué.
- **Qué necesita una tarea en el MVP:** título, responsable, estado y fecha de vencimiento. La fecha, para ver de un vistazo qué se ha pasado de plazo.
- **Cómo se consume la lista:** filtrando por estado, para centrarse en lo pendiente.
- **Éxito para el usuario:** dejar de hacer la ronda de "¿en qué estás?" de la daily porque el estado del equipo se ve de un vistazo.
- **Criterio a una semana de uso real:** que el equipo cancele esa ronda y nadie pida que vuelva. Si la siguen haciendo igual, no funcionó.
- **Cuánto construir:** una vertical fina y usable de punta a punta, no el andamiaje amplio de un producto. Prefiero una capability terminada a tres a medias.

## Exclusiones ya decididas

Quedan fuera del MVP:
- Notificaciones push.
- Integración con Slack.
- Roles y permisos avanzados.
- Analítica y reporting.
- Comentarios en tareas.

## Tu tarea ahora

1. Relaciona estas decisiones de producto con las cinco preguntas que formulaste.
2. Resume brevemente las respuestas que ofrece la ficha.
3. Identifica cualquier pregunta que no esté completamente respondida.
4. Si encuentras información faltante, toma una decisión provisional y márcala explícitamente como **SUPUESTO POR VALIDAR**.
5. Señala posibles contradicciones entre las decisiones del producto, si las encuentras.

No realices otra ronda de preguntas.

Todavía no generes el alcance ni el PRD. Primero quiero revisar tus conclusiones y los supuestos identificados.

No modifiques archivos ni implementes código.

```

**Qué salió:** Identificó supuestos pendientes y contradicciones que necesitaban revisión.


## Prompt 4

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```

He revisado los supuestos y contradicciones que identificaste. Vamos a establecer las siguientes decisiones de producto para continuar con el ejercicio de definición del MVP de FlowSync.

### Decisiones aceptadas provisionalmente

1. **Estados de las tareas:** utilizaremos tres estados fijos: Pendiente, En curso y Hecha. No contemplaremos estados configurables en el MVP.

2. **Responsable:** será opcional y único. Las tareas podrán permanecer sin asignar para que algún integrante del equipo las tome.

3. **Campos obligatorios:** al crear una tarea, solamente el título será obligatorio. El estado inicial será Pendiente; el responsable y la fecha de vencimiento podrán establecerse posteriormente.

4. **Visualización y filtros:** por defecto se mostrarán las tareas no completadas, incluyendo Pendientes y En curso. Se permitirá filtrar por estado.

5. **Tiempo real:** mantendremos la actualización automática de los cambios de estado entre usuarios, sin necesidad de refrescar manualmente. No incorporaremos chat, indicadores de presencia ni notificaciones.

### Supuestos pendientes de validación

1. **Última actualización:** mostrar cuándo cambió una tarea podría ser útil, pero todavía no está aprobado como funcionalidad del MVP.

2. **Zonas horarias:** necesitamos definir posteriormente una regla consistente para interpretar las fechas de vencimiento. No aprobaremos todavía una solución específica.

3. **Acceso y permisos:** los roles serán planos, pero eso no significa que cualquier persona registrada pueda acceder a todas las tareas. El mecanismo de acceso al espacio compartido sigue pendiente de definición.

4. **Plazo de desarrollo:** la ficha no establece uno. Los 45 minutos corresponden al ejercicio de planificación, no a la implementación del producto.

### Riesgos que debemos conservar

- El equipo de referencia podría necesitar funcionalidades de gestión avanzada que quedan fuera del MVP.
- Los títulos de las tareas podrían no proporcionar suficiente información para evitar que dos personas trabajen sobre el mismo módulo.
- Si los usuarios no mantienen actualizados los estados, FlowSync pierde su propuesta de valor.

### Instrucciones

1. Incorpora estas decisiones al contexto de nuestro análisis.
2. Distingue las decisiones provisionales de los supuestos pendientes.
3. No conviertas los supuestos pendientes en funcionalidades aprobadas.
4. No generes todavía el PRD ni modifiques archivos.
5. Confirma brevemente que comprendes las decisiones y señala solamente si permanece alguna contradicción crítica que impida definir el alcance del MVP.

Después continuaremos con el tercer tramo del ejercicio: propuesta de alcance y NO-alcance.

```

**Qué salió:** Funcionó a la primera; incorporó las decisiones y confirmó que podíamos continuar.


## Prompt 5

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```

Vamos a continuar con el Tramo 3 del ejercicio: definir el alcance y NO-alcance del MVP de FlowSync.

Ya contamos con:
- El análisis de las capacidades existentes en el repositorio.
- Las cinco preguntas de descubrimiento.
- La ficha de hechos del producto.
- Las decisiones provisionales aceptadas.
- Los supuestos pendientes y los riesgos identificados.

Con toda esta información, propón el MVP más pequeño posible que permita validar la hipótesis central de FlowSync: que los integrantes de equipos remotos pequeños puedan consultar el estado del trabajo y tomar decisiones sin interrumpirse constantemente.

## Estructura obligatoria

Organiza tu propuesta en exactamente cinco bloques:

1. **Problema:** qué situación concreta queremos resolver.
2. **Usuarios:** quién utilizará el producto y quién obtiene el valor.
3. **Propuesta de valor:** qué cambia para esos usuarios y por qué FlowSync sería útil.
4. **Alcance:** qué funcionalidades consideras indispensables para validar la hipótesis.
5. **NO-alcance:** qué funcionalidades debemos excluir y por qué.

## Reglas para el alcance

- Sé agresivo al reducir el MVP.
- Propón una solución mínima, funcional y usable de extremo a extremo.
- Enumera individualmente las funcionalidades que propones incluir.
- Indica el número total exacto de funcionalidades propuestas.
- Justifica brevemente por qué cada funcionalidad es necesaria.
- Respeta las decisiones provisionales que ya revisamos.
- No conviertas los supuestos pendientes en funcionalidades aprobadas.
- Si alguna funcionalidad depende de un supuesto abierto, indícalo.

## Reglas para el NO-alcance

- Incluye las exclusiones establecidas en la ficha de hechos.
- Identifica otras funcionalidades que podrían parecer útiles, pero que no son indispensables para el MVP.
- Justifica cada exclusión explicando qué hipótesis del producto NO ayuda a validar.
- No utilices la falta de tiempo como justificación principal.
- Presta tanta atención al NO-alcance como al alcance.

## Restricciones

- No incluyas arquitectura, stack, endpoints, tablas ni detalles de implementación.
- No generes historias de usuario, tickets ni criterios de aceptación.
- No escribas todavía el PRD definitivo.
- No modifiques archivos.
- No realices nuevas rondas de preguntas.

Esta será únicamente tu primera propuesta.

**Yo revisaré las funcionalidades y decidiré cuáles conservar y cuáles eliminar.**

Al finalizar, identifica las decisiones de alcance más difíciles de defender, sin resolver unilateralmente los supuestos pendientes.

```

**Qué salió:** Funcionó a la primera; propuso nueve funcionalidades y justificó el NO-alcance.


## Prompt 6

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```

He revisado tu propuesta de alcance del MVP de FlowSync y he tomado mis decisiones.

Conservo las 9 funcionalidades principales que propusiste. Una de ellas, autenticación, ya está implementada.

Mi recorte se concentra en limitar la complejidad y mantener fuera las funcionalidades adicionales que no contribuyen directamente a validar la hipótesis central.

Decisiones importantes:

La fecha de vencimiento se mantiene, pero inicialmente solo permitirá agregar, consultar y quitar la fecha. La regla para identificar tareas vencidas sigue pendiente de definición por las zonas horarias.

El acceso al espacio compartido permanece dentro del alcance, pero su mecanismo es una dependencia pendiente de resolver.

No incorporaremos marcas de última actualización, historial, notificaciones, integraciones, analítica, áreas, etiquetas ni funciones avanzadas de gestión.

La edición del título y la eliminación de tareas quedan fuera por ahora, aunque reconozco los riesgos que esto implica.

Se mantienen las decisiones provisionales previamente aprobadas sobre estados, responsables, campos obligatorios, filtros y actualizaciones sin refrescar.

Para la Parte B, estos son los números reales:

Funcionalidades propuestas por la IA: 9.

Funcionalidades conservadas después de mi revisión: 9.

Funcionalidades eliminadas de esa propuesta: 0.

No alteres estos números ni afirmes que eliminé funcionalidades de las nueve propuestas.

Utiliza las tres exclusiones justificadas y la reflexión sobre la edición del título que acabamos de definir.

Ahora crea el documento:

docs/prd/alcance-mvp-cihr.md

Debe contener los tres tramos del ejercicio:

Terreno existente, resumido en 3 a 5 líneas a partir del análisis real del repositorio.

Interrogatorio: las cinco preguntas, las respuestas de la ficha y los supuestos relevantes.

Alcance del MVP en cinco bloques: problema, usuarios, propuesta de valor, alcance y NO-alcance.

Debajo, incluye la Parte B con los dos números, tres exclusiones justificadas y la exclusión que más dudas me genera.

Restricciones:

Mantén el documento breve y centrado en producto.

No agregues arquitectura, endpoints, tablas o diseño técnico.

No inventes decisiones ni des por resueltos los supuestos pendientes.

No agregues funcionalidades nuevas.

Modifica únicamente el documento solicitado.

Al terminar, muéstrame un resumen de los cambios realizados para revisarlos antes de hacer commit.

```

**Qué salió:** Generó el documento, pero eligió por su cuenta las tres exclusiones de la Parte B.


## Prompt 7

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
Revisé el documento `docs/prd/alcance-mvp-cihr.md`.

La estructura y el contenido general están aprobados.

Necesito que realices únicamente estos ajustes:

1. Sustituye la Parte B actual por la versión de tres respuestas que te proporcionaré a continuación, respetando exactamente las decisiones y cifras.

2. Mantén los tres tramos, los cinco bloques del alcance y el NO-alcance completo.

3. No agregues funcionalidades ni cambies los supuestos pendientes.

4. No modifiques ningún otro archivo.

5. Verifica que el Markdown esté correctamente formateado y que el documento mantenga un estilo breve, propio de una definición de alcance de producto.

No hagas commit todavía.

## Parte B: las tres líneas

**1. Los dos números:** 9 funcionalidades propuestas por la IA; 9 conservadas después de mi revisión.

**2. Tres exclusiones justificadas:**
- **Integraciones externas:** no ayudan a validar si los usuarios mantienen actualizado voluntariamente el estado de sus tareas dentro de FlowSync.
- **Analítica y reportes:** no contribuyen a comprobar si la visibilidad del trabajo reduce las interrupciones entre compañeros.
- **Áreas, módulos y etiquetas:** quiero comprobar primero si el título, responsable y estado bastan para identificar el trabajo y evitar duplicidades.

**3. Exclusión que más dudas me genera:** editar el título de una tarea. Excluirlo simplifica el MVP, pero podría comprometer la claridad de la información necesaria para evitar trabajo duplicado. Lo reconsideraría si durante la primera semana aparecen errores o títulos ambiguos que provoquen confusiones o interrupciones. La tensión está entre mantener la gestión extremadamente sencilla y garantizar información confiable.

```

**Qué salió:** Funcionó correctamente; Claude actualizó la Parte B con las exclusiones acordadas, conservó el resto del documento y verificó el formato sin modificar otros archivos.