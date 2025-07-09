/**
 * Viewport 기준 좌표를 컨테이너 기준 상대 좌표로 변환
 * @param elementRect - 요소의 viewport 기준 좌표 (getBoundingClientRect() 결과)
 * @param containerRect - 컨테이너의 viewport 기준 좌표
 * @returns 컨테이너 기준 상대 좌표
 */
export function toRelativeCoordinates(
  elementRect: DOMRect,
  containerRect: DOMRect
): DOMRect {
  return {
    left: elementRect.left - containerRect.left,
    top: elementRect.top - containerRect.top,
    right: elementRect.right - containerRect.left,
    bottom: elementRect.bottom - containerRect.top,
    x: elementRect.x - containerRect.left,
    y: elementRect.y - containerRect.top,
    width: elementRect.width,
    height: elementRect.height,
    toJSON: elementRect.toJSON
  } as DOMRect;
}

/**
 * 간단한 좌표 객체로 변환 (hover preview 등에 사용)
 */
export function toSimpleRect(
  elementRect: DOMRect,
  containerRect: DOMRect
): { left: number; top: number; width: number; height: number } {
  return {
    left: elementRect.left - containerRect.left,
    top: elementRect.top - containerRect.top,
    width: elementRect.width,
    height: elementRect.height
  };
}