module.exports = function(api) {
    api.cache(true);
    return {
        "presets": [
            "@babel/env",
            "@babel/preset-react"
        ],
        "plugins": [
            "@babel/plugin-proposal-class-properties",
            "@babel/plugin-syntax-dynamic-import",
            ["transform-imports", {
                "lodash": {
                    "transform": "lodash/${member}",
                    "preventFullImport": true
                }
            }]
        ],
        "env": {
            "test": {
                "plugins": ["istanbul"]
            }
        }
    };
};
