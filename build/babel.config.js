module.exports = function(api) {
    api.cache(true);
    return {
        "presets": [
            "@babel/env",
            "@babel/preset-react"
        ],
        "plugins": [
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
