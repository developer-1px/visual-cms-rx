import hotkeys from 'hotkeys-js';
import { dispatch, getCurrentState } from '../svelte-rx/svelte-rx.svelte';
import { _선택해제하기 } from '../../actions/selection';
import { _삭제하기, _잘라내기, _복사하기, _붙여넣기, _되돌리기, _다시하기 } from '../../actions/edit';

export function setupHotkeys() {
  // ESC 키: 선택 해제
  hotkeys('escape', (event) => {
    event.preventDefault();
    dispatch(_선택해제하기());
  });
  
  // Delete/Backspace: 삭제
  hotkeys('delete,backspace', (event) => {
    const selectedId = getCurrentState('selection.selectedId');
    if (selectedId) {
      event.preventDefault();
      dispatch(_삭제하기());
    }
  });
  
  // Cmd/Ctrl+X: 잘라내기
  hotkeys('cmd+x,ctrl+x', (event) => {
    const selectedId = getCurrentState('selection.selectedId');
    if (selectedId) {
      event.preventDefault();
      dispatch(_잘라내기(selectedId));
    }
  });
  
  // Cmd/Ctrl+C: 복사하기
  hotkeys('cmd+c,ctrl+c', (event) => {
    const selectedId = getCurrentState('selection.selectedId');
    if (selectedId) {
      event.preventDefault();
      dispatch(_복사하기(selectedId));
    }
  });
  
  // Cmd/Ctrl+V: 붙여넣기
  hotkeys('cmd+v,ctrl+v', async (event) => {
    event.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      dispatch(_붙여넣기({ content: text }));
    } catch (err) {
      console.error('클립보드 읽기 실패:', err);
    }
  });
  
  // Cmd/Ctrl+Z: 되돌리기
  hotkeys('cmd+z,ctrl+z', (event) => {
    event.preventDefault();
    dispatch(_되돌리기());
  });
  
  // Cmd/Ctrl+Shift+Z, Cmd/Ctrl+Y: 다시하기
  hotkeys('cmd+shift+z,ctrl+shift+z,cmd+y,ctrl+y', (event) => {
    event.preventDefault();
    dispatch(_다시하기());
  });
}

export function cleanupHotkeys() {
  hotkeys.unbind('escape');
  hotkeys.unbind('delete,backspace');
  hotkeys.unbind('cmd+x,ctrl+x');
  hotkeys.unbind('cmd+c,ctrl+c');
  hotkeys.unbind('cmd+v,ctrl+v');
  hotkeys.unbind('cmd+z,ctrl+z');
  hotkeys.unbind('cmd+shift+z,ctrl+shift+z,cmd+y,ctrl+y');
}