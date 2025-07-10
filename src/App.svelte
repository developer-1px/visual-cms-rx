<script lang="ts">
  import { onMount } from 'svelte'
  import NCloudSampleEditable from './pages/NCloudSampleEditable.svelte'
  import DevTool from './lib/widgets/DevTool.svelte'
  import { setupHotkeys, cleanupHotkeys } from './lib/base/keyboard/setupHotkeys'
  // Initialize stores
  import './lib/features/html-parser/editorStore'
  
  onMount(() => {
    setupHotkeys();
    return cleanupHotkeys;
  });
</script>

<NCloudSampleEditable />

<!-- DevTool로 상태 디버깅 -->
<DevTool />