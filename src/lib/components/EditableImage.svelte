<script lang="ts">
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

<img
  {...node.attributes}
  {...editableAttributes}
  style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
  alt={node.attributes?.alt || ''}
/>

<style>
  /* 이미지 특화 스타일 */
  img {
    max-width: 100%;
    height: auto;
    vertical-align: middle;
  }
</style>