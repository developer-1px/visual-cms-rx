# 더 근본적인 해결책

## 문제의 본질
- `pipe(map(([state, payload]) => ...))` 패턴이 반복
- 추가 import는 오히려 복잡도 증가
- 결국 보일러플레이트는 그대로

## 근본적 접근: pipe를 기본 동작으로
```typescript
// 현재
on(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)

// 개선안: map을 기본으로 내장
on(_증가하기)((state, amount) => state + amount)

// 또는
on(_증가하기, (state, amount) => state + amount)
```

## 구현 방향
```typescript
const on = <P>(action: Action<P>, mapper?: (state: T, payload: P) => T) => {
  const stream$ = actionSubject.pipe(
    filter(/* ... */),
    map(/* ... */),
    mapper ? map(([s, p]) => mapper(s, p)) : map(([s]) => s)
  );
  
  if (mapper) {
    collectStream(stream$);
  }
  
  return stream$;
}
```

## 사용 예시
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => {
  on(_증가하기, (state, amount) => state + amount)
  on(_감소하기, (state, amount) => state - amount)
  on(_리셋하기, () => 0)
})
```

## 결론
- **pipe 완전 제거**
- **map 완전 제거**
- **import 불필요**
- 가장 간결한 형태