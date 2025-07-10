/**
 * Literal Path Proxy - 실제 문자열을 반환하는 개선된 버전
 * 
 * PathProxy가 리프 노드에서는 실제 문자열을 반환하고,
 * 중간 노드에서는 프록시를 반환하는 하이브리드 구현
 */

// 문자열이면서 프록시 기능도 가지는 특수 타입
type StringProxy = string & {
  [K: string]: any;
};

// 개선된 PathProxy 타입
export type LiteralPathProxy<T, Path extends string = ""> = {
  [K in keyof T]: T[K] extends object 
    ? LiteralPathProxy<T[K], Path extends "" ? K & string : `${Path}.${K & string}`>
    : Path extends "" ? K & string : `${Path}.${K & string}`;
};

/**
 * 리터럴 문자열을 반환하는 PathProxy 생성
 * 
 * @example
 * const path = createLiteralPathProxy<MySchema>();
 * const selectedId = path.selection.selectedId; // "selection.selectedId" (실제 문자열!)
 * const nodes = path.editor.document.nodes; // "editor.document.nodes"
 * 
 * // as const 없이 배열 사용 가능
 * const paths = [path.selection.selectedId, path.editor.document.nodes];
 */
export function createLiteralPathProxy<T>(basePath: string = ""): LiteralPathProxy<T> {
  // 빈 경로인 경우 순수 프록시 반환
  if (!basePath) {
    return new Proxy({} as any, {
      get(_, prop) {
        if (typeof prop === 'symbol') return undefined;
        return createLiteralPathProxy(prop as string);
      }
    });
  }
  
  // 기본 문자열 객체 생성 (String 객체가 아닌 primitive string을 확장)
  const stringValue = basePath;
  
  // Proxy로 문자열을 감싸서 프로퍼티 접근 가능하게 함
  return new Proxy(stringValue as any, {
    get(target, prop) {
      // 문자열 메서드들은 그대로 전달
      if (typeof prop === 'string' && prop in String.prototype) {
        return String.prototype[prop as keyof typeof String.prototype];
      }
      
      // Symbol 처리
      if (prop === Symbol.toPrimitive || prop === Symbol.toStringTag) {
        return () => stringValue;
      }
      if (typeof prop === 'symbol') {
        return undefined;
      }
      
      // 중첩된 경로 생성
      const newPath = `${basePath}.${prop as string}`;
      return createLiteralPathProxy(newPath);
    },
    
    // 문자열처럼 동작하도록 설정
    has() {
      return false;
    },
    
    ownKeys() {
      return [];
    },
    
    getOwnPropertyDescriptor() {
      return undefined;
    }
  }) as any;
}