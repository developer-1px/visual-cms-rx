// 타입 디버깅
import { storePath } from '../../entities/storePath';
import type { StoreSchema } from '../../entities/storePath';

// PathProxy 타입 확인
type Path1 = typeof storePath.selection.selectedId;
type Path2 = typeof storePath.editor.document.nodes;

// toString() 호출 결과 확인
const path1String = storePath.selection.selectedId.toString();
const path2String = storePath.editor.document.nodes.toString();

console.log('Path1 string:', path1String); // "selection.selectedId"
console.log('Path2 string:', path2String); // "editor.document.nodes"

// ExtractPath 타입 수동 테스트
type ManualExtract1 = Path1 extends { toString(): infer S } ? S : 'no-toString';
type ManualExtract2 = Path2 extends { toString(): infer S } ? S : 'no-toString';

// ParsePath 수동 테스트
type ParseTest1 = 'selection.selectedId' extends `${infer Key}.${infer Rest}`
  ? Key extends keyof StoreSchema
    ? Rest extends keyof StoreSchema[Key]
      ? StoreSchema[Key][Rest]
      : 'rest-not-key'
    : 'key-not-in-schema'
  : 'no-dot';

type ParseTest2 = StoreSchema['selection']['selectedId']; // string | null
type ParseTest3 = StoreSchema['editor']['document']['nodes']; // Map<string, HtmlNode>

export { 
  Path1, Path2, 
  ManualExtract1, ManualExtract2,
  ParseTest1, ParseTest2, ParseTest3,
  path1String, path2String
};