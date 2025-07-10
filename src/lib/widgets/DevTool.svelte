<script lang="ts">
  import { onMount, untrack } from 'svelte';
  import { actionStream$, stateChange$ } from '../base/svelte-rx/svelte-rx.svelte';
  import { ChevronDown, ChevronRight, Pin, Eye, EyeOff, RotateCcw } from 'lucide-svelte';
  
  // 상태 및 액션 데이터
  let currentState = $state<any>({});
  let lastAction = $state<{ type: string; payload: any; number?: number } | null>(null);
  let actionCount = $state(0);
  let isMinimized = $state(false);
  
  // 드래그 상태
  let isDragging = $state(false);
  let position = $state({ x: window.innerWidth - 340, y: window.innerHeight - 380 });
  let dragOffset = { x: 0, y: 0 };
  
  // 테이블 뷰 상태
  let expanded = $state<Set<string>>(new Set());
  let pinned = $state<Set<string>>(new Set());
  let hidden = $state<Set<string>>(new Set());
  let showHidden = $state(false);
  
  // localStorage 키
  const STORAGE_KEY = 'svelte-rx-devtool';
  
  // localStorage에서 설정 로드
  function loadSettings() {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        expanded = new Set(settings.expanded || []);
        pinned = new Set(settings.pinned || []);
        hidden = new Set(settings.hidden || []);
      }
    } catch (e) {
      console.error('Failed to load DevTool settings:', e);
      resetSettings();
    }
  }
  
  // localStorage에 설정 저장
  function saveSettings() {
    try {
      const settings = {
        expanded: Array.from(expanded),
        pinned: Array.from(pinned),
        hidden: Array.from(hidden)
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save DevTool settings:', e);
    }
  }
  
  // 설정 초기화
  function resetSettings() {
    expanded = new Set();
    pinned = new Set();
    hidden = new Set();
    window.localStorage.removeItem(STORAGE_KEY);
  }
  
  // 초기 상태 로드
  onMount(() => {
    loadSettings();
    currentState = {}; // TODO: implement store tracking
  });
  
  // 액션 스트림 구독
  $effect(() => {
    const actionSub = actionStream$.subscribe(action => {
      actionCount++;
      lastAction = { ...action, number: actionCount };
    });
    
    // 상태 변경 구독
    const stateSub = stateChange$.subscribe(() => {
      untrack(() => {
        currentState = {}; // TODO: implement store tracking
      });
    });
    
    return () => {
      actionSub.unsubscribe();
      stateSub.unsubscribe();
    };
  });
  
  function handleMouseDown(e: MouseEvent) {
    if ((e.target as HTMLElement).closest('.devtool-header')) {
      isDragging = true;
      dragOffset.x = e.clientX - position.x;
      dragOffset.y = e.clientY - position.y;
    }
  }
  
  function handleMouseMove(e: MouseEvent) {
    if (isDragging) {
      position.x = e.clientX - dragOffset.x;
      position.y = e.clientY - dragOffset.y;
    }
  }
  
  function handleMouseUp() {
    isDragging = false;
  }
  
  // JSON을 테이블 행으로 변환
  interface TableRow {
    path: string;
    key: string;
    value: any;
    type: string;
    depth: number;
    hasChildren: boolean;
    parentPath: string | null;
  }
  
  function jsonToTableRows(obj: any, path = '', depth = 0, includeAllDescendants = false): TableRow[] {
    const rows: TableRow[] = [];
    
    if (obj === null || obj === undefined) {
      return rows;
    }
    
    if (typeof obj === 'object' && !Array.isArray(obj)) {
      Object.entries(obj).forEach(([key, value]) => {
        const currentPath = path ? `${path}.${key}` : key;
        const hasChildren = value !== null && typeof value === 'object';
        
        rows.push({
          path: currentPath,
          key,
          value,
          type: Array.isArray(value) ? 'array' : typeof value,
          depth,
          hasChildren,
          parentPath: path || null
        });
        
        // includeAllDescendants가 true면 모든 하위 항목을 포함
        // 아니면 expanded 상태를 확인
        if (hasChildren && (includeAllDescendants || expanded.has(currentPath))) {
          rows.push(...jsonToTableRows(value, currentPath, depth + 1, includeAllDescendants));
        }
      });
    } else if (Array.isArray(obj)) {
      obj.forEach((value, index) => {
        const currentPath = `${path}[${index}]`;
        const hasChildren = value !== null && typeof value === 'object';
        
        rows.push({
          path: currentPath,
          key: `[${index}]`,
          value,
          type: Array.isArray(value) ? 'array' : typeof value,
          depth,
          hasChildren,
          parentPath: path || null
        });
        
        if (hasChildren && (includeAllDescendants || expanded.has(currentPath))) {
          rows.push(...jsonToTableRows(value, currentPath, depth + 1, includeAllDescendants));
        }
      });
    }
    
    return rows;
  }
  
  function toggleExpand(path: string) {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    expanded = newExpanded;
    saveSettings();
  }
  
  function togglePin(path: string) {
    const newPinned = new Set(pinned);
    if (newPinned.has(path)) {
      newPinned.delete(path);
    } else {
      newPinned.add(path);
    }
    pinned = newPinned;
    saveSettings();
  }
  
  function toggleHide(path: string) {
    // Pin된 항목은 Hide할 수 없음
    if (pinned.has(path)) {
      return;
    }
    
    const newHidden = new Set(hidden);
    if (newHidden.has(path)) {
      newHidden.delete(path);
    } else {
      newHidden.add(path);
    }
    hidden = newHidden;
    saveSettings();
  }
  
  function getValueColor(value: any): string {
    if (value === null) return '#666';
    if (value === undefined) return '#666';
    if (typeof value === 'string') return '#ce9178';
    if (typeof value === 'number') return '#b5cea8';
    if (typeof value === 'boolean') return '#569cd6';
    if (typeof value === 'function') return '#dcdcaa';
    return '#d4d4d4';
  }
  
  function formatValue(value: any): string {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return `"${value}"`;
    if (typeof value === 'function') return 'ƒ()';
    if (Array.isArray(value)) return `Array(${value.length})`;
    if (typeof value === 'object') return `{...}`;
    return String(value);
  }
  
  function formatActionPayload(payload: any): string {
    if (payload === null) return 'null';
    if (payload === undefined) return 'undefined';
    
    if (Array.isArray(payload)) {
      // 배열의 1 depth 표시
      const items = payload.slice(0, 3).map(item => {
        if (item === null) return 'null';
        if (item === undefined) return 'undefined';
        if (Array.isArray(item)) return '[...]';
        if (typeof item === 'object') return '{...}';
        if (typeof item === 'string') return `"${item}"`;
        return String(item);
      });
      if (payload.length > 3) items.push('...');
      return `[${items.join(', ')}]`;
    }
    
    if (typeof payload === 'object') {
      // 객체의 1 depth 표시
      const entries = Object.entries(payload).slice(0, 3);
      const items = entries.map(([key, value]) => {
        let formattedValue: string;
        if (value === null) formattedValue = 'null';
        else if (value === undefined) formattedValue = 'undefined';
        else if (Array.isArray(value)) formattedValue = '[...]';
        else if (typeof value === 'object') formattedValue = '{...}';
        else if (typeof value === 'string') formattedValue = `"${value}"`;
        else formattedValue = String(value);
        return `${key}: ${formattedValue}`;
      });
      if (Object.keys(payload).length > 3) items.push('...');
      return `{${items.join(', ')}}`;
    }
    
    if (typeof payload === 'string') return payload;
    return String(payload);
  }
  
  // 특정 경로가 그룹에 속하는지 확인 (부모 경로 포함)
  function belongsToGroup(row: TableRow, checkFn: (_path: string) => boolean): boolean {
    // 현재 경로나 부모 경로 중 하나라도 조건을 만족하면 true
    let currentPath = row.path;
    while (currentPath) {
      if (checkFn(currentPath)) return true;
      // 부모 경로 찾기
      const lastDot = currentPath.lastIndexOf('.');
      const lastBracket = currentPath.lastIndexOf('[');
      const lastSeparator = Math.max(lastDot, lastBracket);
      if (lastSeparator === -1) break;
      currentPath = currentPath.substring(0, lastSeparator);
    }
    return false;
  }
  
  // 테이블 행을 그룹별로 분리
  let groupedRows = $derived.by(() => {
    // 모든 하위 항목을 포함하여 행 생성
    const allRows = jsonToTableRows(currentState, '', 0, true);
    
    // Hidden 항목과 그 하위 항목들 찾기
    const hiddenPaths = new Set<string>();
    
    // 먼저 직접 hide된 항목 찾기
    allRows.forEach(row => {
      if (hidden.has(row.path)) {
        hiddenPaths.add(row.path);
      }
    });
    
    // 하위 항목들도 부모가 hidden이면 hidden에 포함
    allRows.forEach(row => {
      if (row.parentPath && belongsToGroup(row, path => hiddenPaths.has(path))) {
        hiddenPaths.add(row.path);
      }
    });
    
    // Pinned 그룹: pin된 항목만 (depth 없이, 전체 경로 표시)
    const pinnedRows = Array.from(pinned).map(path => ({
      path,
      key: path,  // 전체 경로를 key로 사용
      value: getValueAtPath(currentState, path),
      type: typeof getValueAtPath(currentState, path),
      depth: 0,  // depth 없음
      hasChildren: false,  // 펼침/접기 없음
      parentPath: null
    })).sort((a, b) => a.path.localeCompare(b.path));  // 알파벳 순 정렬
    
    // Hidden 그룹: hide된 항목들
    const hiddenRows = allRows.filter(row => hiddenPaths.has(row.path));
    
    // Current 그룹: hide되지 않은 모든 항목 (pin 여부와 무관)
    const currentRows = allRows.filter(row => !hiddenPaths.has(row.path));
    
    // Current와 Hidden 그룹은 계층 구조 유지하며 expanded 상태 확인
    function filterVisibleRows(rows: TableRow[]): TableRow[] {
      const visibleRows: TableRow[] = [];
      const expandedPaths = new Set<string>();
      
      // 모든 행을 순회하며 표시할 행 결정
      rows.forEach(row => {
        if (!row.parentPath || expanded.has(row.parentPath) || expandedPaths.has(row.parentPath)) {
          visibleRows.push(row);
          if (row.hasChildren && expanded.has(row.path)) {
            expandedPaths.add(row.path);
          }
        }
      });
      
      return visibleRows;
    }
    
    return {
      pinned: pinnedRows,  // Pinned는 필터링 없이 모두 표시
      current: filterVisibleRows(currentRows),
      hidden: filterVisibleRows(hiddenRows)
    };
  });
  
  // 경로로 값 가져오기
  function getValueAtPath(obj: any, path: string): any {
    const parts = path.split(/\.|\[|\]/).filter(Boolean);
    let current = obj;
    for (const part of parts) {
      if (current == null) return undefined;
      current = current[part];
    }
    return current;
  }
  
  onMount(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  });
</script>

<div 
  class="devtool-container"
  class:minimized={isMinimized}
  style="left: {position.x}px; top: {position.y}px;"
  onmousedown={handleMouseDown}
  role="application"
  aria-label="svelte-rx DevTool"
>
  <div class="devtool-header">
    <span class="devtool-title">svelte-rx DevTool</span>
    <div class="header-actions">
      <button 
        class="header-btn"
        onclick={resetSettings}
        title="Reset settings"
      >
        <RotateCcw size={10} />
      </button>
      <button 
        class="header-btn"
        onclick={() => isMinimized = !isMinimized}
        title={isMinimized ? 'Maximize' : 'Minimize'}
      >
        {isMinimized ? '□' : '─'}
      </button>
    </div>
  </div>
  
  {#if !isMinimized}
    <div class="devtool-body">
      <div class="section action-section">
        <h3>최근 액션</h3>
        <div class="action-display">
          {#if lastAction}
            <div class="action-item">
              <span class="action-number">#{lastAction.number}</span>
              <span class="action-type">{lastAction.type}</span>
              {#if lastAction.payload !== undefined}
                <span class="action-payload">{formatActionPayload(lastAction.payload)}</span>
              {/if}
            </div>
          {:else}
            <span class="no-action">액션 대기 중...</span>
          {/if}
        </div>
      </div>
      
      <div class="section state-section">
        <h3>현재 상태</h3>
        <div class="state-viewer">
          <!-- Pinned 그룹 -->
          {#if groupedRows.pinned.length > 0}
            <div class="group-section">
              <h4 class="group-title">
                <Pin size={10} class="group-icon" />
                Pinned
              </h4>
              <table class="json-table">
                <tbody>
                  {#each groupedRows.pinned as row}
                    <tr class="table-row pinned">
                      <td class="key-cell path-cell">
                        <span class="full-path">{row.path}</span>
                      </td>
                      <td class="value-cell">
                        <span 
                          class="value"
                          style="color: {getValueColor(row.value)}"
                        >
                          {formatValue(row.value)}
                        </span>
                      </td>
                      <td class="actions-cell">
                        <button 
                          class="action-btn"
                          onclick={() => togglePin(row.path)}
                          title="Unpin"
                        >
                          <Pin size={10} class="active" />
                        </button>
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          
          <!-- Current 그룹 -->
          {#if groupedRows.current.length > 0}
            <div class="group-section">
              <h4 class="group-title">Current State</h4>
              <table class="json-table">
                <tbody>
                  {#each groupedRows.current as row}
                    <tr 
                      class="table-row" 
                      class:is-pinned={pinned.has(row.path)}
                      onclick={() => row.hasChildren && toggleExpand(row.path)}
                      style="cursor: {row.hasChildren ? 'pointer' : 'default'}"
                    >
                      <td class="key-cell" style="padding-left: {row.depth * 12}px">
                        {#if row.hasChildren}
                          <span class="expand-icon">
                            {#if expanded.has(row.path)}
                              <ChevronDown size={10} />
                            {:else}
                              <ChevronRight size={10} />
                            {/if}
                          </span>
                        {:else}
                          <span class="indent"></span>
                        {/if}
                        <span class="key">{row.key}</span>
                      </td>
                      <td class="value-cell">
                        <span 
                          class="value"
                          style="color: {getValueColor(row.value)}"
                        >
                          {formatValue(row.value)}
                        </span>
                      </td>
                      <td class="actions-cell">
                        <button 
                          class="action-btn"
                          onclick={(e) => {
                            e.stopPropagation();
                            togglePin(row.path);
                          }}
                          title={pinned.has(row.path) ? 'Unpin' : 'Pin'}
                        >
                          <Pin size={10} class={pinned.has(row.path) ? 'active' : ''} />
                        </button>
                        {#if !pinned.has(row.path)}
                          <button 
                            class="action-btn"
                            onclick={(e) => {
                              e.stopPropagation();
                              toggleHide(row.path);
                            }}
                            title="Hide"
                          >
                            <EyeOff size={10} />
                          </button>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {/if}
          
          <!-- Hidden 그룹 -->
          {#if groupedRows.hidden.length > 0}
            <div class="group-section hidden-section">
              <h4 
                class="group-title collapsible" 
                onclick={() => showHidden = !showHidden}
              >
                <span class="expand-icon">
                  {#if showHidden}
                    <ChevronDown size={10} />
                  {:else}
                    <ChevronRight size={10} />
                  {/if}
                </span>
                <EyeOff size={10} class="group-icon" />
                Hidden ({groupedRows.hidden.length})
              </h4>
              {#if showHidden}
                <table class="json-table">
                  <tbody>
                    {#each groupedRows.hidden as row}
                      <tr 
                        class="table-row hidden" 
                        onclick={() => row.hasChildren && toggleExpand(row.path)}
                        style="cursor: {row.hasChildren ? 'pointer' : 'default'}"
                      >
                        <td class="key-cell" style="padding-left: {row.depth * 12}px">
                          {#if row.hasChildren}
                            <span class="expand-icon">
                              {#if expanded.has(row.path)}
                                <ChevronDown size={10} />
                              {:else}
                                <ChevronRight size={10} />
                              {/if}
                            </span>
                          {:else}
                            <span class="indent"></span>
                          {/if}
                          <span class="key">{row.key}</span>
                          <span class="path-hint">{row.path}</span>
                        </td>
                        <td class="value-cell">
                          <span 
                            class="value"
                            style="color: {getValueColor(row.value)}"
                          >
                            {formatValue(row.value)}
                          </span>
                        </td>
                        <td class="actions-cell">
                          <button 
                            class="action-btn"
                            onclick={(e) => {
                              e.stopPropagation();
                              toggleHide(row.path);
                            }}
                            title="Show"
                          >
                            <Eye size={10} />
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              {/if}
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .devtool-container {
    position: fixed;
    width: 320px;
    height: 360px;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    font-family: monospace;
    font-size: 10px;
    color: #e0e0e0;
  }
  
  .devtool-container.minimized {
    height: auto;
  }
  
  .devtool-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 8px;
    background: #2a2a2a;
    border-bottom: 1px solid #333;
    border-radius: 6px 6px 0 0;
    cursor: move;
    user-select: none;
  }
  
  .devtool-title {
    font-weight: bold;
    color: #00d4ff;
    font-size: 10px;
  }
  
  .header-actions {
    display: flex;
    gap: 2px;
    align-items: center;
  }
  
  .header-btn {
    background: none;
    border: none;
    color: #e0e0e0;
    cursor: pointer;
    padding: 2px;
    font-size: 10px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    transition: background 0.2s;
  }
  
  .header-btn:hover {
    background: #333;
  }
  
  .devtool-body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .section {
    padding: 4px 6px;
    border-bottom: 1px solid #333;
  }
  
  .action-section {
    flex-shrink: 0;
  }
  
  .state-section {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    border-bottom: none;
  }
  
  .section h3 {
    margin: 0 0 2px 0;
    font-size: 9px;
    text-transform: uppercase;
    color: #888;
    letter-spacing: 0.5px;
  }
  
  .action-display {
    background: #2a2a2a;
    padding: 3px 4px;
    border-radius: 3px;
    min-height: 20px;
    display: flex;
    align-items: center;
  }
  
  .action-item {
    display: flex;
    gap: 4px;
    align-items: center;
  }
  
  .action-number {
    color: #888;
    font-size: 9px;
    margin-right: 2px;
  }
  
  .action-type {
    color: #00d4ff;
    font-weight: bold;
    font-size: 9px;
  }
  
  .action-payload {
    color: #b5cea8;
    font-size: 9px;
    max-width: 200px;
    display: inline-block;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }
  
  .no-action {
    color: #666;
    font-style: italic;
    font-size: 9px;
  }
  
  .state-viewer {
    background: #2a2a2a;
    border-radius: 3px;
    flex: 1;
    overflow: auto;
  }
  
  .json-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 9px;
    table-layout: fixed;
  }
  
  .json-table td:first-child {
    width: 50%;
  }
  
  .json-table td:nth-child(2) {
    width: 35%;
  }
  
  .json-table td:last-child {
    width: 15%;
  }
  
  .table-row {
    border-bottom: 1px solid #1a1a1a;
  }
  
  .table-row:hover {
    background: #333;
  }
  
  .table-row.pinned {
    background: #2a3a2a;
  }
  
  .key-cell {
    padding: 1px 4px;
    white-space: nowrap;
  }
  
  .expand-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 10px;
    height: 10px;
    margin-right: 1px;
    color: #888;
  }
  
  .table-row:hover .expand-icon {
    color: #e0e0e0;
  }
  
  .indent {
    display: inline-block;
    width: 11px;
  }
  
  .key {
    color: #9cdcfe;
    font-size: 9px;
  }
  
  .value-cell {
    padding: 1px 4px;
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .value {
    font-size: 9px;
  }
  
  .actions-cell {
    padding: 1px 2px;
    white-space: nowrap;
  }
  
  .action-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #888;
    transition: color 0.2s;
  }
  
  .action-btn:hover {
    color: #e0e0e0;
  }
  
  .action-btn :global(.active) {
    color: #00d4ff;
  }
  
  /* 그룹 섹션 스타일 */
  .group-section {
    margin-bottom: 4px;
  }
  
  .group-section:last-child {
    margin-bottom: 0;
  }
  
  .group-title {
    font-size: 8px;
    font-weight: bold;
    color: #888;
    margin: 0 0 1px 0;
    padding: 1px 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: flex;
    align-items: center;
    gap: 2px;
  }
  
  .group-title :global(.group-icon) {
    color: #666;
  }
  
  .group-title.collapsible {
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 2px;
    user-select: none;
  }
  
  .group-title.collapsible:hover {
    color: #aaa;
  }
  
  .hidden-section {
    border-top: 1px solid #333;
    padding-top: 2px;
    margin-top: 2px;
  }
  
  .table-row.hidden {
    opacity: 0.6;
  }
  
  .table-row.is-pinned {
    background: rgba(0, 212, 255, 0.05);
  }
  
  .path-cell {
    font-family: monospace;
    font-size: 8px;
  }
  
  .full-path {
    color: #9cdcfe;
  }
  
  .path-hint {
    margin-left: 4px;
    font-size: 7px;
    color: #666;
    font-style: italic;
  }
  
  /* 스크롤바 스타일링 */
  .state-viewer::-webkit-scrollbar {
    width: 8px;
  }
  
  .state-viewer::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  .state-viewer::-webkit-scrollbar-thumb {
    background: #444;
    border-radius: 4px;
  }
  
  .state-viewer::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
</style>