# Setup 함수 패턴으로 변경

## 현재 방식 - 배열 반환
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => [
  on(_증가하기).pipe(
    map(([state, amount]) => state + amount)
  ),
  on(_감소하기).pipe(
    map(([state, amount]) => state - amount)
  )
])
```

## 새로운 방식 - 함수 본문에서 직접 설정
```typescript
export const useCounter = reducer(storePath.counter.value, 0, on => {
  on(_증가하기).pipe(
    map(([state, amount]) => state + amount)
  )
  
  on(_감소하기).pipe(
    map(([state, amount]) => state - amount)
  )
  
  on(_리셋하기).pipe(
    map(() => 0)
  )
})
```

## 장점
1. 배열 리터럴 `[]` 제거
2. 쉼표 `,` 제거
3. 더 명령형 스타일 (등록하는 느낌)
4. 코드 추가/제거 시 쉼표 신경 안 써도 됨

## 구현 방향
- setupFn이 Observable 배열 대신 void 반환
- 내부에서 각 스트림을 수집하는 방식으로 변경