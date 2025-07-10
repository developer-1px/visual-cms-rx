import { action } from '../../base/svelte-rx/svelte-rx.svelte';
import type { SelectionPayload, ResizePayload } from '../../entities/selection/types';

// 선택 관련 액션들
export const _선택하기 = action<SelectionPayload>('selection.선택하기');
export const _선택해제하기 = action<void>('selection.선택해제하기');
export const _크기변경하기 = action<ResizePayload>('selection.크기변경하기');
export const _컨텐츠변경하기 = action<{ id: string; rect: DOMRect }>('selection.컨텐츠변경하기');