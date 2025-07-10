/**
 * Template Literal Path System
 * 
 * Uses TypeScript's template literal types for path specification
 * with compile-time validation and excellent type inference.
 */

import type { StoreSchema } from '../../entities/storePath';

// Generate all valid paths from a schema
type PathsOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? PathsOf<T[K], `${Prefix}${Prefix extends "" ? "" : "."}${K}`> | `${Prefix}${Prefix extends "" ? "" : "."}${K}`
          : `${Prefix}${Prefix extends "" ? "" : "."}${K}`
        : never;
    }[keyof T]
  : never;

// Get value type at a specific path
type ValueAt<T, Path extends string> = Path extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? ValueAt<T[Key], Rest>
    : never
  : Path extends keyof T
    ? T[Path]
    : never;

// Path function with template literal type checking
export function path<TPath extends PathsOf<StoreSchema>>(
  template: TPath
): TPath {
  return template;
}

// Multi-path dependency with type inference
export function paths<const TPaths extends readonly PathsOf<StoreSchema>[]>(
  ...pathList: TPaths
): {
  map<TResult>(
    mapper: (...values: {
      [K in keyof TPaths]: ValueAt<StoreSchema, TPaths[K]>
    }) => TResult
  ): {
    paths: TPaths;
    mapper: typeof mapper;
  };
} {
  return {
    map(mapper) {
      return { paths: pathList, mapper };
    }
  };
}

// Tagged template literal version for even better syntax
export function p<const TPath extends PathsOf<StoreSchema>>(
  strings: TemplateStringsArray,
  ...values: any[]
): TPath {
  return strings.join('') as TPath;
}

/**
 * Examples:
 * 
 * // Single path
 * const selectedPath = path('selection.selectedId');
 * 
 * // Multiple paths with inference
 * const result = paths('selection.selectedId', 'editor.document.nodes')
 *   .map((selectedId, nodes) => {
 *     // Types are inferred!
 *     return nodes?.get(selectedId);
 *   });
 * 
 * // Tagged template literal
 * const userPath = p`user.profile.name`;
 */