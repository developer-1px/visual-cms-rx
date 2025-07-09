# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

svelte-rx is an RxJS-based state management library for Svelte 5, providing Redux-like patterns with minimal boilerplate by leveraging RxJS operators for reactive programming.

## Essential Commands

```bash
# Install dependencies
pnpm install

# Build for production (ALWAYS USE THIS for testing)
pnpm build

# Preview production build
pnpm preview

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
2. **dispatch**: Publishes actions to all listeners
3. **on**: Subscribes to actions with operator chaining support
4. **reducer**: Creates reactive state with pure update functions
5. **getCurrentState**: Direct state access for current values
6. **fromObservable/useObservable**: Observable-to-reactive converters

### Key Implementation Details

- Actions are RxJS Subjects that broadcast to all reducers
- Reducers automatically log all actions and state changes
- Path-based state management via `store-path.ts`
- Automatic subscription cleanup in Svelte effects
- Lazy observable creation for performance
- Type-safe throughout with TypeScript strict mode

### Project Structure

```
src/lib/
├── svelte-rx.svelte.ts      # Core library implementation
├── store-path.ts            # Path-based state utilities
├── useObservable.svelte.ts  # Observable integration
├── actions/                 # Action definitions
├── *Store.ts               # State management files
└── *.svelte                # UI components
```

## Development Workflow

1. **Planning First**: Write plans in `/docs/inbox/` before coding
2. **Incremental Development**: Complete small, working pieces (≤10 lines per task)
3. **Connect First**: Attach to UI before full implementation (화면에 붙이고 구현해)
4. **Quality Checks**: Run `pnpm lint` and `pnpm check` after changes
5. **Documentation**: Write all docs in Korean in `/docs/inbox/`

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
- **Refactor at 300 lines** - Keep files manageable
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
- **Format**: `yyyyMMdd-hhmmss-title.md`
- **Always quote the original request** at the beginning using blockquote (>)
- **Write all documentation in Korean**
- **Include context and findings** before proposing solutions
- **Document version conflicts** and breaking changes when updating packages

## Future Roadmap

1. Core 모듈 구현 (action, dispatch, on) ✓
2. 상태 관리 구현 (reducer, ref) ✓ 
3. Svelte 5 통합 (store protocol) ✓
4. Effect 시스템 (planned)
5. 예제 및 테스트 (in progress)

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

## Memoranda

- **Report Format**: When creating reports in `/docs/inbox/`, use the format: `yyyymmdd-hhmmss-title.md`
- **Document Writing Location**: Always prepare documents in `docs/inbox` for initial review and organization
- **Inbox Document Naming Convention**: `/docs/inbox yyyyMMdd-hhmmss-title.md` format for consistent documentation organization

## Naming Conventions

- Action 이름은 _한글로 작성
- **가급적 함수 이름과 파일명을 동일하게 만들어줘.**

## Folder Structure Conventions

- **entities 폴더 구조**:
  - features에는 핵심 요구사항을 담는다.

## Warnings and Restrictions

- `pnpm preview test` 명령은 금지됨. 이 명령은 의도하지 않은 부작용을 일으킬 수 있음