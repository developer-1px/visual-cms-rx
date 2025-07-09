<script lang="ts">
  import { onMount } from 'svelte';
  import { dispatch } from '../../base/svelte-rx/svelte-rx.svelte.js';
  import { parseHtml } from './parser';
  import HtmlRenderer from './HtmlRenderer.svelte';
  import { 
    useEditorState, 
    _문서설정하기, 
    _선택영역설정하기, 
    _선택영역초기화하기,
    _실행취소하기,
    _다시실행하기 
  } from './editorStore';
  import EditOverlay from '../../EditOverlay.svelte';
  import SelectionOverlay from '../../SelectionOverlay.svelte';
  import { useEditMode, _편집모드전환 } from '../../editModeStore';
  
  interface Props {
    html: string;
  }
  
  let { html }: Props = $props();
  let containerRef: HTMLDivElement;
  
  const editorState = $derived(useEditorState());
  const document = $derived(editorState.document);
  const selection = $derived(editorState.selection);
  const isEditMode = $derived(useEditMode());
  
  onMount(() => {
    // Parse the HTML and set it in the store
    const parsedDoc = parseHtml(html);
    dispatch(_문서설정하기(parsedDoc));
  });
  
  function handleTextClick(nodeId: string, offset: number) {
    // 편집 모드에서는 텍스트 클릭 무시 (EditOverlay에서 처리)
    if (isEditMode) return;
    
    // For now, just select the clicked word
    const node = document.nodes.get(nodeId);
    if (!node || node.type !== 'text' || !node.textContent) return;
    
    const text = node.textContent;
    let start = offset;
    let end = offset;
    
    // Find word boundaries
    while (start > 0 && text[start - 1] !== ' ') start--;
    while (end < text.length && text[end] !== ' ') end++;
    
    const newSelection = {
      nodeId,
      start,
      end
    };
    
    dispatch(_선택영역설정하기(newSelection));
  }
  
  function handleContainerClick(e: MouseEvent) {
    // Clear selection if clicking outside text
    if (e.target === containerRef) {
      dispatch(_선택영역초기화하기());
    }
  }
  
  // Handle keyboard shortcuts
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      dispatch(_선택영역초기화하기());
    } else if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        dispatch(_실행취소하기());
      } else if (e.key === 'z' && e.shiftKey || e.key === 'y') {
        e.preventDefault();
        dispatch(_다시실행하기());
      }
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<!-- 편집 모드 토글 버튼 -->
<div class="edit-mode-controls">
  <button 
    class="edit-mode-toggle"
    onclick={() => dispatch(_편집모드전환(!isEditMode))}
  >
    {isEditMode ? '편집 모드 끄기' : '편집 모드 켜기'}
  </button>
  <span class="edit-mode-status">
    {isEditMode ? '편집 모드 ON' : '편집 모드 OFF'}
  </span>
</div>

<div 
  bind:this={containerRef}
  class="html-editor"
  onclick={handleContainerClick}
>
  {#if document.root}
    <HtmlRenderer 
      node={document.root} 
      {selection}
      onTextClick={handleTextClick}
    />
  {/if}
  
  <!-- 편집 모드 오버레이 -->
  <EditOverlay {isEditMode} />
  
  <!-- 선택 영역 표시 -->
  <SelectionOverlay />
</div>

<style>
  .html-editor {
    position: relative;
    min-height: 100vh;
    padding: 20px;
    font-family: system-ui, -apple-system, sans-serif;
    line-height: 1.6;
  }
  
  :global(.html-editor h1, .html-editor h2, .html-editor h3) {
    font-weight: 700;
    margin: 1em 0 0.5em;
  }
  
  :global(.html-editor p) {
    margin: 1em 0;
  }
  
  :global(.html-editor button) {
    cursor: pointer;
    transition: all 0.2s;
  }
  
  :global(.html-editor a) {
    color: inherit;
    text-decoration: none;
    transition: color 0.2s;
  }
  
  :global(.html-editor a:hover) {
    opacity: 0.8;
  }
  
  .edit-mode-controls {
    position: fixed;
    top: 100px;
    right: 20px;
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 10px;
    background: white;
    padding: 10px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .edit-mode-toggle {
    padding: 8px 16px;
    background: #0066ff;
    color: white;
    border: none;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }
  
  .edit-mode-toggle:hover {
    background: #0052cc;
  }
  
  .edit-mode-status {
    font-size: 0.875rem;
    color: #666;
    font-weight: 500;
  }
</style>