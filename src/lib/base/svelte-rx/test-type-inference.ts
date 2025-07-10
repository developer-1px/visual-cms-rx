// 타입 추론 테스트 파일
import { createPathProxy } from './createPathProxy';
import { storePath } from '../../entities/storePath';

// PathProxy가 실제로 어떤 타입을 반환하는지 확인
const path1 = storePath.selection.selectedId;
const path2 = storePath.editor.document.nodes;

// 타입 확인
type Path1Type = typeof path1; // 어떤 타입인지 확인
type Path2Type = typeof path2; // 어떤 타입인지 확인

// 배열로 사용했을 때
const paths = [path1, path2];
type PathsType = typeof paths; // 배열 타입 확인

// as const 사용
const pathsConst = [path1, path2] as const;
type PathsConstType = typeof pathsConst; // const 배열 타입 확인

// 직접 문자열 사용
const stringPaths = ['selection.selectedId', 'editor.document.nodes'];
type StringPathsType = typeof stringPaths;

// 테스트용 타입 추출
type ExtractTest1 = Path1Type extends { toString(): infer S } ? S : 'no-tostring';
type ExtractTest2 = Path1Type extends string ? 'is-string' : 'not-string';

// Export to prevent unused errors
export { Path1Type, Path2Type, PathsType, PathsConstType, StringPathsType, ExtractTest1, ExtractTest2 };