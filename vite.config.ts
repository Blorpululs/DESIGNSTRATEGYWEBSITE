import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 👈 Important for GitHub Pages
  base: "/DESIGNSTRATEGYWEBSITE/",

  plugins: [
    // The React and Tailwind plugins are both required for Make, even if Tailwind is not being actively used
    react(),
    tailwindcss(),

    // Dev-only layout API (works only in local dev server)
    {
      name: 'builder-layout-api',
      configureServer(server) {
        const layoutPath = path.resolve(__dirname, 'src/content/pages/builder-test.json')

        server.middlewares.use('/api/layout', async (req, res, next) => {
          if (!req.url) return next()

          if (req.method === 'GET') {
            if (!fs.existsSync(layoutPath)) {
              res.statusCode = 204
              res.end()
              return
            }

            const raw = await fs.promises.readFile(layoutPath, 'utf-8')
            let data = null
            try {
              data = JSON.parse(raw)
            } catch {
              data = null
            }
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ data }))
            return
          }

          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk) => {
              body += chunk
            })
            req.on('end', async () => {
              try {
                const payload = JSON.parse(body || '{}')
                if (!payload.data) {
                  res.statusCode = 400
                  res.end('Invalid payload')
                  return
                }

                await fs.promises.mkdir(path.dirname(layoutPath), { recursive: true })
                await fs.promises.writeFile(layoutPath, JSON.stringify(payload.data, null, 2), 'utf-8')
                res.statusCode = 200
                res.end('ok')
              } catch {
                res.statusCode = 500
                res.end('Save failed')
              }
            })
            return
          }

          next()
        })
      },
    },
  ],

  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})