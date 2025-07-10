# svelte-rx DevTool 설계 논의

> 대화-보고서 모드. svelte-rx devtool을 만들거야. 목적은 최근 액션과 현재 상태를 실시간으로 볼수 있도록 하는거야. state는 json의 형태겠지만 또 거대해서 전부를 보여주는 건 펼접이 가능하고 favorite, pin, hide 등이 가능해서 내가 원하는 data만 볼 수 있도록 하는 devtool을 만들거야

## 프로젝트 이해

### 목적
svelte-rx의 상태 관리를 실시간으로 모니터링하고 디버깅할 수 있는 개발자 도구

### 핵심 요구사항

1. **실시간 모니터링**
   - 최근 디스패치된 액션들의 히스토리
   - 현재 전체 상태 트리
   - 액션과 상태 변화의 실시간 업데이트

2. **대용량 상태 관리**
   - JSON 형태의 거대한 상태 트리 처리
   - 트리 구조의 펼침/접기 기능
   - 성능을 위한 가상 스크롤링 고려

3. **사용자 맞춤 뷰**
   - favorite: 자주 보는 상태 경로 즐겨찾기
   - pin: 특정 상태를 고정해서 항상 표시
   - hide: 불필요한 상태 숨기기
   - 필터링 및 검색 기능

## 기술적 고려사항

### svelte-rx 통합
- 현재 `dispatch` 함수가 모든 액션을 로깅 (`[svelte-rx]` prefix)
- `getCurrentState`로 현재 상태 접근 가능
- 액션은 RxJS Subject로 구현되어 구독 가능

### UI/UX 설계
- 분할 화면: 액션 히스토리 | 상태 트리
- 플로팅 위젯 형태로 개발 화면에 오버레이
- 최소화/최대화 가능
- 다크모드 지원

### 데이터 구조
```typescript
interface DevToolState {
  actions: Action[]         // 최근 액션 히스토리
  currentState: any        // 전체 상태 스냅샷
  favorites: string[]      // 즐겨찾기한 상태 경로
  pinned: string[]        // 고정된 상태 경로
  hidden: string[]        // 숨겨진 상태 경로
  expanded: Set<string>   // 펼쳐진 노드 경로
}
```

## 구현 전략

### 1단계: 코어 기능
- 액션 스트림 구독 및 히스토리 관리
- 상태 스냅샷 캡처 및 표시
- 기본적인 트리 뷰 렌더링

### 2단계: 인터랙션
- 트리 노드 펼침/접기
- 상태 값 복사 기능
- 액션 재실행 (time-travel debugging)

### 3단계: 사용자 맞춤 기능
- favorite/pin/hide 기능 구현
- 설정 저장 (localStorage)
- 검색 및 필터링

### 4단계: 성능 최적화
- 가상 스크롤링
- 메모이제이션
- 대용량 상태 처리

## 확정된 요구사항

### UI/UX
- **플로팅 위젯**: 드래그 앤 드롭으로 위치 이동 가능
- **JSON 테이블 뷰**: 상태를 테이블 형태로 표시
- **펼침/접기**: 중첩된 객체 탐색
- **Pin/Hide**: 특정 상태 고정/숨김
- **설정 저장**: localStorage에 pin/hide 설정 보관

### 액션 표시
- **기본**: 최근 1개 액션만 표시
- **히스토리 버튼**: 클릭 시 과거 액션 목록 표시
- **타임머신** (낮은 우선순위): 특정 시점의 상태 확인

## 구현 계획

### Phase 1: MVP (최우선)
1. **플로팅 컨테이너**
   - 드래그 가능한 위젯 컨테이너
   - 최소화/최대화 버튼
   - 위치 저장 (localStorage)

2. **상태 뷰어**
   - JSON을 테이블로 변환하여 표시
   - 키-값 쌍으로 렌더링
   - 중첩 객체는 펼침/접기 가능
   - 기본적인 타입별 색상 구분

3. **최근 액션 표시**
   - 마지막 디스패치된 액션 정보
   - 액션 타입과 페이로드 표시

### Phase 2: 핵심 기능
1. **Pin/Hide 기능**
   - 상태 경로별 pin/hide 토글
   - localStorage에 설정 저장
   - pin된 항목은 상단에 고정 표시

2. **액션 히스토리**
   - 히스토리 버튼 클릭 시 목록 표시
   - 최근 N개 액션 보관 (기본 50개?)
   - 각 액션의 타임스탬프

### Phase 3: 고급 기능 (낮은 우선순위)
1. **상태 스냅샷**
   - 각 액션 시점의 상태 저장
   - 특정 시점으로 이동 (읽기 전용)

2. **검색/필터**
   - 상태 키 검색
   - 값으로 필터링

## 기술적 구현 상세

### 드래그 앤 드롭
```typescript
// 마우스 이벤트로 구현
let isDragging = false;
let position = { x: 20, y: 20 };

function handleMouseDown(e: MouseEvent) {
  isDragging = true;
  // offset 계산
}

function handleMouseMove(e: MouseEvent) {
  if (isDragging) {
    // position 업데이트
  }
}
```

### JSON 테이블 뷰 렌더링
```typescript
interface TableRow {
  path: string;
  key: string;
  value: any;
  type: string;
  depth: number;
  isExpanded: boolean;
  isPinned: boolean;
  isHidden: boolean;
}

// JSON을 플랫한 테이블 구조로 변환
function jsonToTableRows(obj: any, path = ''): TableRow[] {
  // 재귀적으로 객체 순회
  // 각 노드를 TableRow로 변환
}
```

### svelte-rx 통합
```typescript
// 액션 스트림 구독
const actionStream$ = getActionStream(); // 새로운 API 필요?

// 현재 상태 구독
const currentState$ = interval(100).pipe(
  map(() => getCurrentState()),
  distinctUntilChanged()
);
```

## 남은 결정 사항

1. **활성화 방법**
   - 개발 모드에서 자동 표시?
   - 단축키로 토글?
   - 코드에서 명시적 활성화?

2. **초기 위치**
   - 우하단 고정?
   - 마지막 위치 기억?

3. **스타일링**
   - 다크 테마 기본?
   - 투명도 조절?