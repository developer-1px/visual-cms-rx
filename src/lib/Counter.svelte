<script lang="ts">
  import { counter$, increment, decrement, reset } from './counterStore';
  
  let count = $state(0);
  
  $effect(() => {
    const subscription = counter$.subscribe(value => {
      count = value;
    });
    
    return () => subscription.unsubscribe();
  });
</script>

<button onclick={() => increment(1)}>
  증가 +1
</button>

<div>카운트: {count}</div>

<button onclick={() => decrement(1)}>
  감소 -1
</button>

<button onclick={() => reset()}>
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