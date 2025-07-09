import { action } from '../svelte-rx.svelte';

export const _증가하기 = action<number>('_증가하기');
export const _감소하기 = action<number>('_감소하기');
export const _리셋하기 = action<void>('_리셋하기');