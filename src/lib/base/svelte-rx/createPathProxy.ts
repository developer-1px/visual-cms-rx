/**
 * Path Proxy 생성 유틸리티
 * 
 * 타입 안전한 경로를 생성하기 위한 프록시 팩토리
 * 점 표기법으로 스키마의 타입 구조를 탐색할 수 있게 해줍니다.
 * 
 * @example
 * const path = createPathProxy<MySchema>();
 * 
 * // reducer에서 사용 - 타입이 자동으로 추론됨
 * on(path.user.profile.name, (name) => console.log(name))
 * 
 * // 내부적으로 경로 문자열 변환 가능
 * path.user.profile.name.toString() // "user.profile.name"
 */

// Proxy를 위한 타입 - 재귀적으로 객체 구조 유지
export type PathProxy<T> = {
  [K in keyof T]: T[K] extends object ? PathProxy<T[K]> : T[K];
};

/**
 * 타입 안전한 경로 프록시를 생성합니다.
 * 
 * @param path - 현재까지의 경로 배열 (내부적으로 사용)
 * @returns 경로 프록시 객체
 */
export function createPathProxy<T>(path: string[] = []): PathProxy<T> {
  const pathString = path.join('.');
  
  return new Proxy({} as unknown as PathProxy<T>, {
    get(_, prop) {
      if (typeof prop === 'symbol') {
        if (prop === Symbol.toPrimitive) {
          return () => pathString;
        }
        return undefined;
      }
      
      // 경로 문자열을 반환하는 toString 메서드
      if (prop === 'toString') {
        return () => pathString;
      }
      
      // 중첩된 경로 생성
      const newPath = path.length === 0 ? [prop as string] : [...path, prop as string];
      return createPathProxy(newPath);
    }
  });
}