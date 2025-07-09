# merge 대안들

## 문제점
1. 가변 인자 + 마지막 함수 = 타입 추론 지옥
2. RxJS merge와 이름 충돌

## 대안 1: 다른 이름 사용
```typescript
// any, some, all, combine, union 등
on.any(_증가하기, _감소하기, state => state + 1)
on.combine(_증가하기, _감소하기, state => state + 1)
```

## 대안 2: 배열로 받기
```typescript
on([_증가하기, _감소하기], state => state + 1)

// 또는
on.many([_증가하기, _감소하기], state => state + 1)
```

## 대안 3: 체이닝 패턴
```typescript
on(_증가하기)
  .or(_감소하기)
  .or(_리셋하기)
  .map(state => state + 1)
```

## 대안 4: 그냥 현재 방식 유지
```typescript
// 솔직히 이것도 나쁘지 않음
on.merge(_증가하기, _감소하기).pipe(
  map(([state]) => state + 1)
)
```

## 결론
- merge는 복잡한 케이스가 많아서 pipe 패턴이 오히려 명확할 수도
- 단순 on()만 개선하는 것도 충분한 개선
- 완벽보다는 실용적인 선택이 중요