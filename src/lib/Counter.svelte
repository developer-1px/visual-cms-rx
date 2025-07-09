<script lang="ts">
  import { dispatch } from './svelte-rx.svelte';
  import { _증가하기, _감소하기, _리셋하기 } from './actions/counterActions';
  import { useCounter, useCounterStep } from './counterStore';
  
  const count = $derived(useCounter());
  const step = $derived(useCounterStep());
</script>

<button onclick={() => dispatch(_증가하기(1))}>
  증가 +1
</button>

<div>카운트: {count}</div>
<div>총 액션 횟수: {step}</div>

<button onclick={() => dispatch(_감소하기(1))}>
  감소 -1
</button>

<button onclick={() => dispatch(_리셋하기())}>
  리셋
</button>

<style>
  button {
    margin: 0.5em;
  }
  
  div {
    margin: 1em 0;
    font-size: 1.2em;
  }
</style>