import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'WyrdCryCards'
  const isProductionBuild = process.env.NODE_ENV === 'production'
  const base = isProductionBuild ? `/${repositoryName}/` : '/'

  return {
    plugins: [react()],
    base,
  }
})
