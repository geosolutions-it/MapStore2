const {compose, withProps, withState} = require('recompose');
const DefaultFilter = require('./DefaultFilter');
const StringFilter = require('./StringFilter');
const NumberFilter = require('./NumberFilter');
const DateTimeFilter = require('./DateTimeFilter');
const enhanceManageValueState = ({disabled} = {}) => compose(
    withProps({disabled}),
    withState("value", "onValueChange", event => {
        return event.value;
    })

    /*
    withState("value", "onValueChange"),

    withHandlers({
        onUnmount: ({onValueChange}) => d => onValueChange(d.value)

    }),*/

);
const types = {
    "defaultFilter": (type, props) => withProps(() =>({type: type}))(enhanceManageValueState(props)(DefaultFilter)),
    "string": (type, props) => enhanceManageValueState(props)(StringFilter),
    "number": (type, props) => enhanceManageValueState(props)(NumberFilter),
    "integer": (type, props) => enhanceManageValueState(props)(NumberFilter),
    "date": (type, props) => withProps(() =>({type: "date"}))(enhanceManageValueState(props)(DateTimeFilter)),
    "time": (type, props) => withProps(() =>({type: "time"}))(enhanceManageValueState(props)(DateTimeFilter)),
    "date-time": (type, props) => withProps(() =>({type: "date-time"}))(enhanceManageValueState(props)(DateTimeFilter))
};
module.exports = (type, props) => types[type] ? types[type](type, props) : types.defaultFilter(type, props);
