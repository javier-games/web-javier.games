const path = require('path')
const os = require('os')
const { merge } = require('webpack-merge')
const commonConfiguration = require('./webpack.common.js')
const portFinderSync = require('portfinder-sync')

const getLocalIp = () => {
    const interfaces = os.networkInterfaces()
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                return iface.address
            }
        }
    }
    return '127.0.0.1'
}

const infoColor = (_message) =>
{
    return `\u001b[1m\u001b[34m${_message}\u001b[39m\u001b[22m`
}

module.exports = merge(
    commonConfiguration,
    {
        stats: 'errors-warnings',
        mode: 'development',
        infrastructureLogging:
        {
            level: 'warn',
        },
        devServer:
        {
            host: 'local-ip',
            port: portFinderSync.getPort(8080),
            open: true,
            allowedHosts: 'all',
            hot: false,
            watchFiles: ['src/**', 'static/**'],
            static:
            {
                watch: true,
                directory: path.join(__dirname, '../static')
            },
            client:
            {
                logging: 'none',
                overlay: true,
                progress: false
            },
            setupMiddlewares: function(middlewares, devServer)
            {
                const port = devServer.options.port
                const localIp = getLocalIp()
                const domain1 = `http://${localIp}:${port}`
                const domain2 = `http://localhost:${port}`

                console.log(`Project running at:\n  - ${infoColor(domain1)}\n  - ${infoColor(domain2)}`)

                return middlewares
            }
        }
    }
)
