/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {connect} = require('react-redux');

const Localized = require('../../../components/I18N/Localized');

// include application component
const QueryBuilder = require('../../../components/QueryForm/QueryBuilder');


const {bindActionCreators} = require('redux');
const {addFilterField, removeFilterField,
    updateFilterField, updateExceptionField} = require('../../../actions/queryform');

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

module.exports = connect((state) => {
    return {
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined
    };
})(React.createClass({
    propTypes: {
        messages: React.PropTypes.object,
        locale: React.PropTypes.string,
        localeError: React.PropTypes.string
    },
    render() {
        return (
            <Localized messages={this.props.messages} locale={this.props.locale} loadingError={this.props.localeError}>
                <SmartQueryForm/>
            </Localized>
        );
    }
}));
