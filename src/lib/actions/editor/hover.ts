import { action } from '../../base/svelte-rx/svelte-rx.svelte';

export const _호버시작 = action<{nodeId: string}>('editor/_호버시작');
export const _호버종료 = action<void>('editor/_호버종료');