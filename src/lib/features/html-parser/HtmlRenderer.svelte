<script lang="ts">
  import HtmlRenderer from './HtmlRenderer.svelte';
  import EditableText from '../../components/EditableText.svelte';
  import EditableIcon from '../../components/EditableIcon.svelte';
  import EditableImage from '../../components/EditableImage.svelte';
  import EditableButton from '../../components/EditableButton.svelte';
  import EditableLink from '../../components/EditableLink.svelte';
  import EditableElement from '../../components/EditableElement.svelte';
  
  interface Props {
    node: any; // HtmlNode from schema
    selection?: any | null; // TextSelection from schema
    onTextClick?: (_nodeId: string, _offset: number) => void;
  }
  
  let { node, selection = null, onTextClick }: Props = $props();
  
  
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
  <EditableText {node} />
{:else if node.type === 'element'}
  {@const Tag = node.tagName || 'div'}
  
  {#if node.editableType === 'icon'}
    <EditableIcon {node} />
  {:else if node.editableType === 'image'}
    <EditableImage {node} />
  {:else if node.editableType === 'button'}
    <EditableButton {node} />
  {:else if node.editableType === 'link'}
    <EditableLink {node} />
  {:else if node.editableType === 'repeat' || node.editableType === 'section'}
    <!-- repeat와 section 타입들 -->
    <EditableElement {node}>
      {#snippet children()}
        {#if node.children}
          {#each node.children as child (child.id)}
            <HtmlRenderer node={child} {selection} {onTextClick} />
          {/each}
        {/if}
      {/snippet}
    </EditableElement>
  {:else if node.editableType}
    <!-- 기타 editable 타입들 -->
    <EditableElement {node}>
      {#snippet children()}
        {#if node.children}
          {#each node.children as child (child.id)}
            <HtmlRenderer node={child} {selection} {onTextClick} />
          {/each}
        {/if}
      {/snippet}
    </EditableElement>
  {:else}
    <!-- 일반 HTML 요소 (editable 아님) -->
    <svelte:element 
      this={Tag}
      {...node.attributes}
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