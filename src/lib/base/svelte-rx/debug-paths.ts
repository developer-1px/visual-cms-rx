// 현재 PathProxy 구현 디버깅
import { storePath } from '../../entities/storePath';

const path1 = storePath.selection.selectedId;
const path2 = storePath.editor.document.nodes;

console.log('=== PathProxy Debug ===');
console.log('path1:', path1);
console.log('path1 type:', typeof path1);
console.log('path1.toString():', path1.toString());
console.log('path1 is string?:', typeof path1 === 'string');

console.log('\npath2:', path2);
console.log('path2 type:', typeof path2);
console.log('path2.toString():', path2.toString());

// 배열 테스트
const arr = [path1, path2];
console.log('\nArray:', arr);
console.log('Array element types:', arr.map(p => typeof p));

// 개선된 버전 테스트를 위한 헬퍼
export function testImprovedPaths() {
  // 실제로 문자열을 반환하는지 확인
  const isString1 = typeof path1 === 'string';
  const isString2 = typeof path2 === 'string';
  
  console.log('\n=== Improved Path Test ===');
  console.log('path1 is string:', isString1);
  console.log('path2 is string:', isString2);
  
  // 만약 문자열이라면 바로 사용 가능
  if (isString1 && isString2) {
    const paths = [path1, path2]; // as const 없이도 작동해야 함
    console.log('Paths array without as const:', paths);
  }
}