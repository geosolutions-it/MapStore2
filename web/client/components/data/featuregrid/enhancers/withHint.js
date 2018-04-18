
const {compose, branch} = require('recompose');
const tooltip = require('../../../misc/enhancers/tooltip');
const withPopover = require('./withPopover');
module.exports = compose(
    branch(
        (({renderPopover, popoverOptions} = {}) => renderPopover && !!popoverOptions),
        withPopover,
        tooltip
    )
);
