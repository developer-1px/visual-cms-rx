import { stateChange$, getCurrentState } from './svelte-rx.svelte';

/**
 * Computed store: 다른 store의 값에 기반한 파생 상태를 생성
 * @param targetPath - 계산된 값을 저장할 경로
 * @param dependencies - 의존하는 store 경로들
 * @param computeFn - 계산 함수
 * @returns getter 함수
 */
export function computed<T>(
  targetPath: string,
  dependencies: string[],
  computeFn: (...values: unknown[]) => T
): () => T {
  // 초기값 계산
  const initialValues = dependencies.map(dep => getCurrentState(dep));
  const initialValue = computeFn(...initialValues);
  
  let value = $state<T>(initialValue);
  
  // 의존하는 store들의 변경 감지
  $effect(() => {
    const unsubscribe = stateChange$.subscribe(change => {
      // 의존하는 경로가 변경되었는지 확인
      if (dependencies.some(dep => dep.startsWith(change.path) || change.path.startsWith(dep))) {
        // 현재 값들을 가져와서 다시 계산
        const currentValues = dependencies.map(dep => getCurrentState(dep));
        const newValue = computeFn(...currentValues);
        
        if (newValue !== value) {
          value = newValue;
          console.log(`[computed: ${targetPath}]:`, value);
        }
      }
    });
    
    return () => unsubscribe.unsubscribe();
  });
  
  return () => value;
}

/**
 * 단순 computed: 단일 store 값에 기반한 파생 상태
 * @param dependency - 의존하는 store 경로
 * @param computeFn - 계산 함수
 * @returns getter 함수
 */
export function derive<S, T>(
  dependency: string,
  computeFn: (value: S) => T
): () => T {
  const initialValue = computeFn(getCurrentState(dependency));
  let value = $state<T>(initialValue);
  
  $effect(() => {
    const unsubscribe = stateChange$.subscribe(change => {
      if (change.path === dependency) {
        const newValue = computeFn(change.value);
        if (newValue !== value) {
          value = newValue;
        }
      }
    });
    
    return () => unsubscribe.unsubscribe();
  });
  
  return () => value;
}