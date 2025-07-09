import { action, reducer } from './base/svelte-rx/svelte-rx.svelte';

// 액션 정의
export const _편집모드전환 = action<boolean>('편집모드전환');
export const _편집모드켜기 = action('편집모드켜기');
export const _편집모드끄기 = action('편집모드끄기');

// 편집 모드 상태 관리 (기본값: true)
export const useEditMode = reducer('editMode.active', true, on => {
  on(_편집모드전환, (_, active) => active);
  on(_편집모드켜기, () => true);
  on(_편집모드끄기, () => false);
});