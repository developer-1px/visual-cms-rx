# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

svelte-rx is an RxJS-based state management library for Svelte 5, providing Redux-like patterns with minimal boilerplate. The project is evolving into a **Universal Web CMS** - a visual HTML editor that can edit any website without custom development.

## Architecture

### Layer Structure
```
src/lib/
├── base/           # Core utilities
│   ├── svelte-rx/  # RxJS state management
│   ├── dom/        # DOM observables
│   └── keyboard/   # Hotkey management
├── entities/       # Domain state stores
├── features/       # Feature modules (html-parser)
├── actions/        # Svelte actions (Korean names: _선택하기)
├── components/     # UI components
├── modules/        # Complex UI modules
└── widgets/        # Dev tools
```

### State Management Pattern
```typescript
// Define action
export const _액션이름 = action<PayloadType>('액션이름');

// Create reducer
export const useStoreName = reducer(storePath.name, initialState, on => {
  on(_액션이름, (state, payload) => ({ ...state, /* updates */ }));
});

// Use in component
const value = $derived(useStoreName());
dispatch(_액션이름(payload));
```

## Essential Commands

```bash
# Install dependencies
pnpm install

# Build for production (ALWAYS USE THIS for testing)
pnpm build

# Run tests
pnpm test
pnpm test:ui    # With UI

# Type checking
pnpm check

# Linting
pnpm lint
pnpm lint:fix

# Development server (AVOID - has hang issues)
# pnpm dev  # DO NOT USE
```

**Critical**: Always use `pnpm build` for testing, NOT `pnpm dev` due to hang-up issues.

## Import Convention

**⚠️ IMPORTANT: No Barrel Imports**

Always use explicit import paths:

```typescript
// ❌ BAD
import { useSelectedId } from '@/lib/entities';

// ✅ GOOD
import { useSelectedId } from '@/lib/entities/selection/store';
```

## State Management Rules

1. **Direct State Access**: Access store values directly without props
2. **No .value in Svelte 5**: Use `$derived(useStore())` pattern
3. **Korean Action Names**: Actions use Korean naming (e.g., `_선택하기`)

## Key Features

- **Edit Modes**: view, edit, select
- **Selection System**: Smart element targeting
- **Undo/Redo**: Full history management
- **HTML Editor**: Visual editing with live preview
- **DevTool**: State debugging widget

## Testing Approach

- Unit tests with Vitest (JSDOM environment)
- Build verification tests
- Run single test: `pnpm test path/to/test.ts`

## Development Principles

1. Build incrementally - one working feature at a time
2. Keep code deletable and pluggable (OCP)
3. Refactor when files exceed 300 lines
4. Use pure functions and abstraction layers
5. Write minimal code - less is more
6. Test with `pnpm build`, not `pnpm dev`

## Current Focus

Transitioning from a state management library to a Universal Web CMS that enables visual editing of any website without custom admin development.