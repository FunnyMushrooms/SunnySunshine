import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repository = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? ''
const isUserOrOrgPagesRepo = repository.endsWith('.github.io')

const base = isUserOrOrgPagesRepo
  ? '/'
  : repository
    ? `/${repository}/`
    : '/'

export default defineConfig({
  plugins: [react()],
  base,
})
