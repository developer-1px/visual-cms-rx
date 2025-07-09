# 엄격한 컨벤션 전략 - 수렴을 위한 구조

> 응 실험을 해볼거야. 그러기 위해서 컨벤션을 빡세게 잡아야 겠지. 우선 base폴더에는 라이브러리와 유틸만 담아보려고 해

## 컨벤션의 중요성

RxJS 패턴이 수렴하려면 **명확한 가이드레일**이 필요:
- 폴더 구조가 사고를 유도
- 제약이 창의성을 올바른 방향으로

## 제안하는 폴더 구조

```
src/
├── base/              # 순수 라이브러리 & 유틸리티
│   ├── rx/           # RxJS 관련 유틸
│   ├── dom/          # DOM 조작 유틸
│   ├── data/         # 데이터 변환 유틸
│   └── types/        # 공통 타입 정의
│
├── streams/          # 모든 스트림 정의
│   ├── ui/          # UI 관련 스트림
│   ├── data/        # 데이터 스트림
│   └── effects/     # 사이드 이펙트 스트림
│
├── components/       # Svelte 컴포넌트
│   ├── atoms/       # 기본 컴포넌트
│   ├── molecules/   # 조합 컴포넌트
│   └── organisms/   # 복잡한 컴포넌트
│
└── features/        # 기능별 모듈
    ├── editor/
    ├── table/
    └── sync/
```

## Base 폴더 규칙

### 1. 순수성 원칙
```typescript
// ✅ Good - base/rx/operators.ts
export const retryWithDelay = (delay: number) => 
  retryWhen(errors => errors.pipe(
    delayWhen(() => timer(delay))
  ))

// ❌ Bad - 상태나 DOM 의존성 없어야 함
export const updateUI = () => { ... }
```

### 2. 재사용성
- 프로젝트 독립적
- 다른 프로젝트에 복사해도 작동
- 외부 의존성 최소화

### 3. 테스트 가능성
- 모든 함수는 단위 테스트
- 입력과 출력이 명확
- 사이드 이펙트 없음

## Streams 폴더 전략

### 스트림 네이밍 컨벤션
```typescript
// streams/ui/selection.stream.ts
export const mouseDown$ = fromEvent(document, 'mousedown')
export const mouseMove$ = fromEvent(document, 'mousemove')
export const mouseUp$ = fromEvent(document, 'mouseup')

export const selection$ = mouseDown$.pipe(
  switchMap(start => mouseMove$.pipe(
    map(move => calculateSelection(start, move)),
    takeUntil(mouseUp$)
  ))
)
```

### 스트림 조합 규칙
```typescript
// streams/effects/sync.effect.ts
export const syncEffect$ = merge(
  visualEditor$,
  tableEditor$
).pipe(
  debounceTime(300),
  tap(syncToServer)
)
```

## 컴포넌트 규칙

### Svelte + RxJS 통합 패턴
```svelte
<!-- components/molecules/SelectableArea.svelte -->
<script lang="ts">
  import { selection$ } from '@/streams/ui/selection.stream'
  import { fromObservable } from '@/base/rx/svelte'
  
  const selection = fromObservable(selection$, null)
</script>
```

## 엄격한 Import 규칙

```typescript
// 1. Base는 아무것도 import 안함
// base/rx/utils.ts
// ✅ import { Observable } from 'rxjs'
// ❌ import { something } from '@/streams'

// 2. Streams는 base만 import
// streams/ui/mouse.ts
// ✅ import { retryWithDelay } from '@/base/rx'
// ❌ import { Component } from '@/components'

// 3. Components는 base와 streams만
// 4. Features는 모든 것 import 가능
```

## 기대 효과

1. **강제된 순수성**: base의 순수성이 전체 코드 품질 향상
2. **명확한 의존성**: 순환 참조 원천 차단
3. **예측 가능한 구조**: 어디에 뭐가 있는지 명확
4. **수렴 가속화**: 제약이 올바른 패턴으로 유도

## 실험 체크리스트

- [ ] base 폴더 구조 생성
- [ ] 첫 번째 순수 유틸리티 작성
- [ ] Selectable을 스트림 패턴으로 재구현
- [ ] 컴포넌트와 스트림 통합 테스트
- [ ] 팀원과 컨벤션 공유 및 피드백