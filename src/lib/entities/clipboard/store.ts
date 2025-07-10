import { reducer } from '../../base/svelte-rx/svelte-rx.svelte';
import { _복사하기, _잘라내기 } from '../../actions/edit';
import { storePath } from '../storePath';

// 클립보드 상태 관리
export const useClipboard = reducer(storePath.clipboard, {
  type: null,
  content: null,
  nodeId: null
}, on => {
  on(_복사하기, (state, nodeId: string) => ({
    type: 'element',
    content: '',  // 실제 구현 시 선택된 요소의 HTML
    nodeId
  }))
  
  on(_잘라내기, (state, nodeId: string) => ({
    type: 'element', 
    content: '',  // 실제 구현 시 선택된 요소의 HTML
    nodeId
  }))
});