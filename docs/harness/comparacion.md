# FLOW-4 — Comparación con y sin harness

| Criterio | Sin harness | Con harness |
|---|---|---|
| **Archivos propuestos** | **≥22 identificables:** 14 nuevos, 7 modificados y `App.css` eliminado; además, assets de demo sin precisar. | **26 identificables:** 15 nuevos, 7 modificados y 4 eliminados. La instalación podría modificar también `package.json` y el lockfile. |
| **Convenciones** | Respetó React/Vite, shadcn/ui, backend intacto y contrato API (`passwordConfirmation`, `{data}`, errores). Sin `CLAUDE.md` ni hooks que evaluar. Sin infracción comprobada. | Propuso respetar backend intacto, TypeScript, lint, Prettier, shadcn/ui y flujo rama → `/commit` → PR → revisión adversarial. No se pudo verificar su ejecución. Sin infracción comprobada. |
| **Intervenciones** | **0 aclaraciones observadas.** Decidió por su cuenta nombre, token, sesión y logout. | **4 aclaraciones:** registro, posregistro, token y logout. Se eligió confirmación sin nombre, perfil tras signup, `localStorage` y logout. |
| **Arreglos manuales** | Ninguno ejecutado. Revisaría el campo de nombre opcional, seguridad del token y archivos generados. | Ninguno ejecutado. Comprobaría script `npm run format`, Node 24, destino del PR y automatizaciones. |

**Diferencia técnica:** sin harness concentra la sesión en `src/lib/auth.tsx` y propone `VITE_API_URL`; con harness separa proveedor, hook y ruta protegida, y propone proxy Vite.

**Límite metodológico:** con harness recibió el ticket desde Jira MCP; sin harness recibió el mismo texto pegado. Los recuentos son de rutas identificables en los planes, no cambios realizados; excluyen archivos generados no detallados. **Ninguna regla del harness puede calificarse como incumplida solo porque la corrida sin harness tomó decisiones autónomas.**

## Parte B — Tres líneas

1. **Alcance y dificultad:** completé las **8/8 piezas** del harness. Ninguna me resultó especialmente difícil; todas tuvieron una dificultad parecida. Las que percibí como más complejas fueron la skill `/priority-ticket`, por combinar Jira y la planificación, y el subagente `adversarial-reviewer`, por sus reglas de revisión de solo lectura.
2. **Primera diferencia:** sin harness añadió «Nombre» opcional directamente; con harness preguntó por los campos y elegí email, contraseña y confirmación (`fullName: null`). Lo detecté en la primera pregunta de planificación, al contrastarla con el otro plan.
3. **Regla incumplida:** no identifiqué ningún incumplimiento comprobable del harness durante esta prueba. La corrida terminó en la planificación, así que no se pusieron a prueba las reglas de implementación, `/commit`, PR o revisión adversarial. El agente **sin harness** decidió varias cuestiones por su cuenta, pero esto es una diferencia de comportamiento, **no** un incumplimiento de reglas que no tenía.
