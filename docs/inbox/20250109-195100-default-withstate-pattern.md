# 기본값을 withState로 만들기

## 통찰
대부분의 reducer는 현재 상태를 참조함

### 현재 사용 패턴
```typescript
// 99% 케이스 - 상태 필요
on.withState(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)

// 1% 케이스 - 상태 불필요  
on(_리셋하기).pipe(
  map(() => 0)
)
```

## 제안: API 뒤집기

### 옵션 1: 기본이 withState
```typescript
on(_증가하기).pipe(  // 기본적으로 [state, payload]
  map(([state, amount]) => state + amount)
)

on.payloadOnly(_리셋하기).pipe(  // 특수 케이스
  map(() => 0)
)
```

### 옵션 2: 모든 on이 state 포함
```typescript
on(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)

on(_리셋하기).pipe(
  map(([state]) => 0)  // state 무시
)
```

## 결론
옵션 2가 가장 일관성 있음. 모든 reducer는 상태를 받되, 사용 여부는 선택.