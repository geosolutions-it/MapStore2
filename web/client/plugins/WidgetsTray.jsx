

const WidgetsTray = require('./widgets/WidgetsTray');
const autoDisableWidgets = require('./widgets/autoDisableWidgets');

/**
 * Plugin that shows collapsed widgets
 * @name CollapsedWidgetBar
 * @memberof plugins
 * @class
 */
module.exports = {
    WidgetsTrayPlugin: autoDisableWidgets(WidgetsTray)
};
