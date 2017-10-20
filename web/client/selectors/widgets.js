const {get} = require('lodash');
const {mapSelector} = require('./map');
const defaultTarget = "floating";
module.exports = {
    getFloatingWidgets: state => get(state, `widgets.containers[${defaultTarget}].widgets`),
    getEditingWidget: state => get(state, "widgets.builder.editor"),
    getEditorSettings: state => get(state, "widgets.builder.settings"),
    getDependencies: state => {
        const dependencies = get(state, "widgets.dependencies");
        if (dependencies) {
            return Object.keys(dependencies).reduce((acc, k) => ({
                ...acc,
                [k]: dependencies[k].indexOf("map." === 0) ? get(mapSelector(state), dependencies[k].slice(4)) : get(state, dependencies[k])
            }), {});
        }
        return {};
    }
};
