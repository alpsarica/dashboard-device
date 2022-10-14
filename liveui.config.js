module.exports = {
    hotReloadContext: 'src',
    devPort: 4005,
    microPort: 5005,
    exposes: {
        'dashboard-device': './src/index.tsx'
    },
    shared: [
        'react',
        'react-dom',
        "react-router-dom",
        '@patternfly/react-core',
        "@patternfly/react-icons",
        "html-loader",
        "style-loader",
        'uuid',
        'graphql',
        '@apollo/client'   
    ],
}
