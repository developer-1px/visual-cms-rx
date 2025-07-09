# Run 없이 데이터로만 표현하기

## 현재 (run 사용)
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

## 아이디어 1: Action Observable
```typescript
// Observable을 액션으로 변환
const rectAction$ = $derived.by(() => 
  boundingRect$?.pipe(
    map(rect => _크기변경하기({ id, rect }))
  )
);

// 액션 Observable을 구독하면 자동 dispatch
$effect(() => {
  rectAction$?.subscribe(dispatch);
});
```

## 아이디어 2: Effect Observable
```typescript
// dispatch까지 포함한 Observable
const trackingEffect$ = $derived.by(() => 
  boundingRect$?.pipe(
    tap(rect => dispatch(_크기변경하기({ id, rect })))
  )
);

// 구독만 하면 됨
$effect(() => {
  trackingEffect$?.subscribe();
});
```

## 아이디어 3: Auto Subscribe
```typescript
// 자동 구독 Observable 생성
const tracking$ = $derived.by(() => {
  if (!boundingRect$) return null;
  
  return {
    stream: boundingRect$,
    action: _크기변경하기,
    mapper: (rect: DOMRect) => ({ id, rect })
  };
});

// 헬퍼로 처리
$effect(() => {
  if (tracking$) {
    const sub = tracking$.stream
      .pipe(map(tracking$.mapper))
      .subscribe(payload => dispatch(tracking$.action(payload)));
    
    onDestroy(() => sub.unsubscribe());
  }
});
```

## 문제점
1. subscribe 호출이 결국 필요
2. unsubscribe 관리 여전히 필요
3. 오히려 복잡도 증가

## 결론
run() 같은 헬퍼는 필요악. 완전히 데이터로만 표현하면 오히려 복잡해짐.