const { createServer } = require('https')
const { createServer: createHttpServer } = require('http')
const { parse } = require('url')
const next = require('next')
const fs = require('fs')
const path = require('path')
const selfsigned = require('selfsigned')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

// Generate self-signed certificates if they don't exist
const certsDir = path.join(__dirname, 'certificates')
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir)
}

const certPath = path.join(certsDir, 'localhost.pem')
const keyPath = path.join(certsDir, 'localhost-key.pem')

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.log('Generating self-signed certificates...')
  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems = selfsigned.generate(attrs, { days: 365 })
  
  fs.writeFileSync(certPath, pems.cert)
  fs.writeFileSync(keyPath, pems.private)
  console.log('Certificates generated successfully!')
}

// SSL certificate options
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath)
}

app.prepare().then(() => {
  // Create HTTPS server
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  }).listen(3001, (err) => {
    if (err) throw err
    console.log('> Ready on https://localhost:3001')
  })

  // Also create HTTP server to redirect to HTTPS
  createHttpServer((req, res) => {
    res.writeHead(301, { "Location": "https://localhost:3001" + req.url })
    res.end()
  }).listen(3000, (err) => {
    if (err) throw err
    console.log('> HTTP server redirecting to HTTPS on port 3000')
  })
}) 