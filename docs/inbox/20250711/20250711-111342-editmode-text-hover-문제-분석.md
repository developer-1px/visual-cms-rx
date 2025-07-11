# EditMode Text Hover 문제 분석

> 사용자 요청: "editmode에는 text에 hover mode가 안되는데?"

## 현재 상황 분석

EditMode에서 text 요소에 hover 했을 때 `_호버시작` 액션이 dispatch되지 않는 문제가 발생하고 있습니다.

## 문제 원인 추적

### 1. EditOverlay의 변경사항
- 기존: `class:pointer-events-none={isEditMode && hasTextHover}` 있었음
- 현재: 해당 라인이 제거됨
- 결과: EditOverlay가 text 위에서도 마우스 이벤트를 받음

### 2. 중복된 hover 감지 로직
현재 두 곳에서 text hover를 감지하려고 함:
1. **EditableText 컴포넌트**: `onmouseenter={handleMouseEnter}` 
2. **EditOverlay**: `onmousemove={handleOverlayMouseMove}`

### 3. 이벤트 우선순위 문제
- EditOverlay (z-index: 9999)가 최상위에 있어서 먼저 마우스 이벤트를 받음
- EditableText의 마우스 이벤트가 실행되지 않음

## 해결 방안 검토

### 방안 1: EditOverlay에서 text hover 처리 (현재 구현)
```typescript
// EditOverlay.svelte
function handleOverlayMouseMove(event: MouseEvent) {
  const element = getElementAtPoint(event.clientX, event.clientY);
  if (element && id && type) {
    dispatch(_호버시작({ nodeId: id })); // ✅ 이 부분이 작동해야 함
  }
}
```

### 방안 2: EditableText에서만 hover 처리
- EditOverlay에서 `pointer-events-none` 재추가
- EditableText의 마우스 이벤트만 사용

## 현재 문제점

EditOverlay의 `getElementAtPoint` 함수에서 text 요소를 제대로 감지하지 못하고 있을 가능성이 높습니다.

## 다음 조사 항목

1. `getElementAtPoint` 함수가 text 요소를 올바르게 반환하는지 확인
2. `filterSelectableElements`와 `selectElementWithSmartPolicy` 함수가 text 요소를 필터링하지 않는지 확인
3. EditableText 컴포넌트의 `data-node-id`와 `data-editable` 속성이 올바르게 설정되어 있는지 확인

## 권장 해결책

EditOverlay에서 text hover 감지가 제대로 작동하도록 디버깅을 진행하되, 실패시 EditableText 컴포넌트에서만 hover를 처리하는 방식으로 롤백하는 것을 고려합니다.