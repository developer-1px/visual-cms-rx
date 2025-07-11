import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import svelteCommentInjector from '@gitbutler/svelte-comment-injector'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    svelte({
      preprocess: [svelteCommentInjector()]
    })
  ],
})
