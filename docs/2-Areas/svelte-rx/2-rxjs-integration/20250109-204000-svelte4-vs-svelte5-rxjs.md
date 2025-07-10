# Svelte 4 vs Svelte 5: RxJS Observable 처리

## Svelte 4의 RxJS 지원

### Store Contract
Svelte 4는 다음 인터페이스를 가진 객체를 store로 인식:
```typescript
interface Readable<T> {
  subscribe(subscriber: (value: T) => void): Unsubscriber;
}
```

### RxJS Observable은 이 인터페이스를 만족!
```svelte
<!-- Svelte 4 -->
<script>
  import { interval } from 'rxjs';
  
  // RxJS Observable을 $ 문법으로 직접 사용 가능
  const timer$ = interval(1000);
</script>

<!-- 자동 subscribe/unsubscribe! -->
<div>{$timer$}</div>
```

## Svelte 5의 변화

### Rune 기반 시스템
```svelte
<!-- Svelte 5 -->
<script>
  import { interval } from 'rxjs';
  
  // 이제 $ 접두사는 rune 전용
  const timer$ = interval(1000);
  
  // 에러! $는 더 이상 store 구독이 아님
  // let value = $timer$;
  
  // 수동으로 구독해야 함
  let value = $state(0);
  
  $effect(() => {
    const sub = timer$.subscribe(v => {
      value = v;
    });
    
    return () => sub.unsubscribe();
  });
</script>
```

## 왜 Svelte 5에서 제거되었나?

1. **Rune 시스템과의 충돌**
   - `$` 접두사가 rune 전용으로 변경
   - `$state`, `$derived`, `$effect` 등

2. **명시적 반응성**
   - Svelte 5는 더 명시적인 반응성 추구
   - 숨겨진 마법보다 명확한 코드 선호

3. **성능 최적화**
   - 컴파일 타임에 모든 반응성 결정
   - 런타임 store 구독 제거

## 해결책

### 1. 수동 관리
```typescript
onMount(() => {
  const sub = observable$.subscribe(value => {
    // ...
  });
  
  return () => sub.unsubscribe();
});
```

### 2. 우리의 헬퍼 사용
```typescript
$effect(() => {
  autoSubscribe(observable$, value => {
    // 자동 unsubscribe!
  });
});
```

### 3. Svelte store로 래핑
```typescript
function fromObservable<T>(observable$: Observable<T>) {
  return readable<T>(undefined, (set) => {
    const subscription = observable$.subscribe(set);
    return () => subscription.unsubscribe();
  });
}

// 사용
const timer = fromObservable(interval(1000));
const value = $derived(timer);
```

## 결론
- Svelte 4: RxJS Observable 자동 지원 ✅
- Svelte 5: 수동 관리 필요 ❌
- 트레이드오프: 더 명시적이지만 덜 편리함