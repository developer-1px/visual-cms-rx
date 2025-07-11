<script lang="ts">
  import type { HtmlNode } from '../entities/editor/types';
  import { createEditableEventHandlers } from '../utils/editableEvents';
  import { useHoveredNodeId } from '../entities/editor/hoverStore';
  
  interface Props {
    node: HtmlNode;
    children?: any;
  }
  
  let { node, children }: Props = $props();
  
  const hoveredNodeId = $derived(useHoveredNodeId());
  const { isHovered, editableAttributes } = $derived(createEditableEventHandlers(node, hoveredNodeId));
  
  // 동적 태그 결정
  const Tag = $derived(node.tagName || 'div');
</script>

<svelte:element 
  this={Tag}
  {...node.attributes}
  {...editableAttributes}
  style="cursor: pointer; {node.attributes?.style || ''}"
>
  {#if children}
    {@render children()}
  {/if}
</svelte:element>

<style>
  /* repeat와 section 요소를 위한 스타일 */
</style>