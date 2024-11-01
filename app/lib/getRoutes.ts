import * as fs from 'fs' // Add this import statement
import * as path from 'path' // Ensure path is also imported if used

function getRoutes(dir: string, routes: string[] = []) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      getRoutes(fullPath, routes)
    } else if (stat.isFile()) {
      const match = file.match(/^(.+)\.tsx?$/)
      if (match) {
        let routePath = `/${match[1]}`.replace(/_/g, ':').replace(/index/g, '')
        if (routePath.endsWith('/')) {
          routePath = routePath.slice(0, -1)
        }
        routes.push(routePath || '/')
      }
    }
  })

  return routes
}

const routesDir = path.join(__dirname, 'app/routes')
const routes = getRoutes(routesDir)

// Export the routes to a JSON file
fs.writeFileSync(path.join(__dirname, 'app', 'routes.json'), JSON.stringify(routes, null, 2), 'utf-8')
