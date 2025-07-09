# on 객체 helper 메서드 제안

## 사용자 요청
> "아니 나는 아까 on.buffer on.merge(a,b,c) on.debounce(a) 이런게 좋았는데"

## 좋은 helper 메서드들

### 1. on.merge - 여러 액션 병합
```typescript
// 현재
merge(
  on(_증가하기),
  on(_감소하기),
  on(_리셋하기)
).pipe(
  map(() => (state: number) => state + 1)
)

// 제안
on.merge(_증가하기, _감소하기, _리셋하기).pipe(
  map(() => (state: number) => state + 1)
)
```

### 2. on.buffer - 액션 버퍼링
```typescript
// 현재
on(_입력하기).pipe(
  bufferTime(1000),
  map(inputs => (state) => ({ ...state, buffered: inputs }))
)

// 제안
on.buffer(_입력하기, 1000).pipe(
  map(inputs => (state) => ({ ...state, buffered: inputs }))
)
```

### 3. on.debounce - 디바운스
```typescript
// 현재
on(_검색하기).pipe(
  debounceTime(300),
  map(query => (state) => ({ ...state, searchQuery: query }))
)

// 제안
on.debounce(_검색하기, 300).pipe(
  map(query => (state) => ({ ...state, searchQuery: query }))
)
```

### 4. on.throttle - 쓰로틀
```typescript
// 제안
on.throttle(_스크롤하기, 100).pipe(
  map(position => (state) => ({ ...state, scrollY: position }))
)
```

### 5. on.filter - 조건부 필터
```typescript
// 제안
on.filter(_증가하기, amount => amount > 0).pipe(
  map(amount => (state: number) => state + amount)
)
```

## 구현 아이디어
```typescript
type OnFunction = {
  // 기본 함수
  <T>(action: Action<T>): Observable<T>;
  
  // Helper 메서드들
  merge<T>(...actions: Action<T>[]): Observable<T>;
  buffer<T>(action: Action<T>, time: number): Observable<T[]>;
  debounce<T>(action: Action<T>, time: number): Observable<T>;
  throttle<T>(action: Action<T>, time: number): Observable<T>;
  filter<T>(action: Action<T>, predicate: (value: T) => boolean): Observable<T>;
}
```

## 장점
1. **가독성**: 의도가 명확하게 드러남
2. **간결함**: import 줄이고 코드 단순화
3. **일관성**: 모든 액션 처리가 on을 통해
4. **IDE 지원**: 자동완성으로 쉽게 발견
5. **RxJS 지식 불필요**: 초보자도 쉽게 사용

## 결론
- `withState`는 복잡하지만, 다른 helper들은 유용
- 자주 사용하는 RxJS 패턴을 쉽게 만들어줌
- 바이브 코딩에 적합한 API