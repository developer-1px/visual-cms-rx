# useBoundingRect() 패턴 구현 계획

## 현재 상황
```typescript
// useSelectedId() 패턴
export const useSelectedId = reducer(storePath.selection.selectedId, null as string | null, on => {
  on(_선택하기, (state, payload) => payload.id)
  on(_선택해제하기, () => null)
})

// 사용
const selectedId = $derived(useSelectedId());
```

## 목표
```typescript
// useBoundingRect() 패턴
const boundingRect = $derived(useBoundingRect(id));
```

## 구현 방안

### 1. Store에 BoundingRect 정보 저장
```typescript
// store 구조
selection: {
  selectedId: string | null;
  boundingRects: Record<string, DOMRect>;
}
```

### 2. reducer로 구현
```typescript
export const useBoundingRect = (id: string) => 
  reducer(
    `selection.boundingRects.${id}`, 
    null as DOMRect | null,
    on => {
      on(_크기변경하기, (state, payload) => 
        payload.id === id ? payload.rect : state
      )
      on(_선택해제하기, () => null)
    }
  )
```

### 3. Selectable에서 사용
```typescript
const boundingRect = $derived(useBoundingRect(id));

// Observable은 여전히 필요 (DOM 변화 감지용)
$effect(() => {
  if (element && isSelected) {
    run(
      createBoundingRectObservable(element),
      rect => dispatch(_크기변경하기({ id, rect }))
    );
  }
});
```

## 장점
- `useSelectedId()`와 일관된 패턴
- Store에서 BoundingRect 접근 가능
- 다른 컴포넌트에서도 사용 가능

## 단점
- Store 크기 증가
- 선택 해제시 정리 필요
- Observable은 여전히 필요