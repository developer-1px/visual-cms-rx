import { reducer } from './svelte-rx.svelte';
import { _증가하기, _감소하기, _리셋하기 } from './actions/counterActions';
import { storePath } from './store-path';

// Store 정의 및 hook 반환
export const useCounter = reducer(storePath.counter.value, 0, on => {
  on(_증가하기, (state, amount) => state + amount)
  on(_감소하기, (state, amount) => state - amount)
  on(_리셋하기, () => 0)
})


// Step reducer - 모든 액션에 대해 1씩 증가
export const useCounterStep = reducer(storePath.counter.step, 0, on => {
  // 모든 액션을 병합하여 카운트
  on.merge(_증가하기, _감소하기, state => state + 1)
  on(_리셋하기, () => 0)
});