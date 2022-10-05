const port = process.env.MAPSTORE_BACKEND_PORT || 8080;
const protocol = process.env.MAPSTORE_BACKEND_PROTOCOL || "http";
const host = process.env.MAPSTORE_BACKEND_HOST || "localhost";
const MAPSTORE_BACKEND_BASE_URL = process.env.MAPSTORE_BACKEND_BASE_URL || (protocol + "://" + host + ":" + port);
const MAPSTORE_BACKEND_BASE_PATH = process.env.MAPSTORE_BACKEND_BASE_PATH || "/mapstore";
var matches = MAPSTORE_BACKEND_BASE_URL.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
var domain = matches && matches[1];
// configuration for local dev server. This is used by webpack-dev-server
// to proxy requests to the backend.
const devServer = {
    proxy: {
        '/rest': {
            target: `${MAPSTORE_BACKEND_BASE_URL}${MAPSTORE_BACKEND_BASE_PATH}`,
            secure: false,
            logLevel: "debug"
        },
        '/pdf': {
            target: `${MAPSTORE_BACKEND_BASE_URL}${MAPSTORE_BACKEND_BASE_PATH}`,
            secure: false,
            headers: {
                host: domain
            }
        },
        '/proxy': {
            target: `${MAPSTORE_BACKEND_BASE_URL}${MAPSTORE_BACKEND_BASE_PATH}`,
            secure: false,
            headers: {
                host: domain
            }
        },
        '/extensions.json': {
            target: `${MAPSTORE_BACKEND_BASE_URL}${MAPSTORE_BACKEND_BASE_PATH}`,
            secure: false,
            headers: {
                host: domain
            }
        },
        '/dist/extensions': {
            target: `${MAPSTORE_BACKEND_BASE_URL}${MAPSTORE_BACKEND_BASE_PATH}`,
            secure: false,
            headers: {
                host: domain
            }
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
