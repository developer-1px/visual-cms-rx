# 이전 값을 활용할 수 있는 RxJS Operators

## 1. withLatestFrom
이전 값(또는 다른 스트림의 최신 값)과 함께 사용
```typescript
on(_증가하기).pipe(
  withLatestFrom(state$),
  map(([amount, currentState]) => currentState + amount)
)
```

## 2. pairwise
이전 값과 현재 값을 쌍으로 묶음
```typescript
stream$.pipe(
  pairwise(),
  map(([prev, current]) => /* 이전값과 현재값 활용 */)
)
```

## 3. bufferCount(2, 1)
슬라이딩 윈도우로 이전 값 포함
```typescript
stream$.pipe(
  bufferCount(2, 1),
  map(([prev, current]) => /* 처리 */)
)
```

## 4. startWith + pairwise
초기값과 함께 사용
```typescript
stream$.pipe(
  startWith(initialValue),
  pairwise()
)
```

## 우리 케이스에 적용 가능한 패턴
```typescript
// 현재 상태를 Observable로 만들어서 활용
const currentState$ = new BehaviorSubject(initialValue);

on(_증가하기).pipe(
  withLatestFrom(currentState$),
  map(([amount, state]) => state + amount),
  tap(newState => currentState$.next(newState))
)
```

하지만 이렇게 하면:
- 복잡도 증가
- 상태 동기화 문제
- 현재의 단순한 패턴이 더 나을 수 있음