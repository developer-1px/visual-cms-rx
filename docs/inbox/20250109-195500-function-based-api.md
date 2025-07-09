# 함수 기반 API로 배열 destructuring 제거

## 현재 문제
```typescript
map(([state, amount]) => state + amount)  // 배열 destructuring 필요
```

## 제안: 함수 형태로 변경

### 옵션 1: 커링 패턴
```typescript
on(_증가하기).pipe(
  map(state => amount => state + amount)
)
```

### 옵션 2: 객체 반환
```typescript
on(_증가하기).pipe(
  map(({ state, payload }) => state + payload)
)
```

### 옵션 3: 헬퍼 함수 제공
```typescript
on(_증가하기).pipe(
  mapState((state, amount) => state + amount)
)
```

### 옵션 4: with 패턴
```typescript
on(_증가하기).pipe(
  map(with => with((state, amount) => state + amount))
)
```

## 권장안: 옵션 3
- `mapState` 헬퍼가 가장 직관적
- 배열 destructuring 완전 제거
- 타입 추론도 깔끔