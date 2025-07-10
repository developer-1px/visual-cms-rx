import { reducer } from '../../base/svelte-rx/svelte-rx.svelte';
import { _되돌리기, _다시하기 } from '../../actions/edit';
import { storePath } from '../storePath';

// 히스토리 상태 관리
export const useHistory = reducer(storePath.editor.history, {
  past: [],
  future: []
}, on => {
  on(_되돌리기, (state) => {
    if (state.past.length === 0) return state;
    
    // 실제 구현에서는 past에서 상태를 복원하는 로직 필요
    return state;
  })
  
  on(_다시하기, (state) => {
    if (state.future.length === 0) return state;
    
    // 실제 구현에서는 future에서 상태를 복원하는 로직 필요
    return state;
  })
});