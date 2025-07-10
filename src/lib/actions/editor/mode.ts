import { action } from '../../base/svelte-rx/svelte-rx.svelte';
import type { EditorMode } from '../../entities/editor/modeStore';

// 에디터 모드 관련 액션들
export const _모드변경 = action<EditorMode>('editor.모드변경');
export const _편집모드켜기 = action('editor.편집모드켜기');
export const _보기모드켜기 = action('editor.보기모드켜기');
export const _선택모드켜기 = action('editor.선택모드켜기');

// 편집 모드 전환 (boolean 호환성을 위한 액션)
export const _편집모드전환 = action<boolean>('editor.편집모드전환');