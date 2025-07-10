# svelte-rx 배열 타입 추론 해결 보고서

> 만약 array가 헷갈리면 on.combine(a,b,c) 이런것도 좋고

## 문제 분석

현재 `on([paths], mapper)` 패턴에서 타입 추론이 실패하는 이유:
1. TypeScript는 배열 리터럴을 기본적으로 넓은 타입으로 추론
2. PathProxy 객체가 리터럴 문자열이 아니어서 타입 정보 손실
3. 제네릭 타입 파라미터가 복잡한 경우 추론 실패

## 해결 방안: on.combine API

### 구현 전략

```typescript
// 명시적인 파라미터로 타입 추론 개선
on.combine(
  storePath.selection.selectedId,
  storePath.editor.document.nodes,
  (selectedId, nodes) => {
    // 타입이 완벽하게 추론됨!
    // selectedId: string | null
    // nodes: Map<string, HtmlNode>
  }
);
```

### 장점

1. **명확한 API**: 배열 대신 명시적 파라미터
2. **완벽한 타입 추론**: 각 파라미터의 타입이 정확히 추론됨
3. **RxJS combineLatest와 유사**: 익숙한 패턴
4. **as const 불필요**: 추가 타입 어노테이션 없이 작동

### 구현 내용

1. `OnFunction` 인터페이스에 `combine` 메서드 추가
2. 1-5개 파라미터까지 오버로드 제공
3. 내부적으로는 배열로 변환하여 처리

## 추가 개선 사항

### 1. 배열 문법도 병행 지원

```typescript
// 기존 배열 문법 (as const 필요)
on([path1, path2] as const, (v1, v2) => {})

// 새로운 combine 문법 (as const 불필요)
on.combine(path1, path2, (v1, v2) => {})
```

### 2. 에러 메시지 개선

타입 추론 실패 시 더 명확한 에러 메시지 제공

### 3. 문서화

두 가지 방식의 장단점을 명확히 문서화

## 결론

`on.combine` API는 타입 추론 문제를 우아하게 해결하면서도 사용하기 쉬운 인터페이스를 제공합니다. RxJS의 `combineLatest`와 유사한 패턴으로 개발자들에게 친숙할 것입니다.