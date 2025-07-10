# 에디터 필수 기능 구현 전략

> 맞아 우선 선택과 키입력 삭제 편집 복사 붙여넣기 undo redo와 같은 전형적이지만 정말 자주 쓰이는 기능부터 시작할거야

## 왜 이 기능들부터인가

모든 에디터의 기본이 되는 기능들:
- **어떤 앱에서도 필요한 핵심 기능**
- **사용자가 당연히 기대하는 동작**
- **제대로 구현하기 까다로운 기능들**
- **한 번 잘 만들면 계속 재사용**

## 핵심 기능 스트림 설계

### 1. Selection (선택)
```typescript
// base/rx/selection.ts
export const createSelectionStream = (element: HTMLElement) => {
  const mousedown$ = fromEvent(element, 'mousedown')
  const mousemove$ = fromEvent(document, 'mousemove')
  const mouseup$ = fromEvent(document, 'mouseup')
  
  return mousedown$.pipe(
    switchMap(start => mousemove$.pipe(
      map(move => ({ start, current: move })),
      takeUntil(mouseup$)
    )),
    map(({ start, current }) => calculateSelection(start, current))
  )
}

// Multi-selection with Ctrl/Cmd
export const multiSelection$ = merge(
  normalSelection$,
  ctrlSelection$.pipe(
    scan((acc, curr) => [...acc, curr], [])
  )
)
```

### 2. Keyboard Input (키 입력)
```typescript
// base/rx/keyboard.ts
export const createKeyboardStream = () => {
  const keydown$ = fromEvent<KeyboardEvent>(document, 'keydown')
  const keyup$ = fromEvent<KeyboardEvent>(document, 'keyup')
  
  // 단축키 조합
  const shortcuts$ = keydown$.pipe(
    filter(e => e.ctrlKey || e.metaKey),
    map(e => ({
      key: e.key.toLowerCase(),
      shift: e.shiftKey,
      alt: e.altKey
    }))
  )
  
  return { keydown$, keyup$, shortcuts$ }
}
```

### 3. Delete (삭제)
```typescript
// base/rx/delete.ts
export const createDeleteStream = (selection$: Observable<Selection>) => {
  const deleteKey$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    filter(e => e.key === 'Delete' || e.key === 'Backspace')
  )
  
  return combineLatest([deleteKey$, selection$]).pipe(
    map(([_, selection]) => ({
      type: 'delete',
      target: selection
    }))
  )
}
```

### 4. Edit (편집)
```typescript
// base/rx/edit.ts
export const createEditStream = (element: HTMLElement) => {
  const dblclick$ = fromEvent(element, 'dblclick')
  const f2$ = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
    filter(e => e.key === 'F2')
  )
  
  return merge(dblclick$, f2$).pipe(
    switchMap(() => createInlineEditor$())
  )
}
```

### 5. Copy/Paste (복사/붙여넣기)
```typescript
// base/rx/clipboard.ts
export const createClipboardStream = () => {
  const copy$ = merge(
    shortcut$('c'),
    contextMenu$('copy')
  ).pipe(
    withLatestFrom(selection$),
    tap(([_, selection]) => copyToClipboard(selection))
  )
  
  const paste$ = merge(
    shortcut$('v'),
    contextMenu$('paste')
  ).pipe(
    switchMap(() => readFromClipboard())
  )
  
  return { copy$, paste$ }
}
```

### 6. Undo/Redo
```typescript
// base/rx/history.ts
export const createHistoryStream = <T>(
  actions$: Observable<Action<T>>,
  maxHistory = 100
) => {
  const history$ = actions$.pipe(
    scan((history, action) => {
      const newHistory = [...history.past, action]
      return {
        past: newHistory.slice(-maxHistory),
        future: []
      }
    }, { past: [], future: [] }),
    shareReplay(1)
  )
  
  const undo$ = shortcut$('z').pipe(
    withLatestFrom(history$),
    filter(([_, h]) => h.past.length > 0),
    map(([_, h]) => {
      const [action, ...past] = h.past.reverse()
      return { action, past, future: [action, ...h.future] }
    })
  )
  
  const redo$ = shortcut$(['shift', 'z']).pipe(
    withLatestFrom(history$),
    filter(([_, h]) => h.future.length > 0),
    map(([_, h]) => {
      const [action, ...future] = h.future
      return { action, past: [...h.past, action], future }
    })
  )
  
  return { history$, undo$, redo$ }
}
```

## 통합 패턴

```typescript
// features/editor/editor.stream.ts
export const createEditorStreams = (container: HTMLElement) => {
  const selection$ = createSelectionStream(container)
  const keyboard$ = createKeyboardStream()
  const delete$ = createDeleteStream(selection$)
  const edit$ = createEditStream(container)
  const { copy$, paste$ } = createClipboardStream()
  const { undo$, redo$ } = createHistoryStream(
    merge(delete$, edit$, paste$)
  )
  
  return {
    selection$,
    keyboard$,
    delete$,
    edit$,
    copy$,
    paste$,
    undo$,
    redo$
  }
}
```

## 구현 우선순위

1. **Selection**: 모든 것의 기초
2. **Keyboard**: 단축키 시스템
3. **Delete**: 선택된 항목 삭제
4. **Copy/Paste**: 클립보드 연동
5. **Undo/Redo**: 히스토리 관리
6. **Edit**: 인라인 편집

## 재사용성 극대화

이 기능들은:
- **Visual Editor에서**: 컴포넌트 선택, 편집
- **Table Editor에서**: 셀 선택, 편집
- **File Manager에서**: 파일 선택, 조작
- **Any Editor에서**: 모든 편집 가능한 UI

한 번 잘 만들어두면 프레임워크의 핵심 자산이 됨