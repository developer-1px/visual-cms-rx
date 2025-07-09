# 편집 모드 오버레이 전략 보고서

> 편집모드가 되면 기존의 템플릿의 hover기능이나 링크 이동등의 이펙트가 없어야 해 그렇다고 html을 수정하기는 어렵지? 그래서 fixed로 투명한 element로 덮을 거야. 그러면 선택 영역을 어떻게 찾아야 할까? document.elementsFromPoint를 통해서 발견하는 식으로 만들거야

## 문제 정의

HTML 에디터의 편집 모드에서 해결해야 할 핵심 문제:
1. 원본 HTML의 hover 효과, 링크 클릭 등 모든 인터랙션 차단
2. HTML 구조를 수정하지 않고 구현
3. 편집을 위한 요소 선택 기능은 유지

## 해결 방안: 투명 오버레이 + elementsFromPoint

### 1. 투명 오버레이 구현
```typescript
// 전체 화면을 덮는 투명한 레이어
.edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
  cursor: crosshair;
}
```

### 2. 요소 탐색 메커니즘
```typescript
function handleOverlayClick(event: MouseEvent) {
  const { clientX, clientY } = event;
  
  // 오버레이를 잠시 숨겨서 아래 요소들 탐색
  overlay.style.pointerEvents = 'none';
  const elements = document.elementsFromPoint(clientX, clientY);
  overlay.style.pointerEvents = 'auto';
  
  // 선택 가능한 요소 찾기
  const selectable = elements.find(el => el.hasAttribute('data-selectable'));
  if (selectable) {
    dispatch(_선택하기({ id: selectable.id, rect: selectable.getBoundingClientRect() }));
  }
}
```

## 장점
1. **완벽한 이벤트 차단**: CSS hover, JS 이벤트 모두 차단
2. **원본 보존**: HTML/CSS 수정 없음
3. **유연한 제어**: 편집 모드 on/off가 간단
4. **성능**: DOM 조작 최소화

## 구현 계획
1. EditOverlay 컴포넌트 생성
2. elementsFromPoint 기반 선택 로직 구현
3. 시각적 피드백 (hover 프리뷰) 추가
4. 기존 SelectionOverlay와 통합

## 대안 검토
- **pointer-events: none**: hover 효과 차단 불가
- **Event capturing**: 복잡도 높고 완벽한 차단 어려움
- **iframe 격리**: 통신 복잡도와 스타일 문제
- **Shadow DOM**: 브라우저 호환성 이슈

## 결론
투명 오버레이 + elementsFromPoint 조합이 가장 심플하면서도 확실한 해결책입니다.