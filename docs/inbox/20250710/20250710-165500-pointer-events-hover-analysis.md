> 으음.. 이방식을 생각한 이유가 모든 오버레이 규칙을 막고자 하는거였는데 pointer-events-none이 hover도 막아주나?

# pointer-events와 hover 이벤트 분석

## pointer-events: none의 동작

`pointer-events: none`은 **모든 마우스 이벤트를 비활성화**합니다:
- click
- mouseenter/mouseleave
- mouseover/mouseout
- mousemove
- hover (CSS :hover 포함)
- cursor 변경

따라서 현재 구현의 딜레마가 발생합니다.

## 현재 구현의 문제점

```typescript
// EditOverlay에서
function handleOverlayMouseMove(event: MouseEvent) {
  overlayElement.style.pointerEvents = 'none';  // 일시적으로 비활성화
  const elements = document.elementsFromPoint(clientX, clientY);
  overlayElement.style.pointerEvents = 'auto';   // 다시 활성화
}
```

이 방식의 문제:
1. 매 mousemove마다 pointer-events를 토글해야 함
2. 성능 오버헤드
3. 깜빡임이나 타이밍 이슈 가능성

## 대안 솔루션

### 1. 이벤트 위임 (Event Delegation) 활용

컨테이너 레벨에서 이벤트를 처리하고, event.target을 통해 실제 요소 파악:

```typescript
// HtmlEditor 컨테이너에서 직접 처리
containerRef.addEventListener('mouseover', (e) => {
  if (e.target.hasAttribute('data-editable')) {
    // hover 효과 적용
  }
});
```

**장점:**
- 오버레이 없이 직접적인 이벤트 처리
- 성능 우수
- 구조가 단순

**단점:**
- 다른 요소들의 이벤트와 충돌 가능성
- 복잡한 중첩 구조에서 처리 어려움

### 2. CSS로만 hover 효과 처리

```css
[data-editable="text"]:hover {
  text-decoration: underline;
  text-decoration-color: rgba(34, 197, 94, 0.6);
  text-decoration-thickness: 2px;
  text-underline-offset: 2px;
}
```

**장점:**
- 가장 간단하고 성능 좋음
- 오버레이 불필요

**단점:**
- JavaScript로 동적 제어 어려움
- 조건부 hover 효과 구현 복잡

### 3. 하이브리드 접근

- **Hover**: CSS로 처리
- **Click**: 오버레이의 특정 영역만 활성화

```css
.edit-overlay {
  pointer-events: none;  /* 기본적으로 비활성화 */
}

.edit-overlay.click-mode {
  pointer-events: auto;  /* 클릭 모드에서만 활성화 */
}

/* 텍스트 hover는 CSS로 */
[data-editable="text"]:hover {
  text-decoration: underline;
}
```

### 4. 가상 히트 영역 (Virtual Hit Areas)

마우스 위치를 기반으로 가상의 히트 영역을 계산:

```typescript
class HitAreaManager {
  private hitAreas: Map<string, DOMRect> = new Map();
  
  updateHitAreas() {
    document.querySelectorAll('[data-editable]').forEach(el => {
      this.hitAreas.set(el.id, el.getBoundingClientRect());
    });
  }
  
  findElementAt(x: number, y: number): Element | null {
    for (const [id, rect] of this.hitAreas) {
      if (x >= rect.left && x <= rect.right && 
          y >= rect.top && y <= rect.bottom) {
        return document.getElementById(id);
      }
    }
    return null;
  }
}
```

## 추천 방향

**CSS 기반 hover + 개선된 클릭 감지**의 조합을 추천합니다:

1. Hover 효과는 순수 CSS로 처리
2. 클릭은 텍스트 요소에 투명한 자식 요소 추가하여 처리
3. 오버레이는 특수한 경우(드래그 선택 등)에만 사용

이렇게 하면:
- 오버레이로 인한 복잡성 제거
- 자연스러운 hover 효과
- 정확한 클릭 영역

구현이 더 단순하고 성능도 좋아집니다.