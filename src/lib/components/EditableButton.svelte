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

<button
  {...node.attributes}
  {...editableAttributes}
  type="button"
  style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
  class="editable-button {node.attributes?.class || ''}"
>
  {#if node.children}
    {#each node.children as child (child.id)}
      <HtmlRenderer node={child} />
    {/each}
  {:else}
    {node.textContent || 'Button'}
  {/if}
</button>

<style>
  .editable-button:focus {
    outline: 2px solid #4A90E2;
    outline-offset: 2px;
  }
</style>