import { reducer } from '../../base/svelte-rx/svelte-rx.svelte';
import { storePath } from '../storePath';
import { _호버시작, _호버종료 } from '../../actions/editor/hover';

// nodeId에서 nodeType을 가져오는 헬퍼 함수
function getNodeTypeFromId(nodeId: string): string | null {
  // DOM에서 요소를 찾아서 data-editable 속성을 확인
  const element = document.querySelector(`[data-node-id="${nodeId}"]`);
  return element?.getAttribute('data-editable') || null;
}

// Hover 상태 관리
export const useHoveredNodeId = reducer(
  storePath.editor.hoveredNodeId,
  null as string | null,
  on => {
    on(_호버시작, (_, { nodeId }) => nodeId);
    on(_호버종료, () => null);
  }
);

export const useHoveredNodeType = reducer(
  storePath.editor.hoveredNodeType,
  null as string | null,
  on => {
    on(_호버시작, (_, { nodeId }) => getNodeTypeFromId(nodeId));
    on(_호버종료, () => null);
  }
);