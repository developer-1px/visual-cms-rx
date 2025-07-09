# Reducer 내부 커스텀 State Operator 제안

## 현재 문제점
```typescript
// 매번 이런 패턴 반복
on(_증가하기).pipe(
  map(amount => (state: number) => state + amount)
)
```

## 제안: on 객체에 메서드 추가

### 현재 사용법
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => [
  on(_증가하기).pipe(
    map(amount => (state: number) => state + amount)
  )
])
```

### 제안하는 사용법
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => [
  on(_증가하기).pipe(
    on.withState((state, amount) => state + amount)
  ),
  on(_감소하기).pipe(
    on.withState((state, amount) => state - amount)
  ),
  on(_리셋하기).pipe(
    on.withState(() => 0)
  )
])
```

### 구현 아이디어
```typescript
type OnFunction = {
  // 기존 함수 시그니처
  <T>(action: Action<T>): Observable<T>;
  
  // 새로운 operator 메서드
  withState<T, P>(
    updater: (state: T, payload: P) => T
  ): OperatorFunction<P, Updater<T>>;
}

// 구현
const on = {
  // 기존 기능
  <T>(action: Action<T>): Observable<T> => { ... },
  
  // withState는 RxJS operator를 반환
  withState: <T, P>(updater: (state: T, payload: P) => T) => {
    return map((payload: P) => (state: T) => updater(state, payload));
  }
}
```

## on 객체 패턴의 장점
1. **확장성**: 새로운 헬퍼 메서드 추가가 쉬움
2. **인자 순서 문제 해결**: 메서드로 분리되어 있어 순서 걱정 없음
3. **IDE 자동완성**: `on.` 입력하면 사용 가능한 모든 메서드 확인
4. **보일러플레이트 감소**: pipe와 map 패턴 숨김
5. **일관성**: 모든 액션 처리가 on 객체를 통해 이루어짐

## 사용 예시 확장
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => [
  // 기본 상태 업데이트
  on(_증가하기).pipe(
    on.withState((state, amount) => state + amount)
  ),
  
  // 조건부 처리
  on(_증가하기).pipe(
    filter(amount => amount > 0),
    on.withState((state, amount) => state + amount)
  ),
  
  // 여러 RxJS operator와 함께 사용
  on(_검색하기).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    on.withState((state, query) => ({ ...state, searchQuery: query }))
  )
])
```

## 추가 제안: 더 많은 헬퍼
```typescript
// 현재 상태만 필요할 때
withState.current((state) => state * 2)

// 조건부 업데이트
withState.when(
  (state, amount) => state + amount,
  (state) => state < 100  // 조건
)

// 이전 값과 비교
withState.diff((prev, current) => {
  console.log('변화:', prev, '->', current);
  return current;
})
```

## 고려사항
- 너무 많은 헬퍼는 오히려 복잡도 증가
- 현재의 명시적 패턴도 장점이 있음
- 디버깅 시 함수 체인이 길어질 수 있음