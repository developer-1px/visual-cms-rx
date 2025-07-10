/**
 * Improved Path Proxy with literal string types
 * 
 * This version returns branded strings that carry their literal type,
 * eliminating the need for `as const` in usage.
 */

// Brand for path strings
declare const PathBrand: unique symbol;
type PathString<T extends string> = T & { [PathBrand]: true };

// Recursive path type that builds literal string types
export type PathProxy<T, Path extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? PathProxy<T[K], Path extends "" ? K & string : `${Path}.${K & string}`>
    : PathString<Path extends "" ? K & string : `${Path}.${K & string}`>;
};

/**
 * Creates a path proxy that returns literal string types
 * 
 * @example
 * const path = createPathProxy<MySchema>();
 * const userPath = path.user.name; // Type: PathString<"user.name">
 * // No need for toString() or as const!
 */
export function createPathProxy<T>(basePath: string = ""): PathProxy<T> {
  return new Proxy({} as any, {
    get(_, prop: string | symbol): any {
      if (typeof prop === 'symbol') return undefined;
      
      const fullPath = basePath ? `${basePath}.${prop}` : prop;
      
      // Return a proxy for objects, or the branded string for leaves
      return new Proxy(fullPath as PathString<any>, {
        get(target, nestedProp) {
          if (nestedProp === Symbol.toPrimitive || nestedProp === 'valueOf') {
            return () => target;
          }
          if (typeof nestedProp === 'symbol') return undefined;
          
          // Continue building the path
          return createPathProxy(`${target}.${nestedProp as string}`);
        }
      });
    }
  });
}

// Type helper to extract literal string from PathString
export type ExtractLiteral<T> = T extends PathString<infer L> ? L : T extends string ? T : never;