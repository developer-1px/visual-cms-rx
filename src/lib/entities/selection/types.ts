// 선택 관련 엔티티 타입들
export interface SelectionPayload {
  id: string;
  rect: DOMRect;
}

export interface ResizePayload {
  id: string;
  rect: DOMRect;
}

export interface SelectionState {
  selectedId: string | null;
  boundingRects: Record<string, DOMRect>;
  type: string | null; // computed: 현재 선택된 요소의 타입
}