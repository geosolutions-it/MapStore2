const {compose, withStateHandlers} = require('recompose');


module.exports = compose(
    // defaultProps({dataStreamFactory}),
    withStateHandlers(({activeRule: initRule}) => ({
        activeRule: initRule,
        initRule,
        activeEditor: "1"
    }), {
        setOption: ({activeRule}) => ({key, value}) => {
            // Add some reference logic here
            if (key === "workspace" && !value) {
                const {layer, workspace, ...newActive} = activeRule;
                return {activeRule: newActive};
            }else if (key === "service" && !value) {
                const {request, service, ...newActive} = activeRule;
                return {activeRule: newActive};
            }else if (!value) {
                const {[key]: omit, ...newActive} = activeRule;
                return {activeRule: newActive};
            }
            return {
                activeRule: {...activeRule, [key]: value}
            };
        },
        onNavChange: () => activeEditor => ({
            activeEditor
        })
    })
);
