/**
 * Dependency Builder Pattern for Better Type Inference
 * 
 * Provides a fluent API for building multi-dependency computed stores
 * with excellent type inference.
 */

import type { StoreSchema } from '../../entities/storePath';
import type { ParsePath } from './svelte-rx.svelte';

// Helper to extract path string from various inputs
type ExtractPathString<T> = T extends { toString(): infer S } ? S : T extends string ? T : never;

// Builder class with accumulating type information
export class DependencyBuilder<TPaths extends readonly any[] = readonly []> {
  constructor(private paths: TPaths) {}
  
  /**
   * Add a dependency to the builder
   */
  add<TPath>(path: TPath): DependencyBuilder<readonly [...TPaths, TPath]> {
    return new DependencyBuilder([...this.paths, path] as const);
  }
  
  /**
   * Map the dependencies to a result
   */
  map<TResult>(
    mapper: (...args: {
      [K in keyof TPaths]: ParsePath<ExtractPathString<TPaths[K]>, StoreSchema>
    }) => TResult
  ): { paths: TPaths; mapper: typeof mapper } {
    return { paths: this.paths, mapper };
  }
}

/**
 * Create a dependency builder
 * 
 * @example
 * deps()
 *   .add(storePath.selection.selectedId)
 *   .add(storePath.editor.document.nodes)
 *   .map((selectedId, nodes) => {
 *     // selectedId and nodes are fully typed!
 *     return selectedId && nodes ? nodes.get(selectedId) : null;
 *   })
 */
export function deps(): DependencyBuilder<readonly []> {
  return new DependencyBuilder([]);
}

// Alternative syntax using variadic function
export function deps2<TPaths extends readonly any[]>(
  ...paths: TPaths
): {
  map<TResult>(
    mapper: (...args: {
      [K in keyof TPaths]: ParsePath<ExtractPathString<TPaths[K]>, StoreSchema>
    }) => TResult
  ): { paths: TPaths; mapper: typeof mapper };
} {
  return {
    map(mapper) {
      return { paths, mapper };
    }
  };
}