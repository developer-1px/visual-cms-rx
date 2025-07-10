/**
 * Path Proxy 생성 유틸리티
 * 
 * 타입 안전한 경로 문자열을 생성하기 위한 프록시 팩토리
 * 점 표기법으로 객체 경로를 표현할 수 있게 해줍니다.
 * 
 * @example
 * const path = createPathProxy<MySchema>();
 * path.user.profile.name.toString() // "user.profile.name"
 */

// Proxy를 위한 타입
export type PathProxy<T> = {
  [K in keyof T]: T[K] extends object ? PathProxy<T[K]> : PathLeaf;
} & {
  toString(): string;
};

// 리프 노드를 위한 타입
interface PathLeaf {
  toString(): string;
}

/**
 * 타입 안전한 경로 프록시를 생성합니다.
 * 
 * @param path - 현재까지의 경로 배열 (내부적으로 사용)
 * @returns 경로 프록시 객체
 */
export function createPathProxy<T>(path: string[] = []): PathProxy<T> {
  return new Proxy({} as PathProxy<T>, {
    get(_, prop) {
      if (prop === 'toString' || prop === Symbol.toStringTag) {
        return () => path.join('.');
      }
      
      // Symbol이나 inspect 등 무시
      if (typeof prop === 'symbol') {
        return undefined;
      }
      
      const newPath = [...path, prop as string];
      return createPathProxy(newPath);
    }
  });
}