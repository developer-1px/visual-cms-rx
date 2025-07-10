/**
 * @deprecated
 * store-path.ts는 더 이상 사용되지 않습니다.
 * 대신 다음을 사용하세요:
 * - storePath 인스턴스: import { storePath } from '@/lib/entities/storePath'
 * - createPathProxy API: import { createPathProxy } from '@/lib/base/svelte-rx/createPathProxy'
 */

// 호환성을 위한 재내보내기
export { storePath } from '../../entities/storePath';
export { createPathProxy } from './createPathProxy';
export type { PathProxy } from './createPathProxy';

console.warn(
  '[svelte-rx] store-path.ts is deprecated. ' +
  'Use @/lib/entities/storePath for storePath instance ' +
  'or @/lib/base/svelte-rx/createPathProxy for the API.'
);