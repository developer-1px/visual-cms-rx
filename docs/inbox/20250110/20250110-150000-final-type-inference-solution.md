# svelte-rx 타입 추론 최종 해결 방안

> 다른 방향에서도 방법을 생각해봐. 이 반응형 라이브러리 세계에서는 타입추론이 제일 중요해!

## 문제 해결 방안

타입 추론 문제를 해결하기 위해 여러 접근법을 탐색한 결과, 가장 실용적인 해결책을 찾았습니다.

### 핵심 인사이트

현재 `PathProxy`가 객체를 반환하기 때문에 배열에서 타입 추론이 실패합니다. TypeScript는 객체 배열을 리터럴 타입으로 추론하지 못하기 때문입니다.

### 최종 해결책: Hybrid Approach

1. **즉각적인 해결**: 오버로드를 7개까지 확장 (RxJS 방식)
2. **근본적인 해결**: PathProxy가 실제 문자열을 반환하도록 개선
3. **대안 API**: Builder 패턴과 Template Literal 지원

## 구현 코드

### 1. 확장된 오버로드 (즉시 적용 가능)

```typescript
// svelte-rx.svelte.ts에 추가된 오버로드
interface OnFunction<TState> {
  // 2-7개 파라미터까지 명시적 타입 지원
  <T1, T2>(deps: [T1, T2], mapper: (v1: V1, v2: V2) => TState): void;
  <T1, T2, T3>(deps: [T1, T2, T3], mapper: (v1: V1, v2: V2, v3: V3) => TState): void;
  // ... 7개까지
}
```

### 2. LiteralPathProxy (근본적 해결)

```typescript
// createLiteralPathProxy.ts
const path = createLiteralPathProxy<StoreSchema>();
const selectedId = path.selection.selectedId; // 실제 문자열 "selection.selectedId"

// as const 없이 사용 가능!
on([path.selection.selectedId, path.editor.document.nodes], (id, nodes) => {
  // 타입 완벽 추론
});
```

### 3. Builder Pattern (대안 API)

```typescript
// dependencyBuilder.ts
on(deps()
  .add(storePath.selection.selectedId)
  .add(storePath.editor.document.nodes)
  .map((id, nodes) => {
    // 완벽한 타입 추론
  })
);
```

## 권장 마이그레이션 전략

1. **단계 1**: 현재 코드에서 `as const` 제거하고 오버로드 확장 테스트
2. **단계 2**: `createLiteralPathProxy` 도입하여 점진적 마이그레이션
3. **단계 3**: 복잡한 경우 Builder 패턴 옵션 제공

## 성능 고려사항

- LiteralPathProxy는 런타임 오버헤드가 최소화됨
- Builder 패턴은 추가 객체 생성 비용이 있지만 타입 안전성 극대화
- Template Literal 방식은 컴파일 타임에만 영향

## 결론

RxJS가 7개 오버로드를 제공하는 이유는 실용성과 성능의 균형점이기 때문입니다. 우리도 동일한 접근을 취하되, 장기적으로는 더 나은 API를 제공하는 것이 목표입니다.