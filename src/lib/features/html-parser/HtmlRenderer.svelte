<script lang="ts">
  import HtmlRenderer from './HtmlRenderer.svelte';
  
  interface Props {
    node: any; // HtmlNode from schema
    selection?: any | null; // TextSelection from schema
    onTextClick?: (_nodeId: string, _offset: number) => void;
  }
  
  let { node, selection = null, onTextClick }: Props = $props();
  
  function handleTextClick(e: MouseEvent, nodeId: string) {
    if (!onTextClick) return;
    
    const range = document.caretRangeFromPoint(e.clientX, e.clientY);
    if (range) {
      onTextClick(nodeId, range.startOffset);
    }
  }
  
  function renderText(text: string, nodeId: string, isSelected: boolean) {
    if (!isSelected || !selection) {
      return text;
    }
    
    const { start, end } = selection;
    const before = text.slice(0, start);
    const selected = text.slice(start, end);
    const after = text.slice(end);
    
    return [before, selected, after];
  }
</script>

{#if node.type === 'text' && node.textContent}
  {@const isSelected = selection?.nodeId === node.id}
  {@const textParts = renderText(node.textContent, node.id, isSelected)}
  
  <span 
    class="text-node"
    class:selectable={!!onTextClick}
    data-editable="text"
    data-node-id={node.id}
    onclick={(e) => handleTextClick(e, node.id)}
  >
    {#if Array.isArray(textParts)}
      {textParts[0]}<span class="selected-text">{textParts[1]}</span>{textParts[2]}
    {:else}
      {textParts}
    {/if}
  </span>
{:else if node.type === 'element'}
  {@const Tag = node.tagName || 'div'}
  {@const isRepeatable = ['li', 'tr', 'article', 'section'].includes(Tag) || 
    node.attributes?.class?.includes('card') || 
    node.attributes?.class?.includes('item') ||
    node.attributes?.class?.includes('group')}
  <svelte:element 
    this={Tag}
    {...node.attributes}
    data-node-id={node.id}
    data-editable={isRepeatable ? 'repeat' : undefined}
  >
    {#if node.children}
      {#each node.children as child (child.id)}
        <HtmlRenderer node={child} {selection} {onTextClick} />
      {/each}
    {/if}
  </svelte:element>
{/if}

<style>
  .text-node.selectable {
    cursor: text;
  }
  
  .text-node.selectable:hover {
    background-color: rgba(0, 123, 255, 0.1);
  }
  
  .selected-text {
    background-color: rgba(0, 123, 255, 0.3);
    color: #000;
  }
</style>