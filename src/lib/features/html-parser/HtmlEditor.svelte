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
  import EditOverlay from '../../modules/editor/EditOverlay.svelte';
  import SelectionOverlay from '../../modules/editor/SelectionOverlay.svelte';
  import { useEditorMode } from '../../entities/editor/modeStore';
  import { _편집모드전환 } from '../../actions/editor/mode';
  import { Edit3, MousePointer } from 'lucide-svelte';
  
  interface Props {
    html: string;
  }
  
  let { html }: Props = $props();
  let containerRef: HTMLDivElement;
  
  const editorState = $derived(useEditorState());
  const document = $derived(editorState.document);
  const selection = $derived(editorState.selection);
  const editorMode = $derived(useEditorMode());
  const isEditMode = $derived(editorMode === 'edit');
  
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

<!-- 하단 툴바 -->
<div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000]">
  <!-- Debug: Show current mode -->
  <div class="text-white text-xs mb-2 text-center bg-black/60 px-2 py-1 rounded">
    Mode: {editorMode}
  </div>
  <div class="flex items-center gap-1 p-2 bg-black/85 backdrop-blur-md rounded-xl shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_32px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)] hover:scale-[1.02] transition-transform">
    <button 
      class="flex items-center justify-center w-10 h-10 rounded-lg transition-all relative
        {!isEditMode ? 'bg-blue-500/30 text-blue-300' : 'text-white/60 hover:bg-white/10 hover:text-white/90 active:scale-95'}"
      onclick={() => dispatch(_편집모드전환(false))}
      title="선택 모드"
    >
      <MousePointer size={20} />
      {#if !isEditMode}
        <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-500 rounded-sm"></span>
      {/if}
    </button>
    <div class="w-px h-6 bg-white/10 mx-1"></div>
    <button 
      class="flex items-center justify-center w-10 h-10 rounded-lg transition-all relative
        {isEditMode ? 'bg-blue-500/30 text-blue-300' : 'text-white/60 hover:bg-white/10 hover:text-white/90 active:scale-95'}"
      onclick={() => dispatch(_편집모드전환(true))}
      title="편집 모드"
    >
      <Edit3 size={20} />
      {#if isEditMode}
        <span class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-500 rounded-sm"></span>
      {/if}
    </button>
  </div>
</div>

<div 
  bind:this={containerRef}
  class="html-editor {!isEditMode ? 'select-mode' : ''}"
  onclick={handleContainerClick}
>
  {#if document.root}
    <HtmlRenderer 
      node={document.root} 
      {selection}
      onTextClick={handleTextClick}
    />
  {/if}
  
  <!-- 호버 및 선택 오버레이 (선택/편집 모드 둘 다에서 작동) -->
  <EditOverlay />
  
  <!-- 선택 영역 표시 -->
  <SelectionOverlay />
</div>

<style>
  .html-editor {
    position: relative;
    min-height: 100vh;
  }
  
  /* 선택 모드에서는 모든 요소가 default 커서 */
  .html-editor.select-mode,
  .html-editor.select-mode :global(*) {
    cursor: default !important;
  }
  
</style>