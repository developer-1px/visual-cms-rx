# Visual CMS - 인라인 편집 패턴

> 맞아. 그런데 그렇게 만들면 내가 입력한 컨텐츠가 실제로 어떻게 나오는지 preview와 디자인을 계속 왔다 갔다 해야 하는 문제가 있더라고.

## 문제점 분석

기존 폼 기반 편집의 한계:
- **컨텍스트 상실**: 콘텐츠가 실제로 표시될 위치를 모름
- **반복적인 전환**: 편집 → 미리보기 → 편집 사이클
- **인지적 부담**: "이 필드가 어디에 나타나는거지?"
- **시간 낭비**: 작은 수정에도 여러 번 확인 필요

## 해결책: 인라인 편집 (In-Place Editing)

### 핵심 컨셉
- **WYSIWYG**: 실제 디자인 위에서 직접 편집
- **제한된 편집**: 콘텐츠만 수정 가능, 구조는 불가
- **즉각적 피드백**: 타이핑하는 즉시 결과 확인
- **컨텍스트 유지**: 전체 디자인 속에서 편집

### 기술적 구현 방향

```typescript
// 편집 가능한 영역 표시
interface EditableContent {
  id: string
  type: 'text' | 'image' | 'link'
  value: any
  constraints: EditConstraints
  isEditing: boolean
}

// 편집 모드 전환
const enterEditMode = (contentId: string) => {
  // 해당 콘텐츠 영역만 편집 가능하게 변경
  // 나머지 디자인은 그대로 유지
}
```

### UI/UX 패턴

1. **호버 효과**: 편집 가능한 영역에 마우스 올리면 하이라이트
2. **클릭해서 편집**: 클릭하면 바로 그 자리에서 편집 시작
3. **편집 도구**: 작은 플로팅 툴바로 포맷팅 옵션 제공
4. **자동 저장**: 편집 영역 밖 클릭 시 자동 저장

### 구현 예시

```svelte
<!-- ContentEditable.svelte -->
{#if isEditing}
  <div 
    contenteditable="true"
    on:blur={saveContent}
    class="editing"
  >
    {content}
  </div>
{:else}
  <div 
    on:click={startEdit}
    class="editable-hint"
  >
    {content}
  </div>
{/if}
```

## 장점

1. **직관적**: "여기를 클릭해서 수정하세요"
2. **효율적**: 편집과 미리보기가 하나로
3. **안전함**: 여전히 구조는 건드릴 수 없음
4. **컨텍스트 유지**: 전체 디자인 속에서 작업

## 구현 시 고려사항

1. **권한 체크**: 편집 가능한 영역만 활성화
2. **편집 충돌**: 여러 사람이 동시 편집 시 처리
3. **실행 취소**: Undo/Redo 기능
4. **반응형 편집**: 모바일/태블릿에서도 편집 가능

## 다음 단계

1. EditableContent 컴포넌트 프로토타입
2. 콘텐츠 타입별 편집 UI (텍스트, 이미지, 링크)
3. 편집 권한 시스템
4. 실시간 저장 및 동기화