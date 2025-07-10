// on.combine 타입 추론 테스트
import { storePath } from '../../entities/storePath';
import type { StoreSchema } from '../../entities/storePath';
import { reducer } from './svelte-rx.svelte';

// 테스트를 위한 더미 reducer
const testReducer = reducer('test.value', null as string | null, on => {
  // 단일 경로
  on(storePath.selection.selectedId, (selectedId) => {
    // selectedId 타입 확인
    type T1 = typeof selectedId; // string | null이어야 함
    return selectedId;
  });
  
  // combine 사용
  on.combine(
    storePath.selection.selectedId,
    storePath.editor.document.nodes,
    (selectedId, nodes) => {
      // 타입 확인
      type T1 = typeof selectedId; // string | null이어야 함
      type T2 = typeof nodes; // Map<string, HtmlNode>이어야 함
      
      console.log('Types:', selectedId, nodes);
      return null;
    }
  );
});

// 타입 추출 테스트
type PathType1 = typeof storePath.selection.selectedId;
type PathType2 = typeof storePath.editor.document.nodes;

// ExtractPath 테스트
import type { ExtractPath, InferValueType } from './svelte-rx.svelte';
type ExtractedPath1 = ExtractPath<PathType1>;
type ExtractedPath2 = ExtractPath<PathType2>;

// InferValueType 테스트
type InferredType1 = InferValueType<StoreSchema, ExtractedPath1>;
type InferredType2 = InferValueType<StoreSchema, ExtractedPath2>;

export { T1, T2, InferredType1, InferredType2 };