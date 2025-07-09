# 항상 [state, payload] 반환하기

## 최종 결론
모든 `on()`이 항상 `[state, payload]`를 반환

### 구현
```typescript
on(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)

on(_감소하기).pipe(
  map(([state, amount]) => state - amount)  
)

on(_리셋하기).pipe(
  map(([state]) => 0)  // payload 무시
)

on.merge(_증가하기, _감소하기, _리셋하기).pipe(
  map(([state]) => state + 1)  // 모든 액션에서 1씩 증가
)
```

## 장점
1. **일관성**: 모든 API가 동일한 시그니처
2. **단순함**: withState 같은 특수 메서드 불필요
3. **직관적**: 항상 현재 상태에 접근 가능
4. **scan 제거**: 전역 상태 직접 접근으로 깔끔

## 변경 사항
- `on()` 기본 동작이 `[state, payload]` 반환
- `on.withState()` 제거 (불필요)
- `on.merge()`도 동일하게 `[state, payload]` 반환