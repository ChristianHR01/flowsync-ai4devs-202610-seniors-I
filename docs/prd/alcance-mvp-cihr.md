# FlowSync: alcance del MVP

## Tramo 1: Terreno existente

Hoy el repositorio solo tiene **autenticación**: registro, inicio de sesión con token, consulta del perfil y cierre de sesión, con sus pantallas en el frontend (login, registro y perfil) y rutas protegidas.
El modelo de datos tiene dos entidades: **usuario** (email, nombre opcional, contraseña) y **token de acceso**.
No existe nada de tareas, equipos ni espacios, y no hay tests.
La base técnica de la API, las validaciones y la interfaz ya está montada para construir encima.

## Tramo 2: Interrogatorio

| #   | Pregunta                                               | Respuesta de la ficha                                                                                                                                                                                  |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Problema:** ¿qué situación concreta duele?           | La ronda de "¿en qué estás?" de la daily (la mitad de sus 15 min) y las interrupciones por chat. Dos personas tocaron el mismo módulo sin saberlo: dos días perdidos.                                  |
| 2   | **Usuarios:** ¿quién es y quién obtiene el valor?      | Los pares, no un lead. Equipos remotos de 3 a 10 personas con roles planos. Caso de estudio: 6 personas de producto SaaS en 3 husos horarios.                                                          |
| 3   | **Tiempo real:** ¿qué significa?                       | Ver los cambios de estado de las tareas sin refrescar. El estado es de la tarea, no de la persona: sin presencia ni chat. Es un resumen que espera, sin push. Lo actualiza a mano quien hace la tarea. |
| 4   | **"Menos rollo que Jira":** ¿qué sobra y qué se queda? | Crear una tarea y cambiarle el estado en segundos, sin configurar nada. Se renuncia a sprints, estimaciones, épicas, backlog e informes. FlowSync sustituye al gestor actual, no convive con él.       |
| 5   | **Éxito y limitaciones**                               | A la semana de uso, el equipo cancela la ronda de "¿en qué estás?" y nadie pide que vuelva. Se construye una vertical fina y terminada.                                                                |

### Decisiones provisionales aceptadas

- Tres estados fijos: **Pendiente, En curso y Hecha**.
- Responsable **opcional y único**. Puede haber tareas sin asignar.
- Solo el **título** es obligatorio. La tarea nace en Pendiente.
- La vista por defecto muestra las tareas **no hechas**, con filtro por estado.
- Los cambios se ven **sin refrescar**. Sin chat, sin presencia y sin notificaciones.

### Supuestos pendientes de validación

- **Marca de última actualización:** no está aprobada.
- **Zonas horarias:** falta una regla para decidir cuándo está vencida una tarea.
- **Acceso al espacio:** los roles son planos, pero falta definir quién puede entrar.
- **Plazo de desarrollo:** la ficha no lo establece.

### Riesgos

1. Que el equipo de referencia necesite gestión avanzada, que queda fuera.
2. Que los títulos no basten para evitar que dos personas trabajen en el mismo módulo.
3. Que los estados no se mantengan al día; si pasa, FlowSync pierde su valor.

## Tramo 3: Alcance del MVP

### 1. Problema

En un equipo remoto pequeño nadie ve en qué está cada uno sin interrumpir a alguien. Por eso existen la ronda de "¿en qué estás?" de la daily y las preguntas constantes por chat. Cuando esa información no llega, dos personas empiezan el mismo trabajo sin saberlo.

### 2. Usuarios

Los integrantes de equipos remotos de 3 a 10 personas con roles planos. El valor es para los pares:

- quien va a empezar algo y necesita saber si otro ya lo está tocando;
- quien busca qué coger después;
- quien hoy recibe interrupciones preguntándole cómo va.

No hay un consumidor jerárquico del producto.

### 3. Propuesta de valor

El estado del equipo se ve de un vistazo, sin preguntar. Esto cambia dos decisiones: **no empezar lo que otro ya está tocando** y **elegir lo siguiente sabiendo qué está libre**.

Se sostiene porque quien actualiza también gana algo en el momento: la lista es su propia cola de trabajo, actualizarla cuesta dos clics y a cambio deja de recibir interrupciones.

