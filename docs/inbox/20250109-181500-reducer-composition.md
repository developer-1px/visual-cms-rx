# Reducer 합성 방향성

## 문제 상황
동일한 path에 대해 여러 reducer를 정의할 때 어떻게 처리할 것인가?

```typescript
// 현재는 나중에 정의된 reducer가 덮어씀
export const useCounter = reducer(storePath.counter.value, 0, on => [...]);
export const useCounter2 = reducer(storePath.counter.value, 0, on => [...]); // 덮어씀!
```

## 방향성 1: 허용 (Redux combineReducers 스타일)
**장점:**
- 기능별 분리로 모듈화 향상
- 큰 reducer를 작은 단위로 나눔
- 팀 작업시 충돌 감소

**단점:**
- 어떤 reducer가 어떤 액션을 처리하는지 추적 어려움
- 의도치 않은 덮어쓰기 가능

## 방향성 2: 차단 (명확성 우선)
```typescript
if (stateObservables.has(pathString)) {
  throw new Error(`Reducer already exists for path: ${pathString}`);
}
```

**장점:**
- 명확한 1:1 관계
- 디버깅 쉬움
- 실수 방지

**단점:**
- 유연성 감소
- 모든 액션을 한 곳에서 정의해야 함

## 제안: 중간 방식 (명시적 합성 API)

```typescript
// reducer를 합성할 수 있는 명시적 API 제공
export const useCounter = combineReducers(
  storePath.counter.value,
  0,
  [
    reducer(on => [
      on(_증가하기).pipe(map(amount => (state: number) => state + amount)),
      on(_감소하기).pipe(map(amount => (state: number) => state - amount))
    ]),
    reducer(on => [
      on(_리셋하기).pipe(map(() => () => 0))
    ])
  ]
);
```

**장점:**
- 의도적인 합성은 명시적으로 허용
- 실수로 인한 덮어쓰기 방지
- 코드의 의도가 명확함

## 구현 고려사항
1. `combineReducers` 함수 구현 필요
2. 각 reducer의 Observable을 merge하여 처리
3. 초기값은 첫 번째 reducer의 값 사용
4. 타입 안전성 보장