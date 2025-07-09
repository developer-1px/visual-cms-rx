import { action, dispatch, reducer } from './svelte-rx';
import { map } from 'rxjs';

export const _증가하기 = action<number>('_증가하기');
export const _감소하기 = action<number>('_감소하기');
export const _리셋하기 = action('_리셋하기');

export const counter$ = reducer('counter/value', 0, on => [
  on(_증가하기).pipe(
    map(amount => (state: number) => state + amount)
  ),
  on(_감소하기).pipe(
    map(amount => (state: number) => state - amount)
  ),
  on(_리셋하기).pipe(
    map(() => () => 0)
  )
]);

export const increment = (amount: number = 1) => dispatch(_증가하기(amount));
export const decrement = (amount: number = 1) => dispatch(_감소하기(amount));
export const reset = () => dispatch(_리셋하기());