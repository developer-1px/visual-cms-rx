import { reducer } from '../base/svelte-rx/svelte-rx.svelte';
import { storePath } from '../entities/storePath';

// Example 1: 이제 toString() 없이 PathProxy를 직접 사용 가능
export const useIsEditMode = reducer('editor.isEdit', false, on => {
  on(storePath.editor.mode, (mode) => mode === 'edit')
});

// Example 2: 여러 의존성을 가진 computed
export const useEditStatus = reducer('ui.editStatus', '', on => {
  on([storePath.editor.mode, storePath.selection.selectedId], (mode, selectedId) => {
    if (mode === 'edit' && selectedId) {
      return `Editing: ${selectedId}`;
    } else if (mode === 'select' && selectedId) {
      return `Selected: ${selectedId}`;
    }
    return 'No selection';
  })
});

// Example 3: 중첩된 PathProxy 사용
export const useDocumentInfo = reducer('ui.documentInfo', '', on => {
  on(storePath.editor.document.root, (root) => {
    if (root && root.type === 'element') {
      return `Document has ${root.children?.length || 0} children`;
    }
    return 'No document';
  })
});