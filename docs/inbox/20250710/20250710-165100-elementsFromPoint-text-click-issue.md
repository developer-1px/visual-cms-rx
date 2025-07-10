> 대화+보고서 타임. elementsFromPoint로 위치를 찾으니까 BoundingRect에는 포함이 되는 위치인데 글자라서 구멍이 뚫려서 클릭이 안되는게 굉장히 불편하네

# elementsFromPoint 텍스트 클릭 이슈 분석

## 문제 상황

현재 `elementsFromPoint`를 사용하여 마우스 위치의 요소를 찾고 있는데, 텍스트 요소의 경우 다음과 같은 문제가 발생합니다:

1. **글자 사이의 빈 공간**: 단어 내 글자 사이의 미세한 공백에서 클릭이 안됨
2. **글자 내부의 구멍**: 'o', 'a', 'e' 등 내부가 비어있는 글자에서 클릭이 안됨
3. **줄 간격**: 텍스트 라인 사이의 빈 공간에서 클릭이 안됨

이는 `elementsFromPoint`가 실제 렌더링된 픽셀이 있는 위치에서만 요소를 감지하기 때문입니다.

## 현재 구현의 한계

```typescript
// 현재 코드
const elements = document.elementsFromPoint(clientX, clientY);
const selectable = elements.find(el => 
  el instanceof HTMLElement && el.hasAttribute('data-editable')
);
```

이 방식은 정확한 픽셀 위치에서만 작동하므로 사용자 경험이 좋지 않습니다.

## 해결 방안

### 1. 투명한 오버레이 요소 사용 (추천)

각 텍스트 요소 위에 투명한 div를 배치하여 전체 영역을 클릭 가능하게 만드는 방법입니다.

**장점:**
- 가장 확실한 해결책
- 텍스트의 전체 BoundingRect 영역에서 클릭 가능
- 구현이 직관적

**단점:**
- 추가 DOM 요소가 필요
- 위치 동기화 필요

### 2. 클릭 위치 주변 탐색

클릭한 지점 주변의 여러 포인트를 탐색하는 방법입니다.

```typescript
// 예시 구현
function findNearbyElement(x: number, y: number, radius = 5) {
  const offsets = [
    [0, 0], [0, -radius], [radius, 0], [0, radius], [-radius, 0],
    [radius, -radius], [radius, radius], [-radius, radius], [-radius, -radius]
  ];
  
  for (const [dx, dy] of offsets) {
    const elements = document.elementsFromPoint(x + dx, y + dy);
    const found = elements.find(el => 
      el instanceof HTMLElement && el.hasAttribute('data-editable')
    );
    if (found) return found;
  }
  return null;
}
```

**장점:**
- DOM 구조 변경 없음
- 구현이 간단

**단점:**
- 여전히 완벽하지 않음
- 성능 오버헤드

### 3. document.elementFromPoint + getBoundingClientRect 조합

모든 편집 가능한 요소의 위치를 미리 계산하고, 클릭 위치가 어느 요소의 범위에 속하는지 확인하는 방법입니다.

```typescript
// 예시 구현
function findElementAtPoint(x: number, y: number) {
  const editables = document.querySelectorAll('[data-editable]');
  
  for (const element of editables) {
    const rect = element.getBoundingClientRect();
    if (x >= rect.left && x <= rect.right && 
        y >= rect.top && y <= rect.bottom) {
      return element;
    }
  }
  return null;
}
```

**장점:**
- 정확한 영역 감지
- DOM 구조 변경 없음

**단점:**
- 중첩된 요소 처리가 복잡
- z-index 고려 필요

### 4. CSS pointer-events 활용

텍스트 요소를 감싸는 컨테이너에 `pointer-events: all`을 설정하고, 실제 클릭 이벤트를 처리하는 방법입니다.

**장점:**
- 네이티브 브라우저 동작 활용
- 추가 계산 불필요

**단점:**
- 기존 구조 변경 필요
- 이벤트 버블링 처리 필요

## 추천 해결책

**단기적으로는 방안 2(클릭 위치 주변 탐색)**를 구현하여 즉시 사용성을 개선하고, **장기적으로는 방안 1(투명한 오버레이)**를 구현하는 것을 추천합니다.

방안 1은 가장 확실하고 사용자 친화적이지만, 현재 구조를 변경해야 하므로 단계적 접근이 필요합니다.

## 구현 우선순위

1. **즉시 적용**: 클릭 위치 주변 탐색 구현
2. **다음 단계**: HtmlRenderer에서 텍스트 요소에 대한 투명 오버레이 추가
3. **최적화**: 성능 및 사용성 테스트 후 최적의 방법 선택

이렇게 접근하면 사용자 경험을 빠르게 개선하면서도 장기적으로 더 나은 해결책을 준비할 수 있습니다.