# Spec viva: cuentas y acceso

## Purpose

Permitir que una persona cree una cuenta en FlowSync, inicie y cierre sesión, mantenga la sesión entre recargas del navegador y consulte su perfil, de forma que solo quien tiene una sesión válida accede a las pantallas y a los datos de su cuenta.

## Requirements

### Requirement: Registro de una cuenta nueva por la API

El sistema SHALL permitir crear una cuenta mediante `POST /api/v1/auth/signup` con `fullName`, `email`, `password` y `passwordConfirmation`, y SHALL devolver en la misma respuesta los datos públicos del usuario creado y un token de acceso, envueltos bajo la clave `data`.

#### Scenario: Registro válido con nombre

- **WHEN** se envía un registro con `fullName` "Ada Lovelace", un email no registrado, una contraseña de entre 8 y 32 caracteres y la misma contraseña en `passwordConfirmation`
- **THEN** la respuesta es exitosa (200) y su cuerpo es `{ data: { user, token } }`, donde `user` contiene `id`, `fullName`, `email`, `createdAt`, `updatedAt` e `initials`, y `token` es una cadena utilizable como credencial Bearer

#### Scenario: Registro válido sin nombre

- **WHEN** se envía un registro válido con `fullName` igual a `null`
- **THEN** la cuenta se crea y el usuario devuelto tiene `fullName` igual a `null`

#### Scenario: La respuesta no expone la contraseña

- **WHEN** se completa un registro válido
- **THEN** el objeto `user` de la respuesta no incluye la contraseña ni ningún derivado de ella

### Requirement: Validación del registro

El sistema SHALL rechazar el registro con estado 422 y un cuerpo `{ errors: [...] }`, en el que cada error indica `field`, `rule` y `message`, cuando los datos no cumplan las reglas de entrada.

#### Scenario: Email con formato inválido

- **WHEN** se envía un registro cuyo `email` no tiene formato de dirección de correo
- **THEN** la respuesta es 422 con un error sobre `email` y regla `email`

#### Scenario: Email demasiado largo

- **WHEN** se envía un registro cuyo `email` supera los 254 caracteres
- **THEN** la respuesta es 422 con un error sobre `email` y regla `maxLength`

#### Scenario: Email ya registrado

- **WHEN** se envía un registro con un `email` idéntico al de una cuenta existente
- **THEN** la respuesta es 422 con un error sobre `email` y regla `database.unique`, y no se crea una segunda cuenta

#### Scenario: Contraseña fuera de rango

- **WHEN** se envía un registro con una contraseña de menos de 8 caracteres o de más de 32
- **THEN** la respuesta es 422 con un error sobre `password` y regla `minLength` o `maxLength` respectivamente

#### Scenario: Confirmación distinta de la contraseña

- **WHEN** se envía un registro en el que `passwordConfirmation` no coincide con `password`
- **THEN** la respuesta es 422 con un error sobre `passwordConfirmation` y regla `sameAs`

#### Scenario: La confirmación también tiene límites de longitud

- **WHEN** se envía un registro con `passwordConfirmation` de menos de 8 caracteres
- **THEN** la respuesta es 422 con un error sobre `passwordConfirmation` y regla `minLength`

#### Scenario: Campos obligatorios ausentes o vacíos

- **WHEN** se envía un registro en el que falta `email`, `password` o `passwordConfirmation`, o alguno llega como cadena vacía
- **THEN** la respuesta es 422 con un error de regla `required` sobre cada campo afectado

#### Scenario: Nombre ausente

- **WHEN** se envía un registro sin la clave `fullName`
- **THEN** la respuesta es 422 con un error de regla `required` sobre `fullName`

### Requirement: Inicio de sesión por la API

El sistema SHALL permitir iniciar sesión mediante `POST /api/v1/auth/login` con `email` y `password`, y SHALL devolver, cuando las credenciales son correctas, los datos públicos del usuario y un token de acceso nuevo bajo la clave `data`.

#### Scenario: Credenciales correctas

- **WHEN** se envía el email y la contraseña de una cuenta existente
- **THEN** la respuesta es exitosa (200) con cuerpo `{ data: { user, token } }` con la misma forma que en el registro

#### Scenario: Cada inicio de sesión emite un token distinto

- **WHEN** la misma cuenta inicia sesión dos veces
- **THEN** cada respuesta contiene un token diferente y ambos permiten acceder al perfil

#### Scenario: Credenciales incorrectas

- **WHEN** se envía un email que no corresponde a ninguna cuenta, o el email de una cuenta con una contraseña errónea
- **THEN** la respuesta es 400 con cuerpo `{ errors: [{ message }] }`, sin indicar qué campo falló, y la respuesta es la misma en ambos casos

#### Scenario: Datos de entrada inválidos

- **WHEN** se envía un inicio de sesión con un `email` sin formato de correo o de más de 254 caracteres, o sin `password`
- **THEN** la respuesta es 422 con un error por campo afectado, antes de comprobar las credenciales

### Requirement: Consulta del perfil

El sistema SHALL devolver, mediante `GET /api/v1/account/profile`, los datos públicos del usuario al que pertenece el token Bearer enviado, envueltos bajo la clave `data`.

#### Scenario: Token válido

- **WHEN** se consulta el perfil con un token emitido por el registro o el inicio de sesión y no revocado
- **THEN** la respuesta es 200 con `{ data: { id, fullName, email, createdAt, updatedAt, initials } }` del usuario dueño del token

#### Scenario: Sin token o con token inválido

- **WHEN** se consulta el perfil sin cabecera de autorización, con un token inventado o con un token revocado
- **THEN** la respuesta es 401 con cuerpo `{ errors: [{ message }] }`

### Requirement: Iniciales del usuario

El sistema SHALL incluir en los datos públicos del usuario un campo `initials` en mayúsculas, calculado a partir del nombre o, si no hay nombre, del email.

#### Scenario: Nombre de dos o más palabras

- **WHEN** el usuario tiene `fullName` "ada lovelace"
- **THEN** `initials` es "AL" (primera letra de las dos primeras palabras)

#### Scenario: Nombre de una sola palabra

- **WHEN** el usuario tiene `fullName` "Ada"
- **THEN** `initials` es "AD" (las dos primeras letras)

#### Scenario: Sin nombre

- **WHEN** el usuario tiene `fullName` `null` y email "ada@example.com"
- **THEN** `initials` es "AE" (primera letra de la parte local y primera letra del dominio)

### Requirement: Cierre de sesión por la API

El sistema SHALL revocar, mediante `POST /api/v1/account/logout` con un token Bearer válido, únicamente el token usado en esa petición.

#### Scenario: Cierre con token válido

- **WHEN** se cierra sesión con un token válido
- **THEN** la respuesta es 200 con cuerpo `{ message: "Logged out successfully" }` y ese token deja de permitir el acceso al perfil

#### Scenario: Otros tokens de la misma cuenta siguen vigentes

- **WHEN** una cuenta tiene dos tokens y se cierra sesión con uno de ellos
- **THEN** el otro token sigue permitiendo el acceso al perfil

#### Scenario: Cierre sin token válido

- **WHEN** se llama al cierre de sesión sin token o con un token inválido
- **THEN** la respuesta es 401 con cuerpo `{ errors: [{ message }] }`

### Requirement: Respuestas siempre en JSON

El sistema SHALL responder en JSON en los endpoints de cuentas y acceso, también en los errores, con independencia de la cabecera `Accept` que envíe el cliente.

#### Scenario: Cliente que pide HTML

- **WHEN** se consulta el perfil sin token enviando `Accept: text/html`
- **THEN** la respuesta es 401 con cuerpo JSON `{ errors: [{ message }] }` y no una redirección ni una página HTML

### Requirement: Pantalla de registro

El sistema SHALL ofrecer en `/register` un formulario con nombre completo (marcado como opcional), email, contraseña y repetición de la contraseña, y SHALL iniciar la sesión y llevar al perfil cuando el registro tiene éxito.

#### Scenario: Registro correcto desde la pantalla

- **WHEN** una persona sin sesión rellena el formulario con datos válidos y pulsa "Crear cuenta"
- **THEN** queda con la sesión iniciada y ve la pantalla de perfil

#### Scenario: Nombre en blanco

- **WHEN** la persona deja el nombre vacío o solo con espacios y se registra
- **THEN** la cuenta se crea sin nombre

#### Scenario: Contraseñas que no coinciden, detectado en pantalla

- **WHEN** la persona escribe dos contraseñas distintas y pulsa "Crear cuenta"
- **THEN** ve el mensaje "Las contraseñas no coinciden." bajo el campo de repetición y no se envía ninguna petición al servidor

#### Scenario: Indicación de longitud de contraseña

- **WHEN** la persona ve el campo de contraseña sin errores
- **THEN** ve debajo la indicación "Entre 8 y 32 caracteres."

#### Scenario: Envío en curso

- **WHEN** la persona pulsa "Crear cuenta" y la respuesta aún no ha llegado
- **THEN** el botón muestra "Creando cuenta…" y está deshabilitado

#### Scenario: Enlace a inicio de sesión

- **WHEN** la persona está en la pantalla de registro
- **THEN** ve el texto "¿Ya tienes cuenta?" con un enlace "Inicia sesión" que lleva a `/login`

### Requirement: Pantalla de inicio de sesión

El sistema SHALL ofrecer en `/login` un formulario con email y contraseña, y SHALL iniciar la sesión y llevar al perfil cuando las credenciales son correctas.

#### Scenario: Inicio correcto desde la pantalla

- **WHEN** una persona sin sesión introduce credenciales correctas y pulsa "Entrar"
- **THEN** queda con la sesión iniciada y ve la pantalla de perfil

#### Scenario: Credenciales incorrectas en pantalla

- **WHEN** la persona introduce credenciales incorrectas y pulsa "Entrar"
- **THEN** ve un aviso general con el texto "El email o la contraseña no son correctos."

#### Scenario: Envío en curso

- **WHEN** la persona pulsa "Entrar" y la respuesta aún no ha llegado
- **THEN** el botón muestra "Entrando…" y está deshabilitado

#### Scenario: Enlace a registro

- **WHEN** la persona está en la pantalla de inicio de sesión
- **THEN** ve el texto "¿Aún no tienes cuenta?" con un enlace "Crea una" que lleva a `/register`

### Requirement: Presentación de errores en los formularios de acceso

El sistema SHALL mostrar los errores de validación del servidor en castellano bajo el campo al que se refieren cuando ese campo está en pantalla, y SHALL mostrar un aviso general en la parte superior del formulario cuando el error no puede asociarse a un campo visible.

#### Scenario: Error de validación de un campo visible

- **WHEN** el servidor rechaza el formulario con un error sobre un campo que la pantalla muestra
- **THEN** el mensaje traducido aparece bajo ese campo, el campo queda marcado como inválido y no aparece aviso general

#### Scenario: Mensajes traducidos por tipo de error

- **WHEN** el servidor devuelve un error de email ya registrado, de formato de email, de campo obligatorio, de longitud mínima o máxima, o de contraseñas distintas
- **THEN** la persona ve, respectivamente, "Ese email ya está registrado. Inicia sesión en su lugar.", "Introduce una dirección de email válida.", "Falta rellenar …", "… debe tener al menos N caracteres.", "… no puede superar los N caracteres." o "Las contraseñas no coinciden."

#### Scenario: Varios errores en el mismo campo

- **WHEN** el servidor devuelve más de un error para el mismo campo
- **THEN** bajo ese campo solo se muestra el primero

#### Scenario: Servidor inaccesible

- **WHEN** la persona envía un formulario de acceso y el servidor no responde
- **THEN** ve el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado."

#### Scenario: Error inesperado del servidor

- **WHEN** el servidor responde con un error que no es de validación, de credenciales ni de autorización
- **THEN** la persona ve el aviso "Algo ha ido mal en el servidor. Inténtalo de nuevo en un momento."

#### Scenario: Nuevo intento limpia los errores anteriores

- **WHEN** la persona vuelve a enviar el formulario tras un error
- **THEN** los errores anteriores desaparecen mientras se procesa el nuevo envío

### Requirement: Persistencia de la sesión en el navegador

El sistema SHALL conservar la sesión entre recargas del navegador y SHALL revalidarla contra el servidor al cargar la aplicación antes de dar acceso a las pantallas protegidas.

#### Scenario: Recarga con sesión válida

- **WHEN** una persona con sesión iniciada recarga la página del perfil
- **THEN** ve un indicador de carga mientras se revalida la sesión y después vuelve a ver su perfil, sin pasar por el inicio de sesión

#### Scenario: Sesión rechazada por el servidor al recargar

- **WHEN** la aplicación carga con una sesión guardada que el servidor ya no reconoce
- **THEN** la sesión guardada se descarta, la persona llega a `/login` y ve el aviso "Tu sesión ha caducado. Vuelve a iniciar sesión."

#### Scenario: Servidor inaccesible al recargar

- **WHEN** la aplicación carga con una sesión guardada y el servidor no responde
- **THEN** la persona llega a `/login` con el aviso "No se pudo conectar con el servidor. Comprueba que el backend está arrancado.", y la sesión guardada se conserva, de modo que al recargar con el servidor disponible vuelve a entrar sin introducir credenciales

#### Scenario: El aviso de sesión perdida cede ante un error nuevo

- **WHEN** la pantalla de inicio de sesión muestra un aviso de sesión perdida y la persona hace un intento fallido
- **THEN** el aviso pasa a mostrar el error de ese intento

### Requirement: Protección de rutas y navegación

El sistema SHALL permitir el acceso a `/profile` solo con sesión válida, SHALL impedir el acceso a `/login` y `/register` con sesión válida, y SHALL redirigir cualquier otra ruta a `/profile`.

#### Scenario: Acceso al perfil sin sesión

- **WHEN** una persona sin sesión abre `/profile`
- **THEN** es redirigida a `/login`

#### Scenario: Acceso a pantallas públicas con sesión

- **WHEN** una persona con sesión iniciada abre `/login` o `/register`
- **THEN** es redirigida a `/profile`

#### Scenario: Ruta desconocida

- **WHEN** se abre una ruta que no es `/login`, `/register` ni `/profile` (incluida `/`)
- **THEN** se redirige a `/profile`, que a su vez lleva a `/login` si no hay sesión

#### Scenario: Revalidación en curso

- **WHEN** se abre cualquier pantalla mientras se está revalidando una sesión guardada
- **THEN** se muestra un indicador de carga y no se redirige hasta conocer el resultado

### Requirement: Pantalla de perfil

El sistema SHALL mostrar en `/profile` las iniciales, el nombre, el email y la fecha de alta del usuario con sesión iniciada.

#### Scenario: Usuario con nombre

- **WHEN** una persona con nombre "Ada Lovelace" abre su perfil
- **THEN** ve un círculo con sus iniciales, su nombre, su email y "Miembro desde" seguido de la fecha de alta en formato largo en castellano (por ejemplo, "1 de noviembre de 2026")

#### Scenario: Usuario sin nombre

- **WHEN** una persona registrada sin nombre abre su perfil
- **THEN** en lugar del nombre ve "Sin nombre"

### Requirement: Cierre de sesión desde la pantalla

El sistema SHALL cerrar la sesión en el navegador al pulsar "Cerrar sesión" y llevar a la persona a la pantalla de inicio de sesión, aunque el servidor no confirme la revocación.

#### Scenario: Cierre con servidor disponible

- **WHEN** una persona pulsa "Cerrar sesión" en su perfil
- **THEN** llega a `/login`, ya no puede volver a `/profile` sin iniciar sesión de nuevo, y el token usado queda revocado en el servidor

#### Scenario: Cierre con servidor inaccesible

- **WHEN** una persona pulsa "Cerrar sesión" y el servidor no responde
- **THEN** llega igualmente a `/login` sin ningún aviso de error

#### Scenario: Recarga tras cerrar sesión

- **WHEN** una persona cierra sesión y recarga la página
- **THEN** sigue sin sesión y ve la pantalla de inicio de sesión

---

## 1. Requisitos escritos y comprobados

- Escritos por el agente: 14
- Comprobados por mí: 8

## 2. Incoherencias detectadas

- Campo fullName: el formulario presenta el nombre como opcional, mientras que la API requiere que la propiedad esté presente, aunque permite el valor null. El frontend resuelve esto enviando null cuando el campo está vacío. No representa necesariamente un error funcional, pero sí una diferencia en el contrato de entrada.
Ubicación: frontend/src/pages/register-page.tsx:64-68 y backend/app/validators/user.ts:13

- Formato de respuestas: los endpoints de registro e inicio de sesión devuelven sus resultados bajo la propiedad data, mientras que el cierre de sesión devuelve directamente un objeto message en inglés. Se identifica una inconsistencia de formato entre las respuestas de la API, aunque la spec refleja el comportamiento actual.
Ubicación: backend/app/controllers/new_account_controller.ts:13-16 y backend/app/controllers/access_tokens_controller.ts:25-27

- Interpretación de errores HTTP 400: el cliente muestra el mensaje «El email o la contraseña no son correctos» ante cualquier respuesta HTTP 400, aunque el error pudiera tener otra causa. Esto podría producir mensajes incorrectos en operaciones distintas al inicio de sesión.
Ubicación: frontend/src/lib/api.ts:82-85

## 3. Ambigüedades entre bug y contrato

- Alcance del cierre de sesión: el backend elimina únicamente el token utilizado en la petición de logout. No es posible determinar si el comportamiento esperado consiste en cerrar la sesión del dispositivo actual o invalidar todas las sesiones activas de la cuenta. Esta decisión requiere confirmar el contrato de producto.

- Recuperación de sesión ante fallos del servidor: cuando el backend no está disponible durante la recuperación de una sesión, el frontend conserva el token almacenado, pero cambia el estado de autenticación a anonymous, provocando la redirección al login. No queda claro si este comportamiento es intencional por seguridad o si debería mostrarse un estado de error que permita reintentar la conexión sin abandonar la pantalla protegida.