### 4. Alcance: 9 funcionalidades

| #   | Funcionalidad                                                                                                          | Por qué es necesaria                                                                       |
| --- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 1   | Identificarse: registro, entrada y salida. _Ya implementada._                                                          | Sin identidad no hay responsable.                                                          |
| 2   | Entrar al espacio compartido. **Depende del supuesto pendiente de acceso.**                                            | El MVP es un único espacio y necesita una regla de quién lo ve.                            |
| 3   | Crear una tarea con solo el título.                                                                                    | Si crear una tarea cuesta más de unos segundos, la lista deja de reflejar el trabajo real. |
| 4   | Ver la lista del equipo: por defecto las no hechas, con título, estado, responsable y fecha.                           | Es la pantalla que sustituye a la ronda de "¿en qué estás?".                               |
| 5   | Cambiar el estado (Pendiente, En curso, Hecha) en dos clics.                                                           | _En curso_ es la señal que evita las colisiones.                                           |
| 6   | Asignar o liberar el responsable, incluido tomar uno mismo una tarea libre.                                            | "Qué está libre" solo existe si hay tareas sin asignar que alguien pueda tomar.            |
| 7   | Agregar, consultar y quitar la fecha de vencimiento. **La regla de "vencida" queda pendiente por las zonas horarias.** | Permite ver de un vistazo los plazos.                                                      |
| 8   | Filtrar por estado.                                                                                                    | Permite centrarse en lo pendiente sin perder la vista por defecto.                         |
| 9   | Ver los cambios sin refrescar.                                                                                         | Si el dato llega tarde cuando alguien va a coger una tarea, la colisión se repite.         |

### 5. NO-alcance

| Exclusión                                                       | Qué hipótesis no ayuda a validar                                               |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Notificaciones push y recordatorios                             | La señal tiene que esperar a que la miren, no interrumpir.                     |
| Integraciones (Slack, Git/PRs, CI, calendario)                  | FlowSync sustituye, no convive. Derivar el estado de fuera es otro producto.   |
| Roles y permisos avanzados                                      | Los roles son planos; una jerarquía no aporta nada a "quién está en qué".      |
| Analítica, reporting e historial de cambios                     | No hay reporte hacia arriba y nadie lo usa para decidir.                       |
| Comentarios en tareas                                           | Convierten la tarea en conversación; la hipótesis trata del estado.            |
| Sprints, estimaciones, épicas, backlog priorizado, orden manual | Renuncia explícita: un equipo que lo necesite no es nuestro usuario.           |
| Varios equipos o espacios                                       | La hipótesis se valida en un solo equipo.                                      |
| Presencia e indicadores de actividad                            | Es vigilancia, rechazada a propósito.                                          |
| Estados configurables                                           | Configurar flujos es justo el "rollo" del que se huye.                         |
| Áreas, etiquetas, descripción de la tarea                       | Primero hay que comprobar si el título basta (riesgo 2).                       |
| Marca de última actualización                                   | Supuesto pendiente, no aprobado.                                               |
| Editar el título y borrar tareas                                | No cambian ninguna de las dos decisiones; los riesgos se asumen (ver Parte B). |

## Parte B: las tres líneas

**1. Los dos números:** 9 funcionalidades propuestas por la IA; 9 conservadas después de mi revisión.

**2. Tres exclusiones justificadas:**

- **Integraciones externas:** no ayudan a validar si los usuarios mantienen actualizado voluntariamente el estado de sus tareas dentro de FlowSync.
- **Analítica y reportes:** no contribuyen a comprobar si la visibilidad del trabajo reduce las interrupciones entre compañeros.
- **Áreas, módulos y etiquetas:** quiero comprobar primero si el título, responsable y estado bastan para identificar el trabajo y evitar duplicidades.

**3. Exclusión que más dudas me genera:** editar el título de una tarea. Excluirlo simplifica el MVP, pero podría comprometer la claridad de la información necesaria para evitar trabajo duplicado. Lo reconsideraría si durante la primera semana aparecen errores o títulos ambiguos que provoquen confusiones o interrupciones. La tensión está entre mantener la gestión extremadamente sencilla y garantizar información confiable.
