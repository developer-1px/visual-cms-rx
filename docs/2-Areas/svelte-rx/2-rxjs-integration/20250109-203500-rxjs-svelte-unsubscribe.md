# RxJS와 Svelte의 Unsubscribe 처리

## Svelte Store vs RxJS Observable

### Svelte Store (자동 unsubscribe)
```typescript
// Svelte store
import { writable } from 'svelte/store';

const count = writable(0);

// 컴포넌트에서
<script>
  // $ 문법 사용 시 자동 unsubscribe
  $: value = $count;
</script>
```

### RxJS Observable (수동 unsubscribe 필요)
```typescript
// 잘못된 예 - 메모리 누수!
onMount(() => {
  someObservable$.subscribe(value => {
    // 이 구독은 영원히 살아있음
  });
});

// 올바른 예 1 - onDestroy 사용
let subscription: Subscription;
onMount(() => {
  subscription = someObservable$.subscribe(value => {
    // ...
  });
});
onDestroy(() => {
  subscription?.unsubscribe();
});

// 올바른 예 2 - return cleanup 함수
onMount(() => {
  const subscription = someObservable$.subscribe(value => {
    // ...
  });
  
  return () => {
    subscription.unsubscribe();
  };
});
```

## 우리가 만든 autoSubscribe의 필요성

```typescript
export function autoSubscribe<T>(
  observable: Observable<T>, 
  observer: (value: T) => void
): void {
  const subscription = observable.subscribe(observer);
  onDestroy(() => subscription.unsubscribe());
}
```

이 헬퍼가 필요한 이유:
1. Svelte는 RxJS Observable을 모름
2. 수동 unsubscribe 코드 반복 제거
3. 메모리 누수 방지

## Svelte 5의 $effect와 RxJS

```typescript
// $effect도 RxJS를 자동으로 처리하지 않음
$effect(() => {
  const sub = observable$.subscribe(value => {
    // 이것도 수동 cleanup 필요
  });
  
  // cleanup 함수 반환
  return () => {
    sub.unsubscribe();
  };
});
```

## 결론
- Svelte store만 자동 unsubscribe
- RxJS Observable은 항상 수동 관리 필요
- `autoSubscribe` 같은 헬퍼로 편의성 향상