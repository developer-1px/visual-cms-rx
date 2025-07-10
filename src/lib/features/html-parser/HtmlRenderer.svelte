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
  
  function reconstructSvgHTML(node: any): string {
    if (node.type === 'text') {
      return node.textContent || '';
    }
    
    if (node.type === 'element') {
      const tag = node.tagName;
      const attrs = node.attributes || {};
      
      // 속성을 문자열로 변환
      const attrString = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(' ');
      
      // 자식 요소들 재귀적으로 처리
      const children = node.children || [];
      const childrenHTML = children.map((child: any) => reconstructSvgHTML(child)).join('');
      
      return `<${tag}${attrString ? ' ' + attrString : ''}>${childrenHTML}</${tag}>`;
    }
    
    return '';
  }
</script>

{#if node.type === 'text' && node.textContent}
  {@const isSelected = selection?.nodeId === node.id}
  {@const textParts = renderText(node.textContent, node.id, isSelected)}
  
  <span
    style="display: inline-block; cursor: text;"
    data-editable="text"
    data-node-id={node.id}
    onclick={(e) => handleTextClick(e, node.id)}
  >
    {#if Array.isArray(textParts)}
      {textParts[0]}<span>{textParts[1]}</span>{textParts[2]}
    {:else}
      {textParts}
    {/if}
  </span>
{:else if node.type === 'element'}
  {@const Tag = node.tagName || 'div'}
  {@const editableType = node.attributes?.['data-editable']}
  
  {#if Tag === 'img'}
    <img
      {...node.attributes}
      data-node-id={node.id}
      data-editable="image"
      style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
    />
  {:else if Tag === 'svg'}
    <!-- SVG는 @html로 렌더링 (namespace 이슈 해결) -->
    {@const svgContent = reconstructSvgHTML(node)}
    <div 
      data-node-id={node.id}
      data-editable="icon"
      style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
    >
      {@html svgContent}
    </div>
  {:else if Tag === 'a' || Tag === 'button'}
    <svelte:element 
      this={Tag}
      {...node.attributes}
      data-node-id={node.id}
      data-editable="link"
      style="display: inline-block; cursor: pointer; {node.attributes?.style || ''}"
    >
      {#if node.children}
        {#each node.children as child (child.id)}
          <HtmlRenderer node={child} {selection} {onTextClick} />
        {/each}
      {/if}
    </svelte:element>
  {:else}
    <svelte:element 
      this={Tag}
      {...node.attributes}
      data-node-id={node.id}
      data-editable={editableType}
    >
      {#if node.children}
        {#each node.children as child (child.id)}
          <HtmlRenderer node={child} {selection} {onTextClick} />
        {/each}
      {/if}
    </svelte:element>
  {/if}
{/if}

<style>
</style>