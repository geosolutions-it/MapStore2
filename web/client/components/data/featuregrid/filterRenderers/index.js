const {withProps} = require('recompose');
const DefaultFilter = require('./DefaultFilter');
const StringFilter = require('./StringFilter');
const NumberFilter = require('./NumberFilter');
const DateTimeFilter = require('./DateTimeFilter');
const types = {
    "defaultFilter": (p, type) => withProps(() =>({type: type}))(DefaultFilter),
    "string": () => StringFilter,
    "number": () => NumberFilter,
    "integer": () => NumberFilter,
    "date": () => withProps(() =>({type: "date"}))(DateTimeFilter),
    "time": () => withProps(() =>({type: "time"}))(DateTimeFilter),
    "date-time": () => withProps(() =>({type: "date-time"}))(DateTimeFilter)
};
module.exports = (type, props) => types[type] ? types[type](props) : types.defaultFilter(props, type);
