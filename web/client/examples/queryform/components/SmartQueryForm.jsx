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
const QueryBuilder = require('../../../components/data/query/QueryBuilder');

const {bindActionCreators} = require('redux');
const {
    // QueryBuilder action functions
    addGroupField,
    addFilterField,
    removeFilterField,
    updateFilterField,
    updateExceptionField,
    updateLogicCombo,
    removeGroupField,
    changeCascadingValue,
    expandAttributeFilterPanel,
    expandSpatialFilterPanel,
    selectSpatialMethod,
    selectSpatialOperation,
    removeSpatialSelection,
    showSpatialSelectionDetails
} = require('../../../actions/queryform');

const {
    changeDrawingStatus,
    endDrawing
} = require('../../../actions/draw');

// connecting a Dumb component to the store
// makes it a smart component
// we both connect state => props
// and actions to event handlers
const SmartQueryForm = connect((state) => {
    return {
        // QueryBuilder props
        useMapProjection: state.queryform.useMapProjection,
        groupLevels: state.queryform.groupLevels,
        groupFields: state.queryform.groupFields,
        filterFields: state.queryform.filterFields,
        attributes: state.queryform.attributes,
        spatialField: state.queryform.spatialField,
        showDetailsPanel: state.queryform.showDetailsPanel,
        attributePanelExpanded: state.queryform.attributePanelExpanded,
        spatialPanelExpanded: state.queryform.spatialPanelExpanded
    };
}, dispatch => {
    return {
        attributeFilterActions: bindActionCreators({
            onAddGroupField: addGroupField,
            onAddFilterField: addFilterField,
            onRemoveFilterField: removeFilterField,
            onUpdateFilterField: updateFilterField,
            onUpdateExceptionField: updateExceptionField,
            onUpdateLogicCombo: updateLogicCombo,
            onRemoveGroupField: removeGroupField,
            onChangeCascadingValue: changeCascadingValue,
            onExpandAttributeFilterPanel: expandAttributeFilterPanel
        }, dispatch),
        spatialFilterActions: bindActionCreators({
            onExpandSpatialFilterPanel: expandSpatialFilterPanel,
            onSelectSpatialMethod: selectSpatialMethod,
            onSelectSpatialOperation: selectSpatialOperation,
            onChangeDrawingStatus: changeDrawingStatus,
            onRemoveSpatialSelection: removeSpatialSelection,
            onShowSpatialSelectionDetails: showSpatialSelectionDetails,
            onEndDrawing: endDrawing
        }, dispatch)
    };
})(QueryBuilder);

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
                <div style={{
                        height: "750px",
                        width: "850px",
                        maxHeight: "750px",
                        overflowX: "hidden",
                        overflowY: "auto",
                        position: "absolute",
                        top: "50px",
                        left: "670px"}}>
                    <SmartQueryForm/>
                </div>
            </Localized>
        );
    }
}));
