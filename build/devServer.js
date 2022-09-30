const port = process.env.MAPSTORE_BACKEND_PORT || 8080;
const MAPSTORE_BACKEND_BASE_URL = "http://localhost:" + port;

// configuration for local dev server. This is used by webpack-dev-server
// to proxy requests to the backend.
const devServer = {
    publicPath: "/dist/",
    proxy: {
        '/rest': {
            target: `${MAPSTORE_BACKEND_BASE_URL}/mapstore`
        },
        '/pdf': {
            target: `${MAPSTORE_BACKEND_BASE_URL}/mapstore`
        },
        '/proxy': {
            target: `${MAPSTORE_BACKEND_BASE_URL}/mapstore`
        },
        '/extensions.json': {
            target: `${MAPSTORE_BACKEND_BASE_URL}/mapstore`
        },
        '/dist/extensions': {
            target: `${MAPSTORE_BACKEND_BASE_URL}/mapstore`
        },
        '/docs': {
            target: "http://localhost:8081",
            pathRewrite: {'/docs': '/mapstore/docs'}
        }
    }
};
module.exports = {
    devServer,
    devtool: undefined
};
