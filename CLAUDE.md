# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

svelte-rx is an RxJS-based state management library for Svelte 5, aiming to provide Redux-like patterns with less boilerplate and leveraging RxJS operators for reactive programming.

## Build Commands

```bash
# Install dependencies
pnpm install

# Development (AVOID - has hang issues)
# pnpm dev

# Build for production (USE THIS for testing)
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check
```

**Important**: Always use `pnpm build` or `pnpm test` for testing, NOT `pnpm dev` due to hang-up issues.

## Architecture

### Current Structure
- Standard Vite + Svelte 5 + TypeScript template
- Uses Svelte 5's new runes system (`$state`, `mount` API)
- TypeScript with separate configs for app and node

### Planned Architecture (from docs/inbox)

Core concepts to implement:
1. **action**: 이벤트를 정의하는 함수
2. **dispatch**: action을 발행하는 함수  
3. **on**: action을 구독하고 operator chain을 만드는 함수
4. **reducer**: 상태를 변경하는 순수 함수
5. **ref**: 읽기 전용 상태를 생성
6. **effect**: 부작용을 처리하는 함수

Key implementation notes:
- Use RxJS Subject for action implementation
- Operators should chain naturally: `on(action).pipe(...).subscribe(reducer)`
- Integrate with Svelte 5's store protocol for seamless reactivity
- Keep bundle size minimal

## Development Workflow

1. **Planning First**: Write plans in `/docs/inbox/` before coding
2. **Incremental Development**: Complete small, working pieces one at a time
3. **Task Size**: Keep code changes to ~10 lines per task
4. **Documentation**: Write all docs in Korean
5. **Testing**: Always run `pnpm build` to verify changes

## Key Principles

- "Write less, Do More!" - 최소한의 코드로 최대 효과
- Keep code simple (but simple is not easy)
- Less code is better code
- Design for deletion - keep components pluggable and following OCP
- Refactor when files exceed 300 lines
- Connect first, implement later (화면에 붙이고 구현해)

## Implementation Roadmap

1. Core 모듈 구현 (action, dispatch, on)
2. 상태 관리 구현 (reducer, ref) 
3. Svelte 5 통합 (store protocol)
4. Effect 시스템
5. 예제 및 테스트

## File Naming Convention

Match file names with their main exported function for easier navigation.

## When Issues Arise

- If stuck on the same issue, stop and write a report in `/docs/inbox/`
- Report format: `yyyymmdd-hhmmss-title.md`
- For version issues, search for latest packages but report breaking changes