/**
 * # Actions 레이어 구조
 * 
 * Actions는 애플리케이션의 모든 이벤트/액션을 정의합니다.
 * 
 * ## 🗂️ 폴더 구조
 * ```
 * actions/
 * ├── editor/
 * │   └── mode.ts         # _모드변경, _편집모드켜기 등
 * ├── selection/
 * │   └── index.ts        # _선택하기, _선택해제하기 등
 * └── index.ts            # (배럴 export 금지)
 * ```
 * 
 * ## 📦 주요 exports (명시적 import 사용)
 * 
 * ### Selection 액션
 * ```typescript
 * import { 
 *   _선택하기, 
 *   _선택해제하기, 
 *   _크기변경하기, 
 *   _컨텐츠변경하기 
 * } from '@/lib/actions/selection';
 * ```
 * 
 * ### Editor 모드 액션
 * ```typescript
 * import { 
 *   _모드변경, 
 *   _편집모드켜기, 
 *   _보기모드켜기,
 *   _선택모드켜기,
 *   _편집모드전환
 * } from '@/lib/actions/editor/mode';
 * ```
 * 
 * ## 📋 액션 네이밍 컨벤션
 * - 한글 액션명 사용 (언더스코어 prefix)
 * - 도메인.액션명 형식의 type
 * - 예: _선택하기 → 'selection.선택하기'
 * 
 * ## 💡 사용 예시
 * ```typescript
 * import { dispatch } from '@/lib/base/svelte-rx/svelte-rx.svelte';
 * import { _선택하기 } from '@/lib/actions/selection';
 * 
 * dispatch(_선택하기({ id: 'element-1', rect: domRect }));
 * ```
 * 
 * ## ⚠️ 중요: 배럴 import 금지
 * 
 * ❌ 잘못된 사용:
 * ```typescript
 * import { _선택하기 } from '@/lib/actions';
 * ```
 * 
 * ✅ 올바른 사용:
 * ```typescript
 * import { _선택하기 } from '@/lib/actions/selection';
 * ```
 */

// 이 파일에서는 어떤 것도 export하지 않습니다.
// 위의 문서를 참고하여 필요한 모듈을 직접 import하세요.