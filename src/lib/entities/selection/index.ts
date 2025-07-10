/**
 * # Selection 엔티티
 * 
 * UI에서 요소 선택과 관련된 데이터 모델과 상태를 관리합니다.
 * 
 * ## 📦 Exports (명시적 import 사용)
 * 
 * ### 스토어
 * ```typescript
 * import { useSelectedId, useBoundingRects } from '@/lib/entities/selection/store';
 * ```
 * 
 * ### 타입
 * ```typescript
 * import type { SelectionPayload, SelectionState } from '@/lib/entities/selection/types';
 * ```
 * 
 * ## ⚠️ 배럴 import 금지
 * ```typescript
 * // ❌ import { useSelectedId } from '@/lib/entities/selection';
 * // ✅ import { useSelectedId } from '@/lib/entities/selection/store';
 * ```
 */

// 배럴 export 금지