module.exports = {
    hotReloadContext: 'src',
    devPort: 4005,
    microPort: 5005,
    exposes: {
        'dashboard-device': './src/index.tsx'
    },
    shared: [
        'axios',
        'mqtt',
        'mqtt-react-hooks',
        'react',
        'react-dom',
        'react-router-dom',
        '@patternfly/react-core',
        '@tanstack/react-query',
        'html-loader',
        'style-loader',
        'uuid'
    ],
}
