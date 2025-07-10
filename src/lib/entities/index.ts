/**
 * # Entities 레이어 구조
 * 
 * Entities는 애플리케이션의 순수 데이터 모델과 상태를 관리합니다.
 * 
 * ## 🗂️ 폴더 구조
 * ```
 * entities/
 * ├── editor/              # 에디터 관련 데이터
 * │   ├── types.ts        # HtmlNode, TextSelection 타입
 * │   ├── modeStore.ts    # 에디터 모드 상태 (view/select/edit)
 * │   └── index.ts        # (배럴 export 금지)
 * ├── selection/          # 선택 영역 관련 데이터  
 * │   ├── types.ts        # SelectionPayload, SelectionState 타입
 * │   ├── store.ts        # useSelectedId, useBoundingRects
 * │   └── index.ts        # (배럴 export 금지)
 * └── storePath.ts        # StoreSchema 정의, storePath 인스턴스
 * ```
 * 
 * ## 📦 주요 exports (명시적 import 사용)
 * 
 * ### Selection 관련
 * ```typescript
 * import { useSelectedId, useBoundingRects } from '@/lib/entities/selection/store';
 * import type { SelectionPayload } from '@/lib/entities/selection/types';
 * ```
 * 
 * ### Editor 관련
 * ```typescript
 * import { useEditorMode } from '@/lib/entities/editor/modeStore';
 * import type { HtmlNode, TextSelection } from '@/lib/entities/editor/types';
 * import type { EditorMode } from '@/lib/entities/editor/modeStore';
 * ```
 * 
 * ### Store Schema
 * ```typescript
 * import { storePath } from '@/lib/entities/storePath';
 * import type { StoreSchema, EditorState } from '@/lib/entities/storePath';
 * ```
 * 
 * ## ⚠️ 중요: 배럴 import 금지
 * 
 * ❌ 잘못된 사용:
 * ```typescript
 * import { useSelectedId } from '@/lib/entities';
 * ```
 * 
 * ✅ 올바른 사용:
 * ```typescript
 * import { useSelectedId } from '@/lib/entities/selection/store';
 * ```
 * 
 * ## 💡 이유
 * - Unused imports 추적 용이
 * - Tree shaking 최적화
 * - 순환 의존성 방지
 * - IDE 성능 향상
 */

// 이 파일에서는 어떤 것도 export하지 않습니다.
// 위의 문서를 참고하여 필요한 모듈을 직접 import하세요.