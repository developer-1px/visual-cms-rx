# Svelte 5에서 RxJS와 $derived 사용 패턴 보고서

## 검색 결과 요약

### 1. Svelte 5의 주요 변화
- Svelte 5는 signals 기반 반응성 시스템으로 이동
- Store는 여전히 복잡한 비동기 데이터 스트림에 사용 권장
- RxJS와의 통합은 주로 Store를 통해 이루어짐

### 2. 현재 사용 가능한 패턴

#### a) Observable과 $derived 사용
```typescript
// Dexie liveQuery 예시
let friends = $derived(liveQuery(async () => { ... }));

// 데이터 변환
const data = $derived(objectValues($data$).sort((a,b)=>b.price - a.price));
```

#### b) $effect를 통한 통합
```typescript
$effect(() => {
  const subscription = observable$.subscribe(value => {
    // 상태 업데이트
  });
  
  return () => subscription.unsubscribe();
});
```

#### c) 외부 라이브러리 활용
- `svelte-observable`: Observable을 Svelte Store로 wrapping
- `svelte-to-observable`: Svelte Store를 RxJS Observable로 변환

### 3. 주의사항
- RxJS Observable의 가장 큰 문제는 unsubscription 처리
- Svelte 5에는 Observable을 직접 "unpack"하는 내장 rune이 없음
- 복잡한 async 데이터 스트림에는 Store가 더 적합

### 4. $derived와 Store 통합

**중요: `$derived`는 store와 직접 통합되지 않음**

```typescript
// ❌ 잘못된 사용
const store = writable(0);
const doubled1 = $derived(store * 2); // 에러!

// ✅ 올바른 사용
const doubled2 = $derived($store * 2); // $ prefix 필요

// ✅ get() 사용 (반응성 없음)
import { get } from 'svelte/store';
const value = $derived(get(store) * 2);
```

`$derived`는 Svelte 5의 새로운 signals 기반 시스템에서만 작동하며, store는 여전히 `$` prefix를 통해 접근해야 합니다.

### 5. 현재 프로젝트에 적용 가능한 부분

우리가 만든 `useObservable` 패턴은 위 검색 결과와 유사한 접근:
```typescript
// useObservable.svelte.ts
export function useObservable<T>(
  createStream: () => Observable<T> | null
): () => T | null {
  let value = $state<T | null>(null);
  
  $effect(() => {
    const stream = createStream();
    if (!stream) return;
    
    const sub = stream.subscribe(v => value = v);
    return () => sub.unsubscribe();
  });
  
  return () => value;
}

// 사용
const rect = $derived(useObservable(
  () => element && isSelected ? createBoundingRectObservable(element) : null
)());
```

이 패턴은:
1. `$effect`를 통해 subscription 관리
2. `$state`로 reactive value 생성
3. `$derived`로 최종 값 사용
4. 자동 unsubscribe 처리

결론: 현재 구현이 베스트 프랙티스에 부합함