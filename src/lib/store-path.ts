// 스토어 구조를 정의하는 인터페이스
export interface StoreSchema {
  counter: {
    value: number;
    step: number;
  };
  user: {
    name: string;
    email: string;
    preferences: {
      theme: 'light' | 'dark';
      language: string;
    };
  };
}

// Path를 타입으로 만드는 유틸리티
type PathsOf<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? PathsOf<T[K], `${Prefix}${K}.`> | `${Prefix}${K}`
          : `${Prefix}${K}`
        : never;
    }[keyof T]
  : never;

// Proxy를 위한 타입
type PathProxy<T> = {
  [K in keyof T]: T[K] extends object ? PathProxy<T[K]> : PathLeaf;
} & {
  toString(): string;
};

// 리프 노드를 위한 타입
interface PathLeaf {
  toString(): string;
}

// Proxy 생성 함수
function createPathProxy<T>(path: string[] = []): PathProxy<T> {
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

// 타입 안전한 path 생성자
export const storePath = createPathProxy<StoreSchema>();

// 사용 예시:
// storePath.counter.value.toString() === "counter.value"
// storePath.user.preferences.theme.toString() === "user.preferences.theme"

// 타입 체크용 (실제로는 사용하지 않음)
export type StorePaths = PathsOf<StoreSchema>;