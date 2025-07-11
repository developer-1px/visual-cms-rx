<script lang="ts">
  import HtmlRenderer from '../features/html-parser/HtmlRenderer.svelte';
  import type { HtmlNode } from '../entities/editor/types';
  import { createEditableEventHandlers } from '../utils/editableEvents';
  import { useHoveredNodeId } from '../entities/editor/hoverStore';
  
  interface Props {
    node: HtmlNode;
  }
  
  let { node }: Props = $props();
  
  const hoveredNodeId = $derived(useHoveredNodeId());
  const { isHovered, editableAttributes } = $derived(createEditableEventHandlers(node, hoveredNodeId));
</script>

<a
  {...node.attributes}
  {...editableAttributes}
  href={node.attributes?.href || '#'}
  style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
  class="editable-link {node.attributes?.class || ''}"
  tabindex="-1"
>
  {#if node.children}
    {#each node.children as child (child.id)}
      <HtmlRenderer node={child} />
    {/each}
  {:else}
    {node.textContent || 'Link'}
  {/if}
</a>

<style>
  .editable-link {
    /* 링크 기본 스타일 유지하되 편집 모드에서는 클릭 방지 */
    pointer-events: none;
    text-decoration: underline;
    color: #0066cc;
  }
  
  .editable-link:focus {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
  }
</style>