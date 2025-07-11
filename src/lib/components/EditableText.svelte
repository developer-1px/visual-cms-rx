<script lang="ts">
  import type { HtmlNode } from '../entities/editor/types';
  import { dispatch } from '../base/svelte-rx/svelte-rx.svelte';
  import { 텍스트업데이트 } from '../actions/editor/text';
  import { createEditableEventHandlers } from '../utils/editableEvents';
  import { useEditorMode } from '../entities/editor/modeStore';
  import { useHoveredNodeId } from '../entities/editor/hoverStore';
  import { useSelectedId } from '../entities/selection/store';
  import { _편집모드켜기 } from '../actions/editor/mode';
  
  interface Props {
    node: HtmlNode;
  }
  
  let { node }: Props = $props();
  
  const editorMode = $derived(useEditorMode());
  const isEditMode = $derived(editorMode === 'edit');
  
  const hoveredNodeId = $derived(useHoveredNodeId());
  const selectedId = $derived(useSelectedId());
  const { isHovered, editableAttributes } = $derived(createEditableEventHandlers(node, hoveredNodeId));
  
  // 편집 상태 관리 - 컴포넌트 로컬 상태
  let isEditing = $state(false);
  let tempContent = $state(node.textContent || '');
  let spanElement = $state<HTMLSpanElement>();
  
  // 디버깅용
  $effect(() => {
    console.log(`[EditableText] node: ${node.id}, isEditMode: ${isEditMode}`);
  });
  
  // 노드가 변경되면 tempContent 업데이트
  $effect(() => {
    if (!isEditing) {
      tempContent = node.textContent || '';
    }
  });
  
  function handleBlur() {
    isEditing = false;
    // 실제 모델에 변경사항 반영
    if (tempContent !== node.textContent) {
      dispatch(텍스트업데이트({ nodeId: node.id, text: tempContent }));
    }
  }
  
  
  // editableAttributes의 onclick을 오버라이드
  const textEditableAttributes = $derived({
    ...editableAttributes,
    onclick: (e: MouseEvent) => {
      // 이미 선택된 텍스트를 다시 클릭하면 편집 모드로
      if (selectedId === node.id && !isEditMode) {
        dispatch(_편집모드켜기());
        e.stopPropagation();
      } else {
        // 일반 선택 처리
        editableAttributes.onclick(e);
      }
    }
  });
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      // ESC로 편집 취소
      tempContent = node.textContent || '';
      spanElement?.blur();
    }
  }
</script>

{#if isEditMode}
  <span
    bind:this={spanElement}
    bind:textContent={tempContent}
    contenteditable="plaintext-only"
    class="editable-text"
    class:editing={isEditing}
    data-node-id={node.id}
    data-editable="text"
    onblur={handleBlur}
    onkeydown={handleKeydown}
  >
  </span>
{:else}
  <span 
    {...textEditableAttributes}
    class="text-node"
    style="cursor: pointer"
  >{node.textContent}</span>
{/if}

<style>
  .text-node {
    display: inline-block;
    /* 줄바꿈 처리를 위해 pre-wrap 유지 */
    white-space: pre-wrap;
  }
  
  .editable-text {
    display: inline-block;
    cursor: text;
  }

  .editable-text:focus {
    outline: 2px solid #4A90E2;
    background: rgba(74, 144, 226, 0.05);
  }
  
  .editable-text.editing {
    outline: 2px solid #4A90E2;
  }
</style>