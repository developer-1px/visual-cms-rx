/**
 * 스마트 요소 선택 유틸리티
 * 현재 선택된 타입과 같은 타입의 요소를 우선적으로 선택하는 로직
 */

export interface SelectableElement extends HTMLElement {
  getAttribute(qualifiedName: 'data-editable'): string | null;
  getAttribute(qualifiedName: 'data-node-id'): string | null;
}


/**
 * 스마트 선택 정책을 적용하여 최적의 요소를 선택
 * @param candidates - 선택 가능한 요소들의 배열
 * @param currentSelectedId - 현재 선택된 요소의 ID
 * @returns 선택된 요소 또는 undefined
 */
export function selectElementWithSmartPolicy(
  candidates: SelectableElement[],
  currentSelectedId: string | null
): SelectableElement | undefined {
  if (candidates.length === 0) return undefined;

  const [firstCandidate] = candidates;
  
  // 가장 가까운 요소가 현재 선택된 요소면 그대로 반환
  if (firstCandidate.getAttribute('data-node-id') === currentSelectedId) {
    return firstCandidate;
  }
  
  // 현재 선택된 요소의 타입 가져오기
  const currentElement = currentSelectedId ? 
    document.querySelector(`[data-node-id="${currentSelectedId}"]`) as SelectableElement : 
    null;
  const currentType = currentElement?.getAttribute('data-editable');
  
  // 현재 선택된 요소를 제외한 후보들
  const filtered = candidates.filter(el => 
    el.getAttribute('data-node-id') !== currentSelectedId
  );
  
  if (filtered.length === 0) return undefined;

  // 현재 타입과 같은 타입이 있으면 우선 선택
  if (currentType) {
    const sameType = filtered.find(el => el.getAttribute('data-editable') === currentType);
    if (sameType) return sameType;
  }

  // 없으면 가장 가까운 요소
  return filtered[0];
}

/**
 * 요소들에서 선택 가능한 요소들만 필터링
 * @param elements - 모든 요소들의 배열
 * @returns 선택 가능한 요소들의 배열
 */
export function filterSelectableElements(elements: Element[]): SelectableElement[] {
  return elements.filter(el => 
    el instanceof HTMLElement && el.hasAttribute('data-editable')
  ) as SelectableElement[];
}

