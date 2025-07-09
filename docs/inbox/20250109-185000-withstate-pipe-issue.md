# withState가 pipe로 안 되는 이유

## 사용자 요청
> "on.withState는 왜 pipe로 안되는거야?"

## 문제 상황

### 원하는 형태
```typescript
on.withState(_증가하기).pipe(
  map(([state, amount]) => state + amount)
)
```

### 왜 안 되는가?

1. **상태는 Observable 밖에 있음**
   - `on(_증가하기)`는 `Observable<number>` (액션의 payload만)
   - 현재 상태는 reducer의 scan에서 관리
   - Observable 스트림에 상태가 포함되어 있지 않음

2. **타이밍 문제**
   ```typescript
   // on.withState가 만약 구현된다면
   on.withState(_증가하기) // 이 시점에 현재 상태를 어떻게 가져올까?
   ```
   - 액션이 발생하기 전에는 상태를 알 수 없음
   - 상태는 계속 변하는데, 어느 시점의 상태를 사용할지 불명확

3. **구조적 한계**
   ```typescript
   // 현재 구조
   merge(...streams).pipe(
     scan((state, updater) => updater(state), initialValue)
   )
   ```
   - 모든 스트림이 합쳐진 후 scan에서 상태 관리
   - 개별 스트림 레벨에서는 상태 접근 불가

## 가능한 대안

### 1. BehaviorSubject로 상태 공유 (복잡함)
```typescript
const stateSubject = new BehaviorSubject(initialValue);

on(_증가하기).pipe(
  withLatestFrom(stateSubject),
  map(([amount, state]) => state + amount)
)
```
문제: 상태 동기화, 구독 관리 등 복잡도 증가

### 2. 현재 패턴 유지 (권장)
```typescript
on(_증가하기).pipe(
  map(amount => (state: number) => state + amount)
)
```
- 단순하고 명확
- 상태는 scan에서 중앙 관리
- 함수를 반환하는 패턴이 필수인 이유

## 결론
- `on.withState`를 pipe로 만들려면 전체 구조를 바꿔야 함
- 현재 패턴이 구조적으로 가장 깔끔
- `on.merge` 정도만 유용하고 나머지는 그닥