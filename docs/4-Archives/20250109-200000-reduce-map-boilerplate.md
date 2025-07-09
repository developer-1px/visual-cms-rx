# map 보일러플레이트 제거 방안

## 현재 패턴
```typescript
on(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)
```

## 제안 1: 커스텀 operator
```typescript
// mapState operator 제공
on(_증가하기).pipe(
  mapState((state, amount) => state + amount)
)

// 구현
export const mapState = <T, P, R>(
  fn: (state: T, payload: P) => R
): OperatorFunction<[T, P], R> => {
  return map(([state, payload]) => fn(state, payload));
}
```

## 제안 2: pipe 없이 바로 처리
```typescript
// pipe 자체를 숨기기
on(_증가하기, (state, amount) => state + amount)

// 또는
on(_증가하기).map((state, amount) => state + amount)
```

## 제안 3: 빌더 패턴
```typescript
on(_증가하기)
  .update((state, amount) => state + amount)

on(_리셋하기)
  .set(0)  // 상태 무시하고 값 설정
```

## 제안 4: 헬퍼 함수들
```typescript
// 자주 쓰는 패턴들을 미리 만들어두기
on(_증가하기).pipe(add)      // (state, n) => state + n
on(_감소하기).pipe(subtract)  // (state, n) => state - n
on(_리셋하기).pipe(reset(0))  // () => 0
```

## 권장안: 제안 1 (mapState)
- RxJS 패러다임 유지
- 가장 작은 변경
- 명시적이면서도 간결
- 타입 추론도 깔끔