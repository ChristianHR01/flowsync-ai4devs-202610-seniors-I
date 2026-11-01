## Prompt 1

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```
## 1. Contexto y rol

Actúa como analista de software especializado en
Spec-Driven Development (SDD).

Trabajamos sobre código existente. El objetivo es
describir su comportamiento actual, no diseñar
funcionalidades futuras.

## 2. Objetivo

Explora el vertical completo de cuentas y acceso
de FlowSync, tanto en backend como en frontend.

Analiza:
- Registro de usuarios.
- Inicio de sesión.
- Estado y persistencia de sesión.
- Consulta del perfil.
- Cierre de sesión.
- Validaciones, errores y respuestas observables.
- Protección de rutas y navegación.

Genera una spec viva en:
docs/spec-viva/cihr.md

## 3. Criterios de éxito

El documento debe cumplir exactamente el formato:

## Purpose
## Requirements
### Requirement: [nombre]
#### Scenario: [nombre]
- **WHEN** [condición o acción observable]
- **THEN** [resultado observable]

Cada requisito debe utilizar SHALL.

Redacta en español, excepto las palabras
reservadas del formato.

Describe únicamente comportamientos que puedas
respaldar con el código existente.

Al finalizar, informa:
- Cantidad de requisitos generados.
- Componentes del sistema examinados.
- Comportamientos que no pudiste determinar.
- Posibles contradicciones que deba revisar.

## 4. Restricciones

- No modificar código existente.
- No corregir bugs.
- No agregar funcionalidades.
- No ejecutar openspec init.
- No generar deltas ADDED/MODIFIED/REMOVED.
- No incluir detalles internos de implementación
  dentro de la spec.
- No documentar gestión de tareas.
- No asumir que el PRD refleja el sistema actual.
- No inventar comportamientos o validaciones.
- No afirmar que los requisitos fueron
  comprobados por mí.
- No crear commits ni Pull Requests.

## 5. Recursos

Consulta el README del ejercicio, CLAUDE.md,
las rutas, controladores, modelos, validadores
y middlewares del backend.

En frontend revisa formularios, componentes,
estado de autenticación, servicios y rutas.

Utiliza el código como fuente de evidencia.

## 6. Formato de entrega

Crea docs/spec-viva/cihr.md.

Al final del archivo reserva tres apartados:

1. Requisitos escritos y comprobados.
2. Incoherencias detectadas.
3. Ambigüedades entre bug y contrato.

No completes las observaciones personales ni
inventes resultados para estos apartados.
Los completaremos después mediante una
revisión humana del código.

Responde con un resumen breve de lo generado.

```

**Qué salió:** Un resumen de lo que género.

# Prompt 2

**Modelo:** Opus 5.5
**Herramienta:** Claude Code

```

Ayúdame a realizar la revisión humana de la spec viva
en docs/spec-viva/cihr.md, requisito por requisito.

Comenzaremos con el requisito 1:
"Registro de una cuenta nueva por la API".

Para cada escenario:
1. Indícame qué archivos y líneas debo revisar.
2. Explícame brevemente qué debo buscar y por qué.
3. Señala qué afirmaciones requieren una prueba real.

No hagas la verificación por mí ni me des una
conclusión definitiva.

Quiero abrir los archivos, entender el código y
determinar personalmente si cumple la spec.

No modifiques archivos ni ejecutes pruebas.

Sé breve y concreto.

```

**Qué salió:** Una pequeña guía que indica donde revisar el código.