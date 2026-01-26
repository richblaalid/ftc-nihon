---
description: Manage Architecture Decision Records for Charter Pro - identify, discuss, and document architectural choices
argument-hint: [status|next|new <topic>|identify|<number>]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(ls:*), Bash(mkdir:*), AskUserQuestion
---

# ADR Management Command

Identify, discuss, and document Architecture Decision Records for Charter Pro. This skill handles:

- **PRD Section 8 ADRs** (the 10 "open questions")
- **Implicit PRD decisions** (choices made but not formally documented)
- **New architectural decisions** as they arise

## Usage

| Command                 | Description                                |
| ----------------------- | ------------------------------------------ |
| `/adr` or `/adr status` | Show all ADRs and their status             |
| `/adr next`             | Work on the next pending PRD Section 8 ADR |
| `/adr new <topic>`      | Create a new ADR for any topic             |
| `/adr identify`         | Scan PRD for decisions that need ADRs      |
| `/adr 001`              | Work on a specific ADR by number           |

## Examples

```
/adr                     # See current status
/adr next                # Start next PRD ADR (e.g., ADR-001)
/adr new authentication  # Document the BetterAuth decision
/adr new image-hosting   # Create ADR for a new decision
/adr identify            # Find undocumented decisions in PRD
/adr 005                 # Work specifically on embedding model ADR
```

## ADR Categories

### Category A: PRD Section 8 (Numbers 0001-0010)

Open questions explicitly needing decisions:

- 0001: Database ORM choice
- 0002: Background job processing
- 0003: Real-time updates
- 0004: File processing pipeline
- 0005: Embedding model selection
- 0006: Chunk strategy
- 0007: Plugin sandboxing
- 0008: State management
- 0009: Testing strategy
- 0010: Monorepo structure

### Category B: Implicit PRD Decisions (Numbers 0100+)

Choices stated in PRD but not formally documented:

- BetterAuth for authentication
- Next.js 14+ App Router
- PostgreSQL with pgvector
- Tailwind CSS
- And others...

### Category C: New Decisions (Numbers 0200+)

Architectural decisions that arise during development.

## Workflow

1. **Check Status**: Glob `docs/adrs/ADR-*.md` and read frontmatter
2. **Gather Context**: Read relevant sections from PRD.md and product-plan.md
3. **Discuss**: Ask clarifying questions appropriate to the ADR type
4. **Recommend**: Present options with pros/cons and make a recommendation
5. **Document**: Generate ADR using the template
6. **Track**: Update `docs/adrs/README.md`

## Key Files

- **Skill definition**: `.claude/skills/adr-management/SKILL.md`
- **Template**: `.claude/skills/adr-management/TEMPLATE.md`
- **Questions**: `.claude/skills/adr-management/QUESTIONS.md`
- **Tracking**: `docs/adrs/README.md`
