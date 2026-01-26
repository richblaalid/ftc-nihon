---
description: Build React components, pages, and layouts following Charter Pro design system conventions
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(npm run lint:*), Bash(npm run typecheck:*), AskUserQuestion
---

# Frontend Development Command

Build React components, pages, and layouts for Charter Pro following the established design system.

## Usage

```
/frontend-dev                    # Start guided component development
/frontend-dev ChatMessage        # Create a specific component
/frontend-dev page /chat         # Create a page component
```

## Workflow

1. **Read Design System**: Start by reading `docs/design-system.md`
2. **Check Existing Patterns**: Look at similar components in `src/components/`
3. **Plan Component**: Confirm location, props, states needed
4. **Implement**: Follow design system guidelines strictly
5. **Verify**: Run lint and typecheck, test responsiveness

## Key Files

- **Design System**: `docs/design-system.md`
- **Skill Definition**: `.claude/skills/frontend-dev/SKILL.md`
- **UI Primitives**: `src/components/ui/`

## Quick Rules

- **Colors**: Semantic tokens only (`bg-primary`, NOT `bg-blue-600`)
- **Icons**: Lucide React, icon buttons need `aria-label`
- **States**: Always implement loading, empty, and error states
- **Spacing**: 4px increments (`space-1` through `space-8`)
- **Forms**: `space-y-4` gap, labels with `htmlFor`

See `.claude/skills/frontend-dev/SKILL.md` for complete guidelines.
