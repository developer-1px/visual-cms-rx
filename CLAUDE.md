# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

svelte-rx is an RxJS-based state management library for Svelte 5, providing Redux-like patterns with minimal boilerplate by leveraging RxJS operators for reactive programming. The project is currently transitioning to an HTML editor with CMS capabilities.

## Import Convention

**⚠️ IMPORTANT: 배럴 import 금지 (No Barrel Imports)**

Always use explicit import paths. Never import from index.ts files.

```typescript
// ❌ BAD - Barrel import
import { useSelectedId } from '@/lib/entities';
import { _선택하기 } from '@/lib/actions';

// ✅ GOOD - Explicit import
import { useSelectedId } from '@/lib/entities/selection/store';
import { _선택하기 } from '@/lib/actions/selection';
```

This improves:
- Unused import detection
- Tree shaking optimization
- Build performance
- IDE performance

## Essential Commands

```bash
# Install dependencies
pnpm install

# Build for production (ALWAYS USE THIS for testing)
pnpm build

# Preview production build
pnpm preview

# Run tests
pnpm test
pnpm test:ui    # Run tests with UI

# Type checking
pnpm check

# Linting
pnpm lint
pnpm lint:fix

# Development server (AVOID - has hang issues)
# pnpm dev  # DO NOT USE
```

**Critical**: Always use `pnpm build` for testing, NOT `pnpm dev` due to hang-up issues.

## Architecture & Core Concepts

### State Management Pattern

```typescript
// 1. Define action
export const increment = action<number>('increment');

// 2. Create reducer with on() helper
export const useCounter = reducer('counter.value', 0, on => {
  on(increment, (state, amount) => state + amount)
  on(decrement, (state, amount) => state - amount)
  on(reset, () => 0)
});

// 3. Use in components
const counter = useCounter();
dispatch(increment(5));
```

### Core APIs

1. **action**: Event definition function using RxJS Subject
2. **dispatch**: Publishes actions to all listeners with automatic logging
3. **on**: Subscribes to actions with operator chaining support
4. **reducer**: Creates reactive state with pure update functions
5. **getCurrentState**: Direct state access for current values
6. **fromObservable/useObservable**: Observable-to-reactive converters

### Key Implementation Details

- Actions are RxJS Subjects that broadcast to all reducers
- Reducers automatically log all actions and state changes with `[svelte-rx]` prefix
- Path-based state management via `store-path.ts`
- Automatic subscription cleanup in Svelte effects
- Lazy observable creation for performance
- Type-safe throughout with TypeScript strict mode

### Project Structure

```
src/lib/
├── base/
│   ├── dom/                    # DOM utilities and observables
│   └── svelte-rx/             # Core state management
├── entities/                   # Domain entities
│   ├── editor/
│   └── selection/
├── features/                   # Feature modules
│   └── html-parser/           # HTML editor functionality
├── actions/                    # Action definitions
├── modules/                    # Additional modules
└── widgets/                    # UI widgets
```

## Development Workflow

1. **Planning First**: Write plans in `/docs/inbox/` before coding
2. **Incremental Development**: Complete small, working pieces (≤10 lines per task)
3. **Connect First**: Attach to UI before full implementation (화면에 붙이고 구현해)
4. **Quality Checks**: Run `pnpm lint` and `pnpm check` after changes
5. **Documentation**: Write all docs in Korean in `/docs/inbox/`
6. **Refactor at 300 lines**: Keep files manageable

## Integration Patterns

### Observable to Reactive
```typescript
// Basic conversion
const value = fromObservable(myObservable$, initialValue);

// With lazy creation
const data = useObservable(() => fetchData$(), [dependency]);
```

### Store Protocol Integration
The library integrates with Svelte 5's store protocol for seamless reactivity with `$state` and `$effect` runes.

## Key Principles

- **"Write less, Do More!"** - 최소한의 코드로 최대 효과
- **Simple is not easy** - Strive for simplicity through thoughtful design
- **Less code is better code** - Remove unnecessary code continuously
- **Design for deletion** - Keep components pluggable (OCP principle)
- **Match file names to main exports** - For easier navigation

## Common Tasks

### Adding a New Action
1. Define action in appropriate `actions/*.ts` file
2. Add reducer handler using `on()` helper
3. Test with `pnpm build`

### Creating New State
1. Create `*Store.ts` file with reducer
2. Define actions for state mutations
3. Connect to UI component
4. Verify with type checking

### Debugging State Changes
All actions and state changes are automatically logged to console with `[svelte-rx]` prefix.

## Troubleshooting

- **Build hangs**: Use `pnpm build` instead of `pnpm dev`
- **Type errors**: Run `pnpm check` for detailed diagnostics
- **Version issues**: Search for latest packages, report breaking changes in `/docs/inbox/`

## Report Writing Rules

When writing reports in `/docs/inbox/`:
- **Format**: `yyyyMMdd-HHMMSS-title.md` (반드시 대문자 사용)
  - yyyy: 4자리 연도
  - MM: 2자리 월 (01-12)
  - dd: 2자리 일 (01-31)
  - HH: 2자리 시간 24시간 형식 (00-23)
  - MM: 2자리 분 (00-59)
  - SS: 2자리 초 (00-59)
  - **중요**: 시스템 날짜/시간 사용 (`date +"%Y%m%d-%H%M%S"`)
- **Always quote the original request** at the beginning using blockquote (>)
- **Write all documentation in Korean**
- **Include context and findings** before proposing solutions
- **Document version conflicts** and breaking changes when updating packages
- **파일 위치**: `/docs/inbox/YYYYMMDD/` 폴더 아래에 생성

## HTML Editor Project Goals

HTML을 읽어와서 선택과 편집이 가능하게 렌더링하는 에디터 개발:
- **핵심 전략**: DOM을 직접 다루지 않고 model → render 방식으로 구현
- **데이터 구조**: 모든 데이터를 직렬화 가능하도록 설계
- **목표 기능**:
  - CRDT (Conflict-free Replicated Data Type) 지원
  - Undo/Redo 기능 지원
  - 선택(Selection) 기능
  - 편집(Edit) 기능
- **구현 방식**: 순수한 데이터 모델을 기반으로 뷰를 렌더링하는 단방향 데이터 흐름

## Testing Setup

- Test framework: Vitest with jsdom environment
- Test files: `*.test.ts` alongside source files
- Setup file: `src/tests/setup.ts` with Svelte lifecycle mocks
- Run individual tests: Use Vitest's pattern matching in test commands

## Naming Conventions

- Action names can be written in Korean (e.g., `const 증가 = action('증가')`)
- Match file names to main exports for easier navigation
- Store files: `*Store.ts` pattern for state management files

## Dependencies

- **Core**: `svelte@5.35.2`, `rxjs@7.8.2`
- **UI**: `tailwindcss@4.1.11`, `lucide-svelte`
- **Testing**: `vitest`, `@testing-library/svelte`
- **Build**: `vite@7.0.3`, `typescript@5.8.3`

## Future Roadmap

1. Core 모듈 구현 (action, dispatch, on) ✓
2. 상태 관리 구현 (reducer, ref) ✓ 
3. Svelte 5 통합 (store protocol) ✓
4. Effect 시스템 (planned)
5. 예제 및 테스트 (in progress)
6. HTML Editor with selection and editing capabilities (active development)

## Styling Approach

- css는 tailwindCSS를 사용해