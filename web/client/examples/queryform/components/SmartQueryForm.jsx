const PropTypes = require('prop-types');
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
    selectViewportSpatialMethod,
    expandSpatialFilterPanel,
    selectSpatialMethod,
    selectSpatialOperation,
    removeSpatialSelection,
    showSpatialSelectionDetails,
    reset,
    changeDwithinValue,
    zoneGetValues,
    zoneSearch,
    zoneChange
} = require('../../../actions/queryform');

const {query} = require('../actions/query');

const {
    changeDrawingStatus,
    endDrawing
} = require('../../../actions/draw');

const assign = require('object-assign');

const attributesSelector = (state) => state.query.featureTypes["topp:states"] && state.query.featureTypes["topp:states"].attributes && state.query.data["topp:states"] &&
        state.query.featureTypes["topp:states"].attributes.map((attribute) => {
            return assign({}, attribute, {values: state.query.data["topp:states"][attribute.attribute]});
        })
     || [];  //   &&

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
        attributes: attributesSelector(state),
        spatialField: state.queryform.spatialField,
        spatialOperations: [
        {"id": "INTERSECTS", "name": "queryform.spatialfilter.operations.intersects"},
        {"id": "BBOX", "name": "queryform.spatialfilter.operations.bbox"},
        {"id": "CONTAINS", "name": "queryform.spatialfilter.operations.contains"},
        {"id": "WITHIN", "name": "queryform.spatialfilter.operations.within"}
        ],
        spatialMethodOptions: [
        {"id": "Viewport", "name": "queryform.spatialfilter.methods.viewport"},
        {"id": "BBOX", "name": "queryform.spatialfilter.methods.box"},
        {"id": "Circle", "name": "queryform.spatialfilter.methods.circle"},
        {"id": "Polygon", "name": "queryform.spatialfilter.methods.poly"}
    ],
        showDetailsPanel: state.queryform.showDetailsPanel,
        toolbarEnabled: state.queryform.toolbarEnabled,
        attributePanelExpanded: state.queryform.attributePanelExpanded,
        spatialPanelExpanded: state.queryform.spatialPanelExpanded,
        searchUrl: "http://demo.geo-solutions.it/geoserver/ows?service=WFS",
        featureTypeName: "topp:states",
        ogcVersion: "1.1.0",
        resultTitle: "Query Result",
        showGeneratedFilter: false
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
            onSelectViewportSpatialMethod: selectViewportSpatialMethod,
            onRemoveSpatialSelection: removeSpatialSelection,
            onShowSpatialSelectionDetails: showSpatialSelectionDetails,
            onEndDrawing: endDrawing,
            onChangeDwithinValue: changeDwithinValue,
            zoneFilter: zoneGetValues,
            zoneSearch,
            zoneChange
        }, dispatch),
        queryToolbarActions: bindActionCreators({
            onQuery: query,
            onReset: reset,
            onChangeDrawingStatus: changeDrawingStatus
        }, dispatch)
    };
})(QueryBuilder);

module.exports = connect((state) => {
    return {
        messages: state.locale ? state.locale.messages : null,
        locale: state.locale ? state.locale.current : null,
        localeError: state.locale && state.locale.loadingError ? state.locale.loadingError : undefined
    };
})(class extends React.Component {
    static propTypes = {
        messages: PropTypes.object,
        locale: PropTypes.string,
        localeError: PropTypes.string
    };

    render() {
        return (
            <Localized messages={this.props.messages} locale={this.props.locale} loadingError={this.props.localeError}>
                <SmartQueryForm/>
            </Localized>
        );
    }
});
