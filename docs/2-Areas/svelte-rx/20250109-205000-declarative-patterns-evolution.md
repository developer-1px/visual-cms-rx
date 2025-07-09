# 선언적 패턴 진화 과정

## 1단계: 명령형 (처음)
```typescript
onMount(() => {
  if (isSelected) {
    const sub = createBoundingRectObservable(element).subscribe(rect => {
      dispatch(_크기변경하기({ id, rect }));
    });
    return () => sub.unsubscribe();
  }
});
```

## 2단계: Effect와 조건문
```typescript
$effect(() => {
  if (element && isSelected) {
    run(
      createBoundingRectObservable(element),
      rect => dispatch(_크기변경하기({ id, rect }))
    );
  }
});
```

## 3단계: Derived Observable
```typescript
const boundingRect$ = $derived.by(() => 
  element && isSelected 
    ? createBoundingRectObservable(element) 
    : null
);

$effect(() => {
  boundingRect$ && run(
    boundingRect$, 
    rect => dispatch(_크기변경하기({ id, rect }))
  );
});
```

## 다음 단계 가능성

### 옵션 1: Custom Rune
```typescript
// 이상적이지만 불가능 (custom rune 만들 수 없음)
$subscribe(boundingRect$, rect => 
  dispatch(_크기변경하기({ id, rect }))
);
```

### 옵션 2: Pipe Chain
```typescript
const rectAction$ = $derived.by(() =>
  boundingRect$?.pipe(
    map(rect => _크기변경하기({ id, rect }))
  )
);

$effect(() => {
  rectAction$ && run(rectAction$, dispatch);
});
```

### 옵션 3: 더 축약된 헬퍼
```typescript
// subscribe and dispatch
$effect(() => {
  sad(boundingRect$, _크기변경하기, rect => ({ id, rect }));
});
```

## 현재가 최선인 이유
1. Svelte의 반응성 시스템 활용
2. Observable과 액션이 명확히 보임
3. 적절한 추상화 수준