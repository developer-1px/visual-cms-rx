# 선언적 Observable API 설계

## 현재 (콜백 방식)
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

## 제안 1: Pipe to Action
```typescript
// 선언적으로 Observable을 Action에 연결
$effect(() => {
  if (element && isSelected) {
    createBoundingRectObservable(element)
      .pipe(toAction(_크기변경하기, rect => ({ id, rect })))
      .subscribe();
  }
});
```

## 제안 2: Connect 패턴
```typescript
// Observable과 Action을 연결
$effect(() => {
  if (element && isSelected) {
    connect(
      createBoundingRectObservable(element),
      _크기변경하기,
      rect => ({ id, rect })
    );
  }
});
```

## 제안 3: Reactive Statement
```typescript
// 가장 선언적 - Svelte의 reactive statement처럼
$: element && isSelected && pipe(
  createBoundingRectObservable(element),
  _크기변경하기,
  rect => ({ id, rect })
);
```

## 제안 4: Stream Binding
```typescript
// store처럼 바인딩
const rect$ = $derived.by(() => 
  element && isSelected 
    ? createBoundingRectObservable(element) 
    : null
);

// 자동으로 액션 dispatch
$: rect$ && bindToAction(rect$, _크기변경하기, rect => ({ id, rect }));
```

## 제안 5: Decorator 스타일
```typescript
// 가장 깔끔하지만 구현이 복잡
@track(element, { when: () => isSelected })
const boundingRect$ = _크기변경하기(rect => ({ id, rect }));
```

## 권장안: Connect 패턴
가장 현실적이면서도 선언적인 방법