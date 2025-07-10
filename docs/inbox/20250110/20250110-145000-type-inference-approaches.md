# svelte-rx 타입 추론 개선 방안 보고서

> 다른 방향에서도 방법을 생각해봐. 이 반응형 라이브러리 세계에서는 타입추론이 제일 중요해!

## 현재 문제점

현재 `on([dependencies], mapper)` 패턴에서 타입 추론이 제대로 작동하지 않아 `as const`를 사용해야 하는 문제가 있습니다:

```typescript
// 현재 상황 - as const 필요
on(
  [storePath.selection.selectedId, storePath.editor.document.nodes] as const,
  (selectedId, nodes) => { /* ... */ }
);
```

## 대안 접근법들

### 1. Literal Path Proxy (리터럴 경로 프록시)

**핵심 아이디어**: PathProxy가 객체 대신 브랜드된 문자열 리터럴을 직접 반환

```typescript
// createPathProxy2.ts
type PathString<T extends string> = T & { [PathBrand]: true };

const path = createPathProxy<StoreSchema>();
const userPath = path.user.name; // Type: PathString<"user.name">

// 사용 예시 - as const 불필요!
on([path.selection.selectedId, path.editor.document.nodes], (id, nodes) => {
  // 타입이 자동으로 추론됨
});
```

**장점**:
- `as const` 불필요
- 기존 API와 유사한 사용성
- 타입 정보가 값에 포함됨

**단점**:
- 브랜드 타입으로 인한 복잡성
- 런타임 프록시 오버헤드

### 2. Dependency Builder Pattern (의존성 빌더 패턴)

**핵심 아이디어**: 체이닝 가능한 빌더 패턴으로 타입 정보 누적

```typescript
// dependencyBuilder.ts
// 방법 1: 체이닝
deps()
  .add(storePath.selection.selectedId)
  .add(storePath.editor.document.nodes)
  .map((selectedId, nodes) => {
    // 완벽한 타입 추론!
    return nodes?.get(selectedId);
  });

// 방법 2: 가변 인자
deps2(storePath.selection.selectedId, storePath.editor.document.nodes)
  .map((selectedId, nodes) => {
    // 역시 완벽한 타입 추론!
  });
```

**장점**:
- 완벽한 타입 추론
- 확장 가능한 API
- 명시적이고 읽기 쉬운 코드

**단점**:
- 새로운 API 학습 필요
- 기존 패턴과 다른 문법

### 3. Template Literal Types (템플릿 리터럴 타입)

**핵심 아이디어**: TypeScript의 템플릿 리터럴 타입으로 경로 검증

```typescript
// pathTemplate.ts
// 단일 경로
const selectedPath = path('selection.selectedId');

// 다중 경로
paths('selection.selectedId', 'editor.document.nodes')
  .map((selectedId, nodes) => {
    // 타입 추론 완벽!
  });

// 태그드 템플릿 리터럴
const userPath = p`user.profile.name`;
```

**장점**:
- 컴파일 타임 경로 검증
- 문자열 기반으로 직관적
- 타입 안전성 보장

**단점**:
- 스키마가 복잡해질수록 타입 계산 부하
- IDE 자동완성이 제한적일 수 있음

## 통합 제안: Hybrid Approach

가장 실용적인 접근은 여러 방법을 조합하는 것입니다:

```typescript
// 1. PathProxy를 리터럴 반환하도록 개선
const path = createLiteralPathProxy<StoreSchema>();

// 2. on 함수에 다양한 오버로드 제공
export interface OnFunction<TState> {
  // 기존 액션 방식
  <P>(action: Action<P>, mapper: (state: TState, payload: P) => TState): void;
  
  // 개선된 배열 방식 - PathString 타입 활용
  <T extends readonly PathString<any>[]>(
    dependencies: T,
    mapper: (...values: InferPathValues<T>) => TState
  ): void;
  
  // 빌더 패턴 지원
  <T>(
    builder: { paths: any[]; mapper: (...args: any[]) => T }
  ): void;
}

// 3. 사용자가 선호하는 방식 선택 가능
// 방식 1: 직접 배열 (as const 불필요)
on([path.selection.selectedId, path.editor.document.nodes], (id, nodes) => {});

// 방식 2: 빌더 패턴
on(deps(path.selection.selectedId, path.editor.document.nodes)
  .map((id, nodes) => {}));

// 방식 3: 문자열 경로
on(paths('selection.selectedId', 'editor.document.nodes')
  .map((id, nodes) => {}));
```

## 권장사항

1. **단기적**: Literal Path Proxy 도입으로 `as const` 제거
2. **중기적**: Builder Pattern을 옵션으로 제공
3. **장기적**: 모든 접근법을 지원하는 유연한 API 제공

이렇게 하면 사용자가 상황에 맞는 최적의 방식을 선택할 수 있고, 타입 추론도 완벽하게 작동합니다.