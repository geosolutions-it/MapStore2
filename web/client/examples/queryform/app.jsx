const React = require('react');
const ReactDOM = require('react-dom');

const {connect, Provider} = require('react-redux');

// include application component
const QueryBuilder = require('../../components/QueryForm/QueryBuilder');

// initializes Redux store
var store = require('./stores/queryformstore');

const {bindActionCreators} = require('redux');
const {addFilterField, removeFilterField,
    updateFilterField, updateExceptionField} = require('../../actions/queryform');

// connecting a Dumb component to the store
// makes it a smart component
// we both connect state => props
// and actions to event handlers
const SmartQueryForm = connect((state) => {
    return {
        filterFields: state.queryForm.filterFields,
        attributes: state.queryForm.attributes
    };
}, (dispatch) => bindActionCreators({
    onAddFilterField: addFilterField,
    onRemoveFilterField: removeFilterField,
    onUpdateFilterField: updateFilterField,
    onUpdateExceptionField: updateExceptionField
}, dispatch))(QueryBuilder);

// we spread the store to the all application
// wrapping it with a Provider component
const QueryFormApp = React.createClass({
    render() {
        return (
        <Provider store={store}>
            <SmartQueryForm/>
        </Provider>);
    }
});

// Renders the application, wrapped by the Redux Provider to connect the store to components
ReactDOM.render(<QueryFormApp/>, document.getElementById('container'));
