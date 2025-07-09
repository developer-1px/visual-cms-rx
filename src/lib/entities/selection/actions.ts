import { action } from '../../base/svelte-rx/svelte-rx.svelte';
import type { SelectionPayload, ResizePayload } from './types';

export const _선택하기 = action<SelectionPayload>('_선택하기');
export const _선택해제하기 = action<void>('_선택해제하기');
export const _크기변경하기 = action<ResizePayload>('_크기변경하기');
export const _컨텐츠변경하기 = action<{ id: string; rect: DOMRect }>('_컨텐츠변경하기');