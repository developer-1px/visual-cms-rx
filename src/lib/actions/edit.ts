import { action } from '../base/svelte-rx/svelte-rx.svelte';

// 편집 액션들
export const _삭제하기 = action('편집/삭제');
export const _잘라내기 = action('편집/잘라내기');
export const _복사하기 = action('편집/복사');
export const _붙여넣기 = action<{ content: string }>('편집/붙여넣기');
export const _되돌리기 = action('편집/되돌리기');
export const _다시하기 = action('편집/다시하기');