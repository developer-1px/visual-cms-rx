# 전역 상태 직접 접근 패턴

## 사용자 요청
> "현재 상태를 reducer의 scan에서 관리를 하지마. 어차피 전역 state 공간이 있으니 값을 가져오는건 문제가 없어. root에서부터 path로 접근하면 되잖아. 그리고 마지막 반환값을 다시 path을 이용해서 밀어 넣으면 그만이야."

## 현재 구조의 문제
```typescript
// 현재: scan으로 상태 관리
merge(...streams).pipe(
  scan((state, updater) => updater(state), initialValue)
)
```
- 상태가 scan 내부에 갇혀있음
- 개별 스트림에서 상태 접근 불가

## 새로운 구조 제안

### 1. 전역 상태 직접 읽기/쓰기
```typescript
// storeValues에서 직접 읽기
const getCurrentState = (path: string) => {
  const parts = path.split('.');
  let current = storeValues;
  for (const part of parts) {
    current = current[part];
  }
  return current;
};

// storeValues에 직접 쓰기
const setCurrentState = (path: string, value: any) => {
  const parts = path.split('.');
  let current = storeValues;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
};
```

### 2. on.withState 구현 가능!
```typescript
on.withState = (action) => {
  return on(action).pipe(
    map(payload => {
      const currentState = getCurrentState(pathString);
      return [currentState, payload];
    })
  );
};

// 사용
on.withState(_증가하기).pipe(
  map(([state, amount]) => state + amount),
  tap(newState => setCurrentState(pathString, newState))
)
```

### 3. 더 간단한 버전
```typescript
// reducer 내부에서
on(_증가하기).pipe(
  map(amount => {
    const state = getCurrentState(pathString);
    const newState = state + amount;
    setCurrentState(pathString, newState);
    return newState;
  })
)
```

## 장점
1. **scan 제거**: 복잡한 함수 반환 패턴 불필요
2. **직접 상태 접근**: 언제든 현재 상태 읽기 가능
3. **on.withState 구현 가능**: 원하던 API 제공
4. **단순한 로직**: map 안에서 읽고-계산하고-쓰기

## 단점?
- 사실상 없음. 어차피 전역 상태 관리하고 있었음

## 결론
scan 방식을 버리고 전역 상태 직접 접근하면:
- 코드가 훨씬 단순해짐
- 원하는 API 구현 가능
- 함수 반환 패턴 제거 가능