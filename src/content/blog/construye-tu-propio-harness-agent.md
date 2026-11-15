---
title: "Construye tu propio Harness Agent"
description: "Guía práctica y didáctica para crear tu propio arnés de agente: subagentes, skills, commands, specs OpenSpec, MCP y memoria persistente con Engram."
pubDate: 2026-07-30
tags: ["OpenCode", "Agentes", "MCP", "SDD", "Engram", "LLMs"]
draft: false
---

**Guía completa · OpenCode CLI**

De hacer preguntas en el chat a tener un orquestador con subagentes especializados trabajando en tu código.
Esta guía cubre todos los artefactos que necesitas crear, explicados desde cero.

`🛠 OpenCode CLI` - `🐍 Python` - `📐 Estándares: AGENTS.md · AgentSkills · OpenSpec`

---

# 1. Introducción al Harness

## Fundamentos: Chat IA vs IA Agéntica

> [!NOTE] **🎪 Analogía central**
> Imagina que tienes un amigo muy listo. **Chat IA** es llamarle por teléfono: te dice cosas, tú las copias y haces el trabajo. **IA Agéntica** es que ese amigo venga a tu casa: abre el ordenador, escribe el código, lo ejecuta, ve el error, lo corrige, y repite — todo sin que tú intervengas. El **Harness** es el director que coordina a varios de esos amigos especializados.

### ¿Qué es un agente?

Un agente es una IA que opera en un bucle **Percibir → Decidir → Actuar → Observar**. A diferencia de un chat, puede ejecutar código, editar archivos, leer resultados, corregir errores y volver a intentarlo — todo de forma autónoma.

| Dimensión | Chat IA | IA Agéntica |
| --- | --- | --- |
| **Quién ejecuta el código** | Tú, copy-paste | El agente, directamente |
| **El error** | Tú copias el error y preguntas | El agente ve el error y se autocorrige |
| **Contexto del proyecto** | Tú lo explicas cada vez | El agente lee AGENTS.md y lo tiene |
| **Coordinación** | No existe | Orquestador delega a subagentes |
| **Memoria de sesión** | La conversación | Archivos en disco, specs persistentes |

### ¿Qué es un harness?

Un **harness** (arnés) es el sistema que envuelve a los agentes y controla su entorno: qué pueden ver, qué pueden ejecutar, y en qué orden trabajan. En OpenCode, el harness se construye con archivos markdown bien escritos — sin código Python ni scripts adicionales. El harness define el terreno de juego; los agentes juegan dentro de él.

> [!NOTE] **OpenCode vs Claude Code**
> Esta guía usa **OpenCode** (open source, go CLI) como base. Todo el sistema de archivos — AGENTS.md, skills, openspec, commands — funciona igual en **Claude Code** (Anthropic). La única diferencia está en el archivo de configuración de MCPs: opencode.json vs .mcp.json. Ambas herramientas leen AGENTS.md de forma nativa.

**Referencia:** [1](#ref1) · [2](#ref2)

## El ecosistema completo

Antes de crear ningún archivo, necesitas entender el mapa: qué hace cada pieza y cómo se referencian entre sí.

> [!NOTE] **To-do list**
> A partir de ahora vamos a utilizar como ejemplo la construcción de un backend para hacer un proyecto: *"To-do list"*

```text
tu-proyecto/
  │
  ├── AGENTS.md ← reglas maestras, lo lee TODO agente primero
  ├── ARCHITECTURE.md ← mapa del sistema (capas, módulos, decisiones)
  │
  │
  ├── .opencode/ ← configuración local de OpenCode
  │ ├── skills/ ← "cómo hacer" cosas concretas (AgentSkills)
  │ │ ├── fastapi-endpoint/SKILL.md
  │ │ ├── db-migration/SKILL.md
  │ │ └── test-pattern/SKILL.md
  │ └── commands/ ← slash commands reutilizables
  │ ├── harness-run.md
  │ ├── harness-proposal.md
  │ └── harness-review.md
  ├── agents/ ← definición de cada rol del harness
  │ ├── orchestrator.md
  │ ├── backend.md
  │ ├── tester.md
  │ ├── reviewer.md
  │ └── docwriter.md
  │
  ├── openspec/ ← specs del sistema (OpenSpec)
  │ ├── specs/ ← verdad actual ya implementada
  │ │ └── todo-crud/spec.md
  │ └── changes/ ← features en progreso
  │ └── add-priority/
  │ ├── proposal.md
  │ ├── tasks.md
  │
  │
  ├── opencode.json ← MCPs para OpenCode
  └── .mcp.json ← MCPs para Claude Code (mismo contenido)
```

| Documento | Responde a… | Lo lee… |
| --- | --- | --- |
| `AGENTS.md` | ¿Cómo se trabaja aquí? | Todos los agentes, siempre |
| `ARCHITECTURE.md` | ¿Cómo está construido el sistema? | Orchestrator, reviewer |
| `agents/X.md` | ¿Qué hace este rol? | El agente cuando adopta ese rol |
| `skills/X/SKILL.md` | ¿Cómo se hace esta tarea concreta? | El agente indicado en agents del frontmatter |
| `commands/X.md` | ¿Qué pasos sigue este slash command? | OpenCode al recibir /comando |
| `openspec/specs/X/spec.md` | ¿Qué hace el sistema HOY? | Orchestrator, reviewer antes de modificar algo |
| `openspec/changes/X/*.md` | ¿Qué estamos construyendo AHORA? | Backend, tester durante la implementación |

---

# 2. Documentos Base

## AGENTS.md — El contrato con la IA

> [!NOTE] **🏠 Analogía**
> AGENTS.md son las normas pegadas en la nevera cuando llegas a un Airbnb: "el Wi-Fi es X, el cubo de basura está aquí, no hagas ruido después de las 22h". El agente las lee antes de hacer cualquier cosa, igual que tú las lees antes de instalarte.

AGENTS.md es el único archivo que todo agente lee siempre, sin excepción, antes de tocar nada. No es el README del proyecto (ese es para humanos). Es el contrato entre tú y el agente sobre cómo se trabaja en este proyecto.

> [!TIP] **✅ Estándar oficial**
> El formato AGENTS.md está mantenido por la Agentic AI Foundation bajo la Linux Foundation. Es compatible de forma nativa con OpenCode, Claude Code, Codex, Jules (Google), Cursor, Devin, GitHub Copilot Agent y más de 60.000 proyectos open source.

**Referencia:** [3](#ref3)

**Estructura recomendada**

> [!NOTE] **AGENTS.md (El contrato con la IA), ejemplo de un proyecto de lista de tareas:**

````markdown
# AGENTS.md — Todo Harness

> Este archivo es leído automáticamente por OpenCode, Claude Code, Cursor
> y la mayoría de agentes antes de cualquier tarea. No es el README.

## Resumen del proyecto
API REST de una lista de tareas. Stack: Python 3.12, FastAPI, SQLAlchemy
async 2.0, PostgreSQL, Docker, uv workspaces.

## Antes de empezar CUALQUIER tarea
1. Lee ARCHITECTURE.md para entender la estructura del sistema.
2. Si la tarea implica funcionalidad nueva → el spec debe existir en
   openspec/changes/ antes de escribir código.
   Créalo con /harness-proposal si no existe.
3. Identifica el agente responsable leyendo agents/orchestrator.md.
4. Lee la skill relevante en .opencode/skills/ antes de implementar.

## Comandos de entorno
- Instalar dependencias:   uv sync
- Levantar BD + API:       docker compose up -d
- Correr API en local:     uv run uvicorn app.main:app --reload
- Correr tests:            uv run pytest
- Test específico:         uv run pytest -k "nombre_del_test"
- Nueva migración:         uv run alembic revision --autogenerate -m "msg"
- Aplicar migraciones:     uv run alembic upgrade head
- Linting:                 uv run ruff check .

## Estilo de código
- Python 3.12+ con type hints en todas las funciones. Prohibido Any.
- SQLAlchemy 2.0 async: usar AsyncSession y select(). Nunca síncrono.
- Pydantic v2 para todos los schemas. Nunca devolver modelos de ORM.
- Nombres de tabla: snake_case plural (todos, no Todo ni todo).
- Cada recurso en su propio router: app/routers/{recurso}.py.

## Flujo del harness
orchestrator → backend → tester → reviewer → docwriter
El orquestador puede saltarse pasos según el tipo de tarea.
Ver agents/orchestrator.md para el protocolo completo.

## MCPs disponibles
- postgres:  consultar/inspeccionar BD directamente (debug, verificación)
- github:   crear PRs, leer issues, añadir comentarios

## Qué NO hacer
- No commitear directamente a main. Siempre rama + PR.
- No modificar openspec/specs/ manualmente.
- No poner lógica de negocio en routers ni SQL en services.
- No usar print() en código final; usar logging.

## PRs
Formato título: [todo-harness] descripción corta
Antes de abrir PR: uv run pytest y uv run ruff check . en verde.
Enlazar en la descripción al change de openspec correspondiente.
````

- **Reglas de buena escritura**
    - **Sé específico sobre los comandos**: escribe exactamente `uv run pytest`, no "corre los tests".
    - **Prohíbe explícitamente lo que no quieres**: la sección "Qué NO hacer" es tan importante como las instrucciones positivas.
    - **Referencia otros documentos con rutas relativas**: el agente las puede seguir.
    - **Mantén AGENTS.md lean**: el detalle va en skills y en agents/. AGENTS.md es el índice, no la enciclopedia.

## ARCHITECTURE.md — El mapa del sistema

Mientras AGENTS.md *define cómo trabajar*, ARCHITECTURE.md explica *cómo está construido el sistema*. Es el documento que el orquestador lee para entender qué agente necesita cada tarea.

> [!NOTE] **ARCHITECTURE.md (El mapa del sistema), ejemplo de un proyecto de lista de tareas:**

````markdown
# ARCHITECTURE.md — Todo Harness

# Capas del sistema

HTTP (routers)     app/routers/        ← solo valida input, enruta, devuelve schema
Business (services) app/services/       ← lógica de negocio, sin conocimiento HTTP
Data (repositories) app/repositories/   ← queries SQLAlchemy async, nada de negocio
Schemas             app/schemas/        ← Pydantic v2 I/O, nunca modelos ORM
Models              app/models/         ← SQLAlchemy declarative models
Migrations          alembic/            ← versionado de BD

## Regla de capas (CRÍTICA)
Router → Service → Repository. En ese orden, nunca al revés.
Un router NO llama a un repository directamente.
Un service NO importa nada de FastAPI (ni Request, ni HTTPException directo).

## Árbol de módulos
app/
├── main.py              ← FastAPI app, exception handlers globales, routers registrados
├── dependencies.py      ← inyección de dependencias (get_db, get_service...)
├── routers/             ← un archivo por recurso
├── services/            ← un archivo por dominio
├── repositories/        ← un archivo por modelo
├── schemas/             ← {recurso}.py con Create / Read / Update
└── models/              ← {recurso}.py con el modelo SQLAlchemy

## Agentes y responsabilidades
backend.md    → código nuevo, endpoints, models, services, repositories
tester.md     → tests unitarios e integración, fixtures, cobertura
reviewer.md   → calidad, adherencia a capas, seguridad, type hints
docwriter.md  → docstrings, README, descripciones OpenAPI

## Decisiones de diseño relevantes
- AsyncSession: toda la capa de datos usa async/await. Nunca sync con greenlets.
- Alembic con autogenerate: los modelos son la fuente de verdad del esquema.
- Pydantic v2: validators con @field_validator, no @validator.
- Todas las excepciones de dominio heredan de DomainError y son
  capturadas por un handler global en main.py (nunca HTTPException en services).

## MCPs disponibles y cuándo usarlos
postgres: el reviewer usa este MCP para verificar que las migraciones
          generaron el esquema correcto. Comando ejemplo: describe table todos.
github:   el docwriter y el orchestrator usan este MCP para crear PRs
          y enlazar el change de openspec.
````

---

# 3. El Harness

## Subagentes

> [!NOTE] **⚽ Analogía**
> En un equipo de fútbol, cada posición tiene instrucciones distintas. El portero no sale a rematar córners (aunque podría). Los archivos en agents/ son las instrucciones de cada posición: qué hace, qué no hace, a qué skills recurre, y cuándo para a pedir confirmación.

| Rol | Badge | Responsabilidad | Skills y MCP |
| --- | --- | --- | --- |
| 🤖 **orchestrator** | <span class="badge ok">Líder</span> | Analiza la tarea, decide qué agentes necesita, los coordina en orden y reúne los resultados. | Lee proposal.md + tasks.md. Anuncia cada cambio de rol. Para si hay ambigüedad. |
| ⚙️ **backend** | <span class="badge ok">Código</span> | Implementa código de producción siguiendo las capas de ARCHITECTURE.md. | Usa skills api-endpoint, db-migration. Corre pytest tras cada tarea. No escribe tests (eso es tester). |
| 🧪 **tester** | <span class="badge partial">Tests</span> | Escribe y ejecuta tests unitarios e integración para el código del backend. | Usa skill test-pattern. Cubre: feliz + error + edge case. Reporta fallos con contexto. |
| 🔍 **reviewer** | <span class="badge check">Calidad</span> | Revisa calidad, seguridad y adherencia a capas antes de abrir el PR. | Usa MCP postgres para verificar esquema. Clasifica: blocker / warning / suggestion. No escribe código nuevo. |
| 📝 **docwriter** | <span class="badge ok">Docs</span> | Escribe docstrings, README y descripciones OpenAPI para el código del backend. | Usa MCP github para abrir PRs. No escribe código nuevo. No corrige errores de backend. |

## Estructura estándar de un agent file

Todos los archivos de `.opencode/agents/` siguen el mismo patrón: cabecera YAML opcional + secciones markdown bien definidas.

> [!NOTE] **`.opencode/agents/orchestrator.md`**

````markdown
---
name: orchestrator
role: Coordina a los demás agentes del harness
---

# Agent: orchestrator

## Responsabilidad
Analizar la tarea recibida, decidir qué agentes se necesitan,
ejecutarlos en el orden correcto, y reportar el resultado al usuario.

## Protocolo de orquestación

Paso 1: Analizar
- Lee el change en openspec/changes/ si existe.
- Lee ARCHITECTURE.md para entender el impacto.
- Si no hay spec → créalo con /harness-proposal y espera confirmación.

Paso 2: Decidir qué agentes activan
No siempre se necesitan todos. Ejemplos:
- Bug fix menor:         backend → tester
- Feature nueva:         backend → tester → reviewer → docwriter
- Solo refactor:         backend → reviewer
- Solo documentación:    docwriter

Paso 3: Ejecutar con anuncios de rol
Antes de cada cambio de agente, escribe:
--- [AGENTE: backend] Implementando tarea 1/4 ---
Luego actúa como ese agente leyendo su archivo agents/{nombre}.md.

Paso 4: Reportar
Al terminar: resumen de cambios, tests pasados/fallados,
y enlace al change en openspec/.

## Cuándo parar y pedir confirmación
- Antes de tocar migrations o models de producción.
- Si el spec es ambiguo en más de un punto.
- Si pytest falla más de 2 veces seguidas en el mismo test.
- Si el reviewer reporta un blocker.

## Qué NO hace el orchestrator
No implementa código directamente. Delega siempre.
No salta al reviewer si los tests no están en verde.
````

> [!NOTE] **`.opencode/agents/backend.md`**

````markdown
---
name: backend
role: Implementa código de producción
triggers:
  - nuevo endpoint
  - cambio de modelo
  - refactor de servicio
  - nueva feature
---

# Agent: backend

## Responsabilidad
Implementar código de producción siguiendo las capas definidas
en ARCHITECTURE.md, usando las skills correspondientes.

## Skills que usa
- .opencode/skills/fastapi-endpoint/SKILL.md  (endpoints nuevos)
- .opencode/skills/db-migration/SKILL.md     (cambios de esquema)

## Protocolo de implementación
1. Leer el spec del change en openspec/changes/{nombre}/spec.md.
2. Leer la skill relevante antes de escribir una sola línea.
3. Implementar tarea por tarea según tasks.md.
4. Ejecutar uv run pytest después de cada tarea sustancial.
5. Marcar [x] en tasks.md al completar cada ítem.

## Qué NO hace
- No escribe tests (responsabilidad de tester.md).
- No revisa código de otros (responsabilidad de reviewer.md).
- No crea documentación (responsabilidad de docwriter.md).
````

## Skills — El "cómo hacer" con AgentSkills

> [!NOTE] **📋 Analogía**
> Las skills son recetas de cocina específicas para tu restaurante. No "cómo se hace una tortilla en general" — sino "cómo se hace una tortilla en ESTE restaurante, con ESTE fuego, en ESTA sartén, con ESTOS ingredientes". El agente sigue la receta exacta sin improvisar.

Una skill es un archivo markdown que le enseña al agente cómo ejecutar un patrón repetible en tu proyecto específico. Se consulta antes de implementar, no después. El estándar AgentSkills define el formato con frontmatter YAML para que los agentes puedan descubrirlas por trigger.

**Referencia:** [4](#ref4)

### Estructura estándar (AgentSkills)

> [!NOTE] **`.opencode/skills/fastapi-endpoint/SKILL.md`**

````markdown
---
name: fastapi-endpoint
version: "1.0"
description: >
  Usar cuando se cree o modifique un endpoint FastAPI en este proyecto.
  Define el patrón exacto router→service→repository.
triggers:
- nuevo endpoint
- crear ruta HTTP
- añadir API
- POST GET PUT PATCH DELETE
agents:
- backend
- reviewer
---

# Skill: FastAPI endpoint

## Cuándo usar esta skill
Cualquier vez que se añada o modifique una ruta HTTP
(@router.get, @router.post, etc.) en este proyecto.

## Patrón de capas OBLIGATORIO

app/routers/{recurso}.py     ← solo HTTP: valida, enruta, devuelve schema
app/services/{recurso}.py    ← lógica de negocio, sin imports de FastAPI
app/repositories/{recurso}.py← queries SQLAlchemy async
app/schemas/{recurso}.py     ← Pydantic v2 I/O

El router NUNCA contiene SQL ni lógica de negocio.
Si ves eso en código existente, es deuda técnica: corrígelo si tocas ese fichero.

## Plantilla de router

```python
# app/routers/todos.py
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.todo import TodoCreate, TodoRead
from app.services.todo import TodoService
from app.dependencies import get_todo_service

router = APIRouter(prefix="/todos", tags=["todos"])

@router.post("", response_model=TodoRead, status_code=201)
async def create_todo(
    payload: TodoCreate,
    service: TodoService = Depends(get_todo_service),
) -> TodoRead:
    """Create a new todo item."""
    return await service.create(payload)

@router.get("/{todo_id}", response_model=TodoRead)
async def get_todo(
    todo_id: int,
    service: TodoService = Depends(get_todo_service),
) -> TodoRead:
    """Get a single todo by ID."""
    todo = await service.get_by_id(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo
```

## Manejo de errores
- 404: recurso no encontrado →
raise HTTPException(404, detail="Todo not found")
- 422: lo gestiona Pydantic automáticamente. No duplicar.
- Errores de dominio: usar una excepción propia en el service
capturada por un handler global en app/main.py.

## Checklist antes de dar el endpoint por terminado
- [ ] Schema Pydantic de entrada y de salida están definidos.
- [ ] El router no contiene SQL ni lógica de negocio.
- [ ] Existe al menos un test de happy path y uno de error (404 o 422).
- [ ] El endpoint tiene summary= si el nombre no es autoexplicativo.
- [ ] El status code es correcto: 200 GET, 201 POST, 204 DELETE sin body.

## Referencias relacionadas
- Para cambios en el modelo de datos: .opencode/skills/db-migration/SKILL.md
- El comportamiento esperado debe estar en openspec/specs/{recurso}/spec.md
````

> [!NOTE] **`.opencode/skills/db-migration/SKILL.md`**

````markdown
---
name: db-migration
version: "1.0"
description: >
  Usar cuando se añada o modifique el esquema de la base de datos.
  Cubre modificación de modelo, generación de migración Alembic,
  revisión manual y verificación post-migración.
triggers:
- nueva columna
- nueva tabla
- cambio de esquema
- migración
- alembic
agents:
- backend
---

# Skill: Migración de base de datos

## Pasos OBLIGATORIOS

1. Modifica el modelo
   En app/models/{recurso}.py. El modelo es la fuente de verdad.

2. Genera la migración
   ```bash
   uv run alembic revision --autogenerate -m "descripcion_snake_case"
   ```

3. REVISA el archivo generado manualmente (crítico)
   Alembic NO detecta bien:
   - Renombrados de columna (genera DROP + ADD, pierdes datos).
   - Cambios de tipo complejos.
   - Constraints nombradas.
   Abre el archivo en alembic/versions/ y verifica cada operación.

4. Aplica en local
   ```bash
   uv run alembic upgrade head
   ```

5. Verifica con MCP de PostgreSQL
   Usa el MCP para ejecutar:
   \d todos  (psql)  o  describe table todos
   Confirma que las columnas, tipos e índices son correctos.

## Reglas importantes
- NUNCA usar Base.metadata.create_all() en producción.
- Toda columna NOT NULL en tabla con datos existentes necesita
server_default o un paso de backfill explícito.
- Nombrar la migración igual que el change de OpenSpec que la originó.

## Ejemplo: columna NOT NULL con backfill seguro
```python
# En el archivo de migración generado
def upgrade():
    # Paso 1: añadir como nullable con default
    op.add_column("todos", sa.Column(
        "priority", sa.String(), nullable=False, server_default="medium"
    ))
    # Paso 2 (si no quieres mantener el default permanente):
    # op.alter_column("todos", "priority", server_default=None)
```
````

## Commands — Slash commands reutilizables

> [!NOTE] **📋 Analogía**
> Los commands son atajos de teclado que ejecutan un patrón repetible. No "cómo se hace una tortilla en general" — sino "cómo se hace una tortilla en ESTE restaurante, con ESTE fuego, en ESTA sartén, con ESTOS ingredientes". El agente sigue el comando exacto sin improvisar.

Los commands viven en .opencode/commands/. Cada archivo markdown es un slash command que OpenCode registra automáticamente. La variable $ARGUMENTS recibe el texto que escribas después del nombre del comando.

**Referencia:** [5](#ref5)

> [!NOTE] **`.opencode/commands/harness-run.md`**

````markdown
---
description: Ejecuta el flujo completo del harness para una tarea nueva
usage: /harness-run
example: /harness-run añadir campo priority (high/medium/low) a los todos
---

La tarea a implementar es: "$ARGUMENTS"

Ejecuta el flujo completo del harness siguiendo estos pasos:

1. ANALIZAR (siempre primero)
   Lee agents/orchestrator.md.
   Busca en openspec/changes/ si ya existe un spec para esta tarea.
   Si no existe: PARA y crea el spec con /harness-proposal antes de continuar.

2. PLANIFICAR
   Lee el proposal.md y tasks.md del change.
   Decide qué agentes se necesitan según el tipo de tarea.
   Anuncia el plan al usuario antes de implementar.

3. BACKEND (si aplica)
   Anuncia: --- [AGENTE: backend] ---
   Lee agents/backend.md y las skills relevantes.
   Implementa tarea por tarea de tasks.md.
   Corre uv run pytest tras cada tarea. Si falla, corrige antes de seguir.

4. TESTER (si aplica)
   Anuncia: --- [AGENTE: tester] ---
   Lee agents/tester.md y .opencode/skills/test-pattern/SKILL.md.
   Escribe tests para los escenarios del spec que no estén cubiertos.

5. REVIEWER (si aplica)
   Anuncia: --- [AGENTE: reviewer] ---
   Lee agents/reviewer.md y ARCHITECTURE.md.
   Usa MCP de postgres para verificar el esquema si hubo migración.
   Lista findings con severidad: BLOCKER / WARNING / SUGGESTION.
   Si hay BLOCKERS: para y reporta antes de continuar.

6. DOCWRITER (si aplica)
   Anuncia: --- [AGENTE: docwriter] ---
   Actualiza docstrings, descripciones OpenAPI y CHANGELOG si aplica.

7. REPORTE FINAL
   Resumen: cambios implementados, tests en verde, issues del reviewer,
   y ruta al spec en openspec/.
````

> [!NOTE] **`.opencode/commands/harness-proposal.md`**

````markdown
---
description: Crea un OpenSpec (proposal + tasks + spec delta) antes de codear
usage: /harness-proposal
example: /harness-proposal añadir campo due_date a los todos
---

El cambio propuesto es: "$ARGUMENTS"

Sigue estos pasos (sin escribir código):

1. BUSCAR CONTEXTO
   Lee openspec/specs/ para encontrar specs relacionados con la tarea.
   Lee el código existente en app/ relacionado con el área afectada.

2. CREAR EL CHANGE
   Determina un nombre corto en kebab-case para el change.
   Crea la carpeta openspec/changes/{nombre}/ con:

   proposal.md — estructura:
   ## Why: por qué se necesita este cambio
   ## What changes: qué se modifica (campos, endpoints, comportamiento)
   ## Impact: qué specs afecta, si rompe compatibilidad

   tasks.md — checklist de implementación:
   - [ ] N. descripción de tarea concreta

   specs/{spec-afectado}/spec.md — delta del spec:
   Nuevos Requirements con Scenarios en formato Gherkin
   (GIVEN / WHEN / THEN).

3. MOSTRAR RESUMEN
   Presenta el plan creado y espera confirmación antes de implementar.
   No escribas una sola línea de código en este paso.
````

## Specs — El estándar OpenSpec

> [!NOTE] **📋 Analogía**
> No contratas a un arquitecto y le dices "haz algo bonito". Le das los planos: cuántas habitaciones, dónde las puertas, qué altura. Un spec es el plano. Sin plano, el agente construye lo que interpreta — que puede no ser lo que querías.

OpenSpec es un framework de especificación ligero mantenido por Fission AI. Las specs viven en el repositorio junto al código — no desaparecen cuando termina una sesión de chat. Cada feature pasa por dos estados: change en progreso (openspec/changes/) y spec archivado (openspec/specs/).

**Referencia:** [6](#ref6)

1. **Proponer** (`/harness-proposal`)
    - Creas `openspec/changes/{nombre}/proposal.md` + `tasks.md` + `specs/{afectado}/spec.md`. Sin código todavía. Revisas y apruebas el plan.
2. **Implementar** (`/harness-run`)
    - El harness lee el `tasks.md` y lo ejecuta tarea por tarea, marcando casillas a medida que avanza.
3. **Archivar** (`/harness-archive`)
    - Cuando todo está en verde, el harness mueve el spec delta a `openspec/specs/{afectado}/spec.md` y borra el change.

### Ejemplo completo: añadir campo priority

> [!NOTE] **`openspec/changes/add-priority/proposal.md`**

````markdown
# Change: add-priority

## Why
Los usuarios no pueden priorizar tareas. Necesitan ordenar por urgencia.
Esta feature es la más pedida en el backlog.

## What changes
- Columna priority (enum: high / medium / low) en tabla todos.
- NOT NULL, default: medium.
- POST /todos y PATCH /todos/{id} aceptan el campo priority.
- GET /todos acepta parámetro ?priority=high para filtrar.

## Impact
- Afecta al spec: todo-crud
- Requiere migración Alembic (skill: db-migration)
- Backward compatible: el campo tiene default, no rompe clientes existentes
- No afecta autenticación ni otros recursos
````

> [!NOTE] **`openspec/changes/add-priority/tasks.md`**

````markdown
- [ ] 1. Añadir campo priority: str al modelo Todo
        con server_default="medium" y nullable=False
- [ ] 2. Migración Alembic: add_priority_to_todos
        (usar skill db-migration, revisar manualmente)
- [ ] 3. Actualizar schemas: TodoCreate, TodoUpdate (optional),
        TodoRead (include priority)
- [ ] 4. Parámetro ?priority= en endpoint GET /todos
        con filtro en el repository
- [ ] 5. Tests para los 3 escenarios del spec delta
        (skill: test-pattern)
- [ ] 6. uv run pytest en verde
- [ ] 7. uv run ruff check . sin errores
- [ ] 8. Abrir PR referenciando este change
- [ ] 9. Cuando todo esté en verde, archivar el spec delta en openspec/specs/todo-crud/spec.md
````

> [!NOTE] **`openspec/changes/add-priority/specs/todo-crud/spec.md`**

````markdown
# todo-crud Specification (delta: add-priority)

## Requirement: Crear tarea con prioridad
El sistema SHALL aceptar un campo priority en la creación de tareas.
Los valores válidos son: high, medium, low.

#### Scenario: Prioridad explícita
- GIVEN un usuario autenticado
- WHEN envía POST /todos con {"title": "Urgente", "priority": "high"}
- THEN se crea la tarea con priority=high
- AND se devuelve 201 con el recurso creado incluyendo priority

#### Scenario: Prioridad por defecto
- GIVEN un usuario autenticado
- WHEN envía POST /todos con {"title": "Normal"} (sin priority)
- THEN se crea la tarea con priority="medium"
- AND se devuelve 201

#### Scenario: Valor de prioridad inválido
- GIVEN un usuario autenticado
- WHEN envía POST /todos con {"title": "X", "priority": "urgent"}
- THEN se devuelve 422 con mensaje de validación
- AND el body especifica que priority debe ser high/medium/low

## Requirement: Filtrar tareas por prioridad
El sistema SHALL permitir listar solo tareas de una prioridad concreta.

#### Scenario: Filtro por prioridad high
- GIVEN existen tareas con priority=high y priority=medium
- WHEN envía GET /todos?priority=high
- THEN solo se devuelven las tareas con priority=high
````

### El spec archivado: la fuente de verdad permanente

Una vez que el PR está mergeado, el spec delta se integra al spec permanente en `openspec/specs/`. Esta es la documentación viva del sistema — siempre más actualizada que cualquier wiki o Notion.

> [!NOTE] **`openspec/specs/todo-crud/spec.md`**

````markdown
# todo-crud Specification
## Purpose
Gestionar el ciclo de vida de una tarea: crear, leer, actualizar,
completar y filtrar.

## Requirement: Crear una tarea
El sistema SHALL crear tareas con título obligatorio,
descripción opcional y prioridad (high/medium/low, default: medium).

#### Scenario: Creación mínima válida
- GIVEN un usuario autenticado
- WHEN envía POST /todos con {"title": "Comprar leche"}
- THEN se crea con completed=false y priority="medium"
- AND se devuelve 201

[... más scenarios ...]

## Requirement: Completar una tarea
[...]

## Requirement: Filtrar por prioridad
[...]

## Historial de cambios
- 2026-01-15: spec inicial (CRUD básico)
- 2026-02-03: add-priority (campo priority con filtro)
````

## Arquitectura del Harness

El harness coordina subagentes especializados que trabajan en cadena. Cada subagente lee su propia definición en `agents/`, usa skills para tareas concretas, y se conecta a servicios externos mediante MCP.

```mermaid
graph TD
    User["👤 Tú / Usuario"] -->|"/harness-run"| Orch["🤖 Orchestrator"]

    Orch -->|Lee| ARCH["📋 ARCHITECTURE.md<br/>Estructura del proyecto"]
    Orch -->|Lee| AGENTS["📋 AGENTS.md<br/>Reglas del proyecto"]
    Orch -->|Lee| AgentFiles["📁 agents/*.md<br/>Definiciones de rol"]

    subgraph Subagentes["Subagentes del Harness"]
        direction TB
        Backend["⚙️ backend"]
        Tester["🧪 tester"]
        Reviewer["🔍 reviewer"]
        DocWriter["📝 docwriter"]
    end

    Orch -->|Delega en orden| Backend
    Backend -->|Verifica| Tester
    Tester -->|Revisa| Reviewer
    Reviewer -->|Documenta| DocWriter

    subgraph Skills["📚 Skills (.opencode/skills/)"]
        SkillAPI["fastapi-endpoint"]
        SkillDB["db-migration"]
        SkillTest["test-pattern"]
    end

    Backend -->|Usa| SkillAPI
    Backend -->|Usa| SkillDB
    Tester -->|Usa| SkillTest
    Reviewer -->|Usa| SkillAPI
    Reviewer -->|Usa| SkillDB

    subgraph MCP["🌐 MCP Servers"]
        MCP_DB[("🗄️ PostgreSQL")]
        MCP_GH["🐙 GitHub"]
        MCP_FS["📁 File System"]
    end

    Reviewer -->|Consulta esquema| MCP_DB
    Backend -->|Ejecuta migraciones| MCP_DB
    Tester -->|Verifica datos| MCP_DB
    DocWriter -->|Abre PR| MCP_GH
    Reviewer -->|Comenta en PR| MCP_GH
    User -->|Configura| MCP

    DocWriter -->|Reporta| Orch
    Reviewer -->|Reporta| Orch
    Tester -->|Reporta| Orch
    Backend -->|Reporta| Orch

    Orch -->|Resumen final| User
```

## Protocolo MCP — Model Context Protocol

### ¿Qué es MCP?

MCP (Model Context Protocol) es el estándar abierto que permite a los agentes conectarse con herramientas y servicios externos. Piensa en MCP como un USB para IAs: un mismo conector funciona con bases de datos, APIs, sistemas de archivos, y más.

**Referencia:** [7](#ref7)

Sin MCP, un agente solo puede leer y escribir archivos en tu repositorio. Con MCP, puede:

- Consultar una base de datos PostgreSQL para verificar esquemas
- Crear PRs en GitHub automáticamente
- Ejecutar queries SQL para depurar datos
- Leer issues y comentarios en GitHub
- Navegar por el sistema de archivos fuera del proyecto

### Cómo funciona el flujo MCP

![Flujo MCP](../../assets/workflow_mcp.png)

### Servidores MCP típicos en un harness

| Servidor MCP | Para qué lo usa | Agente que lo activa |
| --- | --- | --- |
| **PostgreSQL** | Consultar esquema de tablas, verificar migraciones, depurar datos | reviewer, backend, tester |
| **GitHub** | Crear PRs, añadir comentarios, leer issues | docwriter, reviewer |
| **File System** | Leer/escribir archivos fuera del proyecto | docwriter, orchestrator |

### Configuración

Los MCPs se configuran en `opencode.json` (OpenCode) o `.mcp.json` (Claude Code):

```json
{
  "mcpServers": {
    "postgres": {
      "command": "uvx",
      "args": [
        "mcp-postgres",
        "--connection-string",
        "postgresql://user:pass@localhost:5432/todos"
      ]
    },
    "github": {
      "command": "uvx",
      "args": [
        "mcp-github",
        "--token",
        "${GITHUB_TOKEN}"
      ]
    }
  }
}
```

> [!TIP] **MCP en acción**
> En el flujo de trabajo de abajo, el reviewer usa `MCP postgres: \d todos` para verificar que la migración creó la columna `due_date` correctamente. El agente no *adivina* si el esquema es correcto — lo *verifica* contra la BD real vía MCP.

## Flujo de trabajo completo

Con todo configurado, una sesión de trabajo real se ve así:

> [!NOTE] **Terminal — OpenCode session**

```text
 Abres OpenCode en tu proyecto
cd todo-harness
opencode

# Propones una feature nueva (sin código todavía)
tú:  /harness-proposal añadir campo due_date (fecha límite) a los todos

orchestrator:
  Buscando specs relacionados en openspec/specs/...
  Leyendo openspec/specs/todo-crud/spec.md...
  Revisando código existente en app/models/todo.py...

  Creando openspec/changes/add-due-date/proposal.md ✓
  Creando openspec/changes/add-due-date/tasks.md    ✓
  Creando openspec/changes/add-due-date/specs/...   ✓

  Plan creado. Resumen:
  - 8 tareas de implementación
  - Afecta spec: todo-crud
  - Requiere migración Alembic
  - Backward compatible (campo nullable)

  ¿Implemento?

# Revisas el plan en openspec/changes/add-due-date/ y apruebas
tú:  sí, implementa

orchestrator:
  --- [AGENTE: backend] Implementando 8 tareas ---

  Tarea 1: Añadiendo campo due_date al modelo Todo...
  Tarea 2: Generando migración Alembic...
  → Revisando migración generada manualmente...
  Tarea 3: Aplicando migración...
  Tarea 4: Actualizando schemas...
  Tarea 5: Añadiendo filtro ?overdue=true...
  Ejecutando: uv run pytest... ✓ 14 tests pasados

  --- [AGENTE: tester] Revisando cobertura ---

  Leyendo spec delta para escenarios no cubiertos...
  Añadiendo test: test_create_with_due_date ✓
  Añadiendo test: test_filter_overdue ✓
  Ejecutando: uv run pytest -v... ✓ 16 tests pasados

  --- [AGENTE: reviewer] Revisando calidad ---

  Verificando capas... ✓
  Verificando type hints... ✓
  Usando MCP postgres: \d todos...
    → Columna due_date presente: TIMESTAMP nullable ✓
  Findings:
    SUGGESTION: añadir índice en due_date para queries de overdue

  --- [AGENTE: docwriter] ---

  Actualizando docstrings de endpoints afectados ✓
  Añadiendo entrada en CHANGELOG ✓

  Resumen final:
  ✓ 16 tests en verde
  ✓ Migración verificada en BD
  ✓ Sin blockers ni warnings
  → Suggestion pendiente: índice en due_date
  → Listo para PR
```

> [!INFO] **🎯 Lo que acaba de pasar**
> El orquestador coordinó 4 agentes distintos, cada uno leyendo sus propias instrucciones, usando skills especializadas, verificando el esquema real de la BD vía MCP, y produciendo un output coherente — todo desde una sola instrucción tuya. Eso es la diferencia entre chat IA e IA agéntica.

---

# 4. Memoria Persistente con Engram

## ¿Por qué memoria persistente?

> [!NOTE] **🧠 Analogía**
> Tu agente IA es brillante pero amnésico. Cada vez que cierras la sesión, olvida todo: las decisiones que tomaste, los bugs que encontraste, los patrones que estableciste. Engram es el cuaderno que siempre está sobre la mesa — el agente escribe lo importante y lo lee al día siguiente.

| Dimensión | Sin Engram | Con Engram |
| --- | --- | --- |
| **Contexto entre sesiones** | Cero — empieza de cero cada vez | `mem_context` recupera el historial |
| **Decisiones de arquitectura** | Las repites en cada sesión | `mem_search` las encuentra al instante |
| **Bugs ya corregidos** | Puede reintroducirlos sin saberlo | `mem_save` los recuerda y documenta |
| **Patrones del proyecto** | No aprende de experiencia previa | `topic_key` actualiza en place |
| **Cierre de sesión** | Se pierde todo el contexto | `mem_session_summary` persiste el resumen |

### Encaje en el harness

El harness ya coordina agentes que comparten archivos, specs y skills. Engram añade una capa de **memoria compartida entre sesiones**: el orchestrator usa `mem_search` antes de planificar, backend usa `mem_save` para guardar patrones de implementación, y reviewer usa `mem_context` para recordar findings de revisiones anteriores.

---

## ¿Qué es Engram?

`engram` `/ˈen.ɡræm/` — *neuroscience*: la huella física de una memoria en el cerebro.

Un **binario Go** con SQLite + FTS5 full-text search, expuesto vía MCP server, HTTP API, CLI y TUI. Agent-agnostic: funciona con OpenCode, Claude Code, Gemini CLI, Codex, Cursor, VS Code Copilot y cualquier cliente MCP.

**Referencia:** [12](#ref12)

```mermaid
graph LR
    Agent[🤖 OpenCode / Claude Code] -->|MCP stdio| Engram[🧠 Engram Binary]
    Engram -->|SQLite + FTS5| DB[(~/.engram/engram.db)]
```

No necesita Node.js, Python ni Docker. Un binario, una base de datos.

---

## Instalación

### macOS / Linux — Homebrew

```bash
brew install gentleman-programming/tap/engram
```

Para actualizar:

```bash
brew update && brew upgrade engram
```

### Linux / Windows — Binario

Descargar el binario para tu plataforma desde [GitHub Releases](https://github.com/Gentleman-Programming/engram/releases) y añadirlo al PATH.

### Verificar instalación

```bash
engram version
```

---

## Configuración con OpenCode

> [!NOTE] **🔌 Analogía**
> OpenCode funciona solo, pero sin Engram es como un coche sin cuaderno de bordo: va, pero no recuerda por dónde pasó. Engram añade la memoria al conductor.

### Opción automática (recomendada)

```bash
engram setup opencode
```

Este comando hace tres cosas:

**1. Plugin** — copia `engram.ts` a `~/.config/opencode/plugins/`

- Session tracking automático
- Memory Protocol inyectado en el agente
- Recuperación post-compaction

**2. MCP server** — añade la configuración a `opencode.json`

```json
{
  "mcp": {
    "engram": {
      "type": "local",
      "command": ["engram", "mcp", "--tools=agent"],
      "enabled": true
    }
  }
}
```

**3. Statusline** — añade indicador de actividad del sub-agente en `tui.json`

Después del setup, **reinicia OpenCode**. No necesitas ejecutar `engram serve` manualmente — el plugin gestiona el servidor.

### Opción manual (sin plugin)

Si prefieres configurar solo el MCP server sin el plugin, añade directamente a `opencode.json` (global: `~/.config/opencode/opencode.json`, o por proyecto):

```json
{
  "mcp": {
    "engram": {
      "type": "local",
      "command": ["engram", "mcp"],
      "enabled": true
    }
  }
}
```

> [!WARNING] **Sin plugin = sin session tracking**
> Sin el plugin, Engram funciona pero no hace session tracking automático. Tendrás que llamar a `mem_session_summary` manualmente al final de cada sesión. El plugin lo hace automático.

### Memory Protocol

Para que el agente sepa **cuándo** usar Engram, añade este snippet al prompt del agente en `opencode.json`:

```text
You have access to Engram persistent memory via MCP tools (mem_save, mem_search, mem_session_summary, etc.).
Save proactively after significant work — don't wait to be asked.
After any compaction or context reset, call mem_context to recover session state before continuing.
```

Esto es la opción "nuclear" — el prompt del sistema sobrevive a la compaction. Úsalo cuando quieras garantía absoluta de que el agente usará Engram.

---

## Herramientas MCP — 20 tools

| Categoría | Herramientas |
| --- | --- |
| 💾 **Guardar** | `mem_save` · `mem_update` · `mem_delete` · `mem_suggest_topic_key` |
| 🔎 **Buscar** | `mem_search` · `mem_context` · `mem_timeline` · `mem_get_observation` |
| ▶️ **Sesión** | `mem_session_start` · `mem_session_end` · `mem_session_summary` |
| ⚖️ **Conflictos** | `mem_judge` · `mem_compare` |
| 🛠️ **Utilidades** | `mem_save_prompt` · `mem_stats` · `mem_capture_passive` · `mem_merge_projects` · `mem_current_project` · `mem_doctor` |

### Referencia de herramientas principales

| Herramienta | Descripción |
| --- | --- |
| `mem_current_project` | Detecta el proyecto desde el directorio de trabajo. Llamar primero. |
| `mem_save` | Guarda una observación estructurada con formato What/Why/Where/Learned |
| `mem_search` | Búsqueda full-text con FTS5 across todas las memorias |
| `mem_context` | Devuelve el contexto reciente de sesiones anteriores |
| `mem_session_summary` | Guarda el resumen de cierre de sesión (obligatorio antes de terminar) |
| `mem_suggest_topic_key` | Sugiere una key estable para upserts antes de `mem_save` |
| `mem_update` | Actualiza una observación existente por ID |
| `mem_timeline` | Contexto cronológico alrededor de una observación |
| `mem_get_observation` | Obtiene el contenido completo sin truncar de una memoria |
| `mem_judge` | Registra un veredicto sobre un conflicto pendiente |
| `mem_compare` | Persiste una relación semántica entre dos memorias |
| `mem_delete` | Elimina una observación (soft-delete por defecto, `--hard` permanente) |

> [!TIP] **Progresión de 3 capas — eficiente en tokens**
> No cargues toda la memoria de golpe. Usa la progresión:
> 1. `mem_search "auth middleware"` → resultados compactos con IDs (~100 tokens c/u)
> 2. `mem_timeline observation_id=42` → qué pasó antes/después en esa sesión
> 3. `mem_get_observation id=42` → contenido completo sin truncar

---

## Flujo de trabajo: Ejemplo con OpenCode

> [!NOTE] **Terminal — OpenCode session**

```text
abres OpenCode en tu proyecto
cd todo-harness
opencode

tú: /harness-run añadir campo priority (high/medium/low) a los todos

orchestrator:
  --- [AGENTE: orchestrator] ---

  mem_current_project → "todo-harness" ✓
  mem_search "priority" → 0 resultados (tema nuevo)

  Leyendo openspec/specs/todo-crud/spec.md...
  No existe spec para priority. Creando proposal...

  Creando openspec/changes/add-priority/proposal.md ✓
  Creando openspec/changes/add-priority/tasks.md    ✓

  Plan: 8 tareas, requiere migración Alembic, backward compatible.
  ¿Implemento?

tú: sí

orchestrator:
  --- [AGENTE: backend] ---

  Tarea 1: Añadiendo campo priority al modelo Todo...
  Tarea 2: Generando migración Alembic...
  → Revisando migración generada manualmente...
  Tarea 3: Aplicando migración...
  Tarea 4: Actualizando schemas...
  Tarea 5: Añadiendo filtro ?priority=...
  Ejecutando: uv run pytest ✓ 14 tests pasados

  mem_save(
    title="Patrón migración NOT NULL con default",
    type="pattern",
    topic_key="pattern/db-migration-not-null",
    content="What: Usar server_default en columnas NOT NULL\n
             Why: Evita error en tablas con datos existentes\n
             Where: app/models/todo.py, alembic/versions/\n
             Learned: Nunca usar Base.metadata.create_all en producción"
  ) ✓

  --- [AGENTE: reviewer] ---

  mem_context → "todo-harness" → 3 memorias previas encontradas
  mem_search "migración" → patrón de backend encontrado ✓

  Verificando capas... ✓
  Usando MCP postgres: \d todos...
    → Columna priority presente: VARCHAR NOT NULL DEFAULT 'medium' ✓
  Findings:
    SUGGESTION: añadir índice en priority para queries de filtro

  --- [AGENTE: docwriter] ---

  Actualizando docstrings de endpoints afectados ✓

  --- [AGENTE: orchestrator] --- Resumen final ---

  mem_session_summary(
    content="
    ## Goal
    Añadir campo priority (high/medium/low) a los todos

    ## Discoveries
    - server_default es el patrón seguro para columnas NOT NULL en tablas con datos
    - El reviewer sugiere índice en priority para queries de filtro

    ## Accomplished
    - ✅ Campo priority añadido al modelo y schemas
    - ✅ Migración Alembic aplicada y verificada
    - ✅ 16 tests en verde
    - ✅ Sin blockers

    ## Next Steps
    - Evaluar si el índice en priority es necesario antes del PR

    ## Relevant Files
    - app/models/todo.py — campo priority añadido
    - alembic/versions/add_priority.py — migración generada
    - app/schemas/todo.py — schemas actualizados
    "
  ) ✓

  Resumen:
  ✓ 16 tests en verde
  ✓ Migración verificada en BD
  ✓ Patrón guardado en memoria para futuras migraciones
  → Suggestion pendiente: índice en priority
  → Listo para PR
```

> [!INFO] **🎯 Lo que Engram aporta al harness**
> Sin Engram, la próxima vez que ejecutes `/harness-run`, el orchestrator no recordará que usaste `server_default` en la migración anterior. Con Engram, `mem_search "migración"` devuelve el patrón completo — el agente aprende de sesiones pasadas sin que tú le vuelvas a explicar.

---

## Workflow completo: Harness + Engram

### Integración con los comandos

Los comandos del harness ya incluyen llamadas a Engram:

**`/harness-run`** usa Engram en dos momentos:

1. **Al inicio** (paso ANALIZAR):
   - `mem_current_project` → confirma el proyecto detectado
   - `mem_search "$ARGUMENTS"` → busca contexto previo relacionado con la tarea

2. **Al final** (paso REPORTE FINAL):
   - `mem_session_summary` → guarda Goal/Discoveries/Accomplished/Next Steps/Relevant Files

**`/harness-proposal`** usa Engram al inicio:

1. **BUSCAR CONTEXTO**:
   - `mem_search "$ARGUMENTS"` → verifica que no existe una propuesta o decisión similar previa

### Flujo visual

```mermaid
sequenceDiagram
    participant U as Usuario
    participant O as Orchestrator
    participant D as Docwriter
    participant R as Reviewer
    participant E as Engram

    U->>O: /harness-run nueva página
    O->>E: mem_current_project
    E-->>O: "todo-harness"
    O->>E: mem_search "nueva página"
    E-->>O: 0 resultados

    O->>D: --- [AGENTE: docwriter] ---
    D->>D: crear docs/nueva-pagina.md
    D->>E: mem_save (si descubre algo no obvio)
    E-->>D: ✓

    O->>R: --- [AGENTE: reviewer] ---
    R->>E: mem_context
    E-->>R: memorias previas
    R->>D: revisar + build

    O->>E: mem_session_summary
    E-->>O: ✓
    O->>U: Resumen final
```

---

## Topic Keys — Organización de memorias

### ¿Qué es un topic_key?

`topic_key` convierte `mem_save` en un **upsert**: si ya existe una memoria con el mismo `project + scope + topic_key`, se actualiza en lugar de crear una fila nueva. Ideal para conocimiento que evoluciona con el tiempo.

### Formato

Slash-separated lowercase kebab-case, máximo 2 niveles:

```text
family/specific-description
```

### Cuándo usarlo

| Situación | ¿Usar topic_key? | Razón |
| --- | --- | --- |
| Decisión de arquitectura que puede evolucionar | Sí | Mantiene el historial en una sola observación |
| Feature que abarca varias sesiones | Sí | Fuente única de verdad transversal |
| Patrón o convención establecida | Sí | Una entrada canónica que madura |
| Bug corregido y cerrado | No | Una observación puntual es suficiente |
| Descubrimiento one-off | No | Crear una key que no reutilizarás añade ruido |
| Múltiples decisiones independientes del mismo tema | No — usar keys distintas | Se sobreescribirían entre sí |

### Ejemplo completo

```bash
# El agente no está seguro de qué key usar
mem_suggest_topic_key(type="architecture", title="Auth model")
→ devuelve: "architecture/auth-model"

# Primera vez: crea la observación
mem_save(
  title="Usamos JWT para auth",
  type="architecture",
  topic_key="architecture/auth-model",
  content="What: JWT con refresh tokens\nWhy: Stateless, escalable\nWhere: app/auth/\nLearned: Rotación cada 7 días"
)
→ crea observación (revision_count=1)

# Sesión siguiente: actualiza la misma observación
mem_save(
  title="Cambiamos a Session-based auth",
  type="architecture",
  topic_key="architecture/auth-model",
  content="What: Sessions con Redis\nWhy: JWT no permitía revocación\nWhere: app/auth/, app/middleware/\nLearned: Redis TTL de 24h"
)
→ actualiza observación (revision_count=2) — NO crea fila nueva
```

### Familias de topic keys

| Familia | Para qué |
| --- | --- |
| `architecture/*` | Decisiones de diseño y arquitectura |
| `bug/*` | Bugs corregidos y sus causas raíz |
| `decision/*` | Decisiones explícitas con tradeoffs |
| `pattern/*` | Convenciones de naming, estructura, código |
| `config/*` | Configuración del entorno y proyecto |
| `discovery/*` | Hallazgos no obvios sobre el codebase |
| `feature/*` | Features en desarrollo que abarcan sesiones |

### Referencias de Engram

- **GitHub**: <https://github.com/Gentleman-Programming/engram>
- **Documentación completa**: <https://github.com/Gentleman-Programming/engram/blob/main/DOCS.md>
- **Agent Setup**: <https://github.com/Gentleman-Programming/engram/blob/main/docs/AGENT-SETUP.md>
- **Arquitectura**: <https://github.com/Gentleman-Programming/engram/blob/main/docs/ARCHITECTURE.md>
- **Instalación**: <https://github.com/Gentleman-Programming/engram/blob/main/docs/INSTALLATION.md>

---

# 5. Referencias

Todos los estándares y herramientas referenciados en esta guía están documentados en las siguientes fuentes. Se recomienda consultarlas para la versión más actualizada de cada especificación.

1. <span id="ref1"></span>**OpenCode — Documentación oficial**
   CLI open source para coding agéntico. Leer en especial las secciones de *Rules* (equivalente a AGENTS.md) y *MCP configuration*.
   <https://opencode.ai/docs>

2. <span id="ref2"></span>**Anthropic — Claude Code documentation**
   Documentación oficial de Claude Code. Cubre memory (CLAUDE.md), sub-agents (Task tool), MCPs y slash commands.
   <https://docs.anthropic.com/en/docs/claude-code>

3. <span id="ref3"></span>**AGENTS.md — Formato abierto**
   Estándar abierto mantenido por la Agentic AI Foundation (Linux Foundation). Incluye FAQ, ejemplos de proyectos reales (*apache/airflow*, *openai/codex*) y guía de migración desde AGENT.md / CLAUDE.md.
   <https://agents.md/> · <https://github.com/agentsmd/agents.md>

4. <span id="ref4"></span>**AgentSkills — Estándar de skills para agentes**
   Especificación del formato de skills reutilizables para agentes de código. Define el frontmatter YAML (*name*, *version*, *description*, *triggers*, *agents*) y el sistema de auto-descubrimiento.
   <https://agentskills.io/home>

5. <span id="ref5"></span>**OpenCode — Custom slash commands**
   Documentación de cómo crear y usar comandos personalizados en OpenCode. Los comandos van en `.opencode/commands/` y se registran automáticamente.
   <https://opencode.ai/docs/commands>

6. <span id="ref6"></span>**OpenSpec — Framework de spec-driven development**
   Framework ligero para especificación de features. Specs en el repositorio, integración nativa con OpenCode (`/openspec:proposal`), Cursor, Claude Code y otros. Mantenido por Fission AI.
   <https://openspec.dev/> · <https://github.com/Fission-AI/OpenSpec>

7. <span id="ref7"></span>**Model Context Protocol (MCP) — Anthropic**
   Protocolo estándar para conectar LLMs con herramientas externas. Incluye lista de servidores oficiales (*postgres*, *github*, *filesystem*, *slack*, *brave-search*, *puppeteer* y muchos más).
   <https://modelcontextprotocol.io> · <https://github.com/modelcontextprotocol/servers>

8. <span id="ref8"></span>**Anthropic — Building effective agents**
   Artículo de referencia sobre patrones de diseño para sistemas multi-agente: orquestador/subagente, tool use, agentic loops. Lectura obligatoria antes de diseñar un harness.
   <https://www.anthropic.com/research/building-effective-agents>

9. <span id="ref9"></span>**Anthropic — Prompt engineering guide**
   Guía oficial para escribir prompts efectivos. Aplicable directamente al diseño de agent files, skills y commands: uso de XML, chain-of-thought, ejemplos positivos y negativos.
   <https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview>

10. <span id="ref10"></span>**skills.sh — Explorador de skills**
    Directorio comunitario de skills reutilizables para distintos stacks (FastAPI, Django, React, Go...). Útil para inspirarse en el formato y contenido de SKILL.md antes de escribir los tuyos.
    <https://www.skills.sh/>

11. <span id="ref11"></span>**Agentic AI Foundation (AAIF)**
    Organismo bajo la Linux Foundation que mantiene el estándar AGENTS.md y coordina la compatibilidad entre herramientas agénticas.
    <https://aaif.io>

12. <span id="ref12"></span>**Engram — Memoria persistente para agentes IA**
    Binary Go con SQLite + FTS5, MCP server, HTTP API, CLI y TUI. Agent-agnostic, zero dependencies. Open source por Gentleman Programming.
    <https://github.com/Gentleman-Programming/engram> · <https://github.com/Gentleman-Programming/engram/blob/main/DOCS.md>
