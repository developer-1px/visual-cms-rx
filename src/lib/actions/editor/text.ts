import { action } from '../../base/svelte-rx/svelte-rx.svelte';

export const 텍스트업데이트 = action<{nodeId: string; text: string}>('editor/텍스트업데이트');