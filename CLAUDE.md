# CLAUDE.md

## Contexto del proyecto

Este proyecto fue iniciado en Emergent y ahora será continuado con Claude.

El repositorio tiene dos partes principales:

- `frontend/`: aplicación UI en React usando CRACO, Tailwind CSS y Yarn.
- `backend/`: backend existente. No modificar salvo autorización explícita.

La rama activa para el trabajo con Claude es:

`timeline-evidence-claude`

## Objetivo actual

Continuar el desarrollo UI de forma profesional, ordenada y segura.

La prioridad es mejorar la interfaz, experiencia de usuario, estructura visual, responsive design y calidad del frontend sin romper la funcionalidad existente.

## Reglas obligatorias para Claude

Antes de editar cualquier archivo, Claude debe:

1. Explorar la estructura del proyecto.
2. Leer `frontend/package.json`.
3. Identificar el stack real.
4. Revisar `frontend/src`, estilos globales, rutas y componentes principales.
5. Entender qué existe antes de proponer cambios.
6. No editar archivos hasta presentar un plan.

## Restricciones importantes

- No trabajar directamente en `main`.
- No reescribir toda la app.
- No cambiar rutas existentes sin autorización.
- No tocar backend salvo que sea necesario y se apruebe.
- No modificar lógica de autenticación, APIs, base de datos o seguridad sin permiso.
- No cambiar dependencias grandes sin justificarlo.
- No subir `.env`, claves, tokens o secretos.
- No modificar datos sensibles.
- No borrar funcionalidad existente.

## Comandos del frontend

Desde la carpeta `frontend/`:

    npx yarn@1.22.22 install
    npx yarn@1.22.22 start
    npx yarn@1.22.22 build

El frontend corre normalmente en:

    http://localhost:3000

Ruta probada:

    http://localhost:3000/escribanos/panel

## Estado verificado

- El repositorio fue clonado localmente.
- La rama `timeline-evidence-claude` está conectada con GitHub.
- El frontend instala dependencias correctamente.
- El frontend corre localmente.
- El build de producción compila correctamente.
- `frontend/yarn.lock` fue creado y subido al repo.

## Arquitectura esperada

Claude debe mantener una arquitectura modular.

Buenas prácticas:

- Componentes pequeños y reutilizables.
- Separar componentes visuales de lógica.
- Evitar archivos gigantes.
- Evitar duplicación de estilos.
- Mantener consistencia visual.
- Mejorar responsive design.
- Mejorar accesibilidad.
- Preservar naming y rutas existentes.
- Hacer cambios pequeños, revisables y seguros.

## Flujo de trabajo requerido

Para cualquier cambio grande:

1. Analizar.
2. Presentar diagnóstico.
3. Proponer plan.
4. Listar archivos que tocaría.
5. Esperar aprobación.
6. Implementar cambios pequeños.
7. Ejecutar build.
8. Resumir qué cambió, riesgos y próximos pasos.

## Primer objetivo para Claude

Realizar una auditoría UI del proyecto.

Claude debe entregar:

- Stack detectado.
- Mapa de carpetas.
- Componentes principales.
- Problemas de UI.
- Problemas responsive.
- Problemas de accesibilidad.
- Deuda técnica generada por Emergent.
- Archivos críticos.
- Plan de mejora por fases.
- Primer cambio pequeño y seguro recomendado.

No editar archivos durante la auditoría inicial.
