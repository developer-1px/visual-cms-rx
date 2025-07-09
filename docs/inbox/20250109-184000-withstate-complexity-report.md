# withState 패턴 복잡도 보고서

## 사용자 요청
> "on.withState(_증가하기).pipe(map([state, amount]) => 이런식으로는 안되나? 뭔가 더 복잡해진 패턴인데?"

## 패턴 비교

### 1. 현재 패턴 (가장 단순)
```typescript
on(_증가하기).pipe(
  map(amount => (state: number) => state + amount)
)
```

### 2. 제안했던 withState 패턴 (더 복잡)
```typescript
on(_증가하기).pipe(
  on.withState((state, amount) => state + amount)
)
```

### 3. 사용자 제안 패턴
```typescript
on.withState(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)
```

## 사용자 제안 패턴의 문제점
1. **state를 어디서 가져올지 불명확**
   - Observable 스트림에서 현재 상태를 주입해야 함
   - 이를 위해 추가적인 복잡도 발생

2. **결국 함수 반환 필요**
   ```typescript
   // 실제로는 이렇게 되어야 함
   map(([state, amount]) => () => state + amount)
   ```

3. **타입 추론 복잡**
   - 튜플 타입 `[State, Payload]` 관리 필요

## 결론
- **현재 패턴이 가장 명확하고 단순함**
- 보일러플레이트가 있지만 명시적이고 이해하기 쉬움
- RxJS의 기본 operator만 사용하여 추가 학습 불필요
- "개선"이 오히려 복잡도를 높이는 사례

## 권장사항
현재 패턴 유지:
```typescript
map(amount => (state: number) => state + amount)
```

이 패턴이 반복적이긴 하지만, 가장 직관적이고 디버깅하기 쉬움