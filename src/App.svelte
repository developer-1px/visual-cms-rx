<script lang="ts">
  import NCloudSampleEditable from './pages/NCloudSampleEditable.svelte'
  import DevTool from './lib/widgets/DevTool.svelte'
  // Initialize stores
  import './lib/features/html-parser/editorStore'
</script>

<NCloudSampleEditable />

<!-- DevTool로 상태 디버깅 -->
<DevTool />