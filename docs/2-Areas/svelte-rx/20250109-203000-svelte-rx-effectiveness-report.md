# svelte-rx 효과 보고서

## 개요
svelte-rx는 RxJS와 Svelte 5의 장점을 결합한 상태 관리 라이브러리로, MVI(Model-View-Intent) 패턴을 구현합니다.

## 1. 코드 간결성 향상

### Before (전통적인 상태 관리)
```typescript
let count = $state(0);

function increment(amount: number) {
  count += amount;
}

function decrement(amount: number) {
  count -= amount;
}

function reset() {
  count = 0;
}
```

### After (svelte-rx)
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => {
  on(_증가하기, (state, amount) => state + amount)
  on(_감소하기, (state, amount) => state - amount)
  on(_리셋하기, () => 0)
})
```

**개선점**:
- 상태 변경 로직이 한 곳에 집중
- 배열 리터럴과 쉼표 없이 깔끔한 구조
- 타입 추론 자동화

## 2. 느슨한 결합 (Loose Coupling)

### 액션 분리
```typescript
// actions/counterActions.ts
export const _증가하기 = action<number>('_증가하기');
export const _감소하기 = action<number>('_감소하기');
```

### 컴포넌트에서 사용
```typescript
// Counter.svelte
import { dispatch } from './svelte-rx.svelte';
import { _증가하기 } from './actions/counterActions';

dispatch(_증가하기(1));
```

**장점**:
- 컴포넌트가 store 구현을 모름
- 액션만 알면 됨
- 테스트와 리팩토링 용이

## 3. 데이터 흐름 추적

### 자동 로깅
```
#1: _선택하기
Payload: {id: "box-1", rect: DOMRect}
[selection.selectedId]: null → box-1
[selection.boundingRects]: {} → {box-1: DOMRect}
Store: {counter: {...}, selection: {...}}
```

**효과**:
- 모든 액션과 상태 변화 추적 가능
- 디버깅 시간 단축
- 버그 원인 파악 용이

## 4. 고급 패턴 지원

### Observable 활용
```typescript
// BoundingRect 추적 Observable
function createBoundingRectObservable(element: HTMLElement): Observable<DOMRect> {
  return merge(resize$, mutation$, windowResize$, scroll$).pipe(
    throttleTime(0, animationFrameScheduler),
    distinctUntilChanged(),
    shareReplay(1)
  );
}
```

**장점**:
- 복잡한 비동기 로직 처리
- 성능 최적화 (throttle, distinct)
- 선언적 코드

## 5. 실제 사용 사례: Selection UI

### 구현된 기능
1. 클릭으로 요소 선택
2. 실시간 크기/위치 추적
3. contenteditable 지원
4. Lazy loading (선택된 요소만 추적)

### 코드 구조
```
actions/selectionActions.ts    - 액션 정의
selectionStore.ts             - 상태 관리
Selectable.svelte            - 선택 가능한 컴포넌트
SelectionOverlay.svelte      - 선택 영역 표시
```

## 6. 성능 최적화

### Lazy Observable 구독
```typescript
// 선택되었을 때만 Observable 구독
$effect(() => {
  if (element && isSelected) {
    autoSubscribe(
      fromElement(() => element).boundingRect$,
      rect => dispatch(_크기변경하기({ id, rect }))
    );
  }
});
```

**효과**:
- 불필요한 Observer 생성 방지
- 메모리 사용량 감소
- 이벤트 처리 부하 감소

## 7. 개선 가능한 부분

### 현재 이슈
```typescript
$effect(() => {
  if (element && isSelected) {
    autoSubscribe(...);  // 여전히 보일러플레이트
  }
});
```

### 제안
- 더 선언적인 API 개발 필요
- 예: `@trackWhenSelected` 같은 디렉티브

## 결론

### 달성한 목표
1. ✅ **느슨한 결합 강제** - 액션과 스토어 분리
2. ✅ **코드 수렴** - 일관된 패턴으로 상태 관리
3. ✅ **데이터 흐름 추적** - 자동 로깅
4. ✅ **간결한 코드** - 보일러플레이트 대폭 감소

### svelte-rx의 가치
- **개발 속도 향상**: 일관된 패턴으로 빠른 구현
- **유지보수성**: 명확한 데이터 흐름
- **확장성**: RxJS의 강력한 연산자 활용 가능
- **타입 안정성**: 완벽한 타입 추론

### 적용 분야
- 복잡한 상태 관리가 필요한 앱
- 실시간 데이터 처리
- 협업이 중요한 프로젝트
- 이벤트 기반 아키텍처