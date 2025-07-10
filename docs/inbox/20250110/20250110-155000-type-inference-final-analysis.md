# PathProxy 타입 추론 최종 분석

> 타입추론을 위한 proxy를 위한 고급스킬이야. 결과적으로 항상 string을 반환하지만 타입은 유지할 수 있는 방법이야. 그냥 타입 취급해

## 핵심 문제

현재 `PathProxy`는 다음과 같은 구조를 가집니다:
- 중간 노드: `PathProxy<T[K], "path.to.here">`
- 리프 노드: `BrandedPath<"path.to.leaf">`

하지만 `InferValue<T> = T`로 정의했기 때문에:
- `storePath.editor.document.nodes`는 `BrandedPath<"editor.document.nodes">`가 아니라
- 실제로는 `PathProxy` 객체 자체를 반환합니다

## 해결 방향

1. **PathProxy가 실제 값 타입을 포함하도록 수정**
   - PathProxy 타입 자체에 값 타입 정보를 인코딩
   - 또는 별도의 매핑 타입 사용

2. **타입 레벨에서 경로->값 매핑**
   - 경로 문자열을 기반으로 값 타입 추론
   - 하지만 사용자가 "string으로 오는걸 받아주겠다고 생각하지마"라고 했으므로 다른 방법 필요

3. **PathProxy 타입 구조 재설계**
   - 값 타입을 타입 파라미터로 전달
   - 예: `PathProxy<TValue, TPath>`

## 결론

`PathProxy`는 타입 레벨에서 경로와 값을 모두 추적하는 고급 패턴입니다. 단순히 `T`를 그대로 사용하는 것이 아니라, PathProxy의 타입 구조에서 값 타입을 추출하는 더 정교한 방법이 필요합니다.