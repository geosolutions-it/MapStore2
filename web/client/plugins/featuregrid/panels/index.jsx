/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

const React = require('react');
const {connect} = require('react-redux');
const {bindActionCreators} = require('redux');
const {createSelector, createStructuredSelector} = require('reselect');
const {widgetBuilderAvailable, wfsDownloadAvailable} = require('../../../selectors/controls');
const {paginationInfo, featureLoadingSelector, resultsSelector, isSyncWmsActive, featureCollectionResultSelector} = require('../../../selectors/query');
const { getTitleSelector, modeSelector, selectedFeaturesCount, hasChangesSelector, hasGeometrySelector, isSimpleGeomSelector, hasNewFeaturesSelector, isSavingSelector, isSavedSelector, isDrawingSelector, getAttributeFilter, hasSupportedGeometry, timeSyncActive, showTimeSync, isEditingAllowedSelector} = require('../../../selectors/featuregrid');
const {isCesium} = require('../../../selectors/maptype');
const {mapLayoutValuesSelector} = require('../../../selectors/maplayout');
const {chartDisabledSelector, showAgainSelector, showPopoverSyncSelector, selectedLayerNameSelector} = require('../../../selectors/featuregrid');
const {deleteFeatures, toggleTool, clearChangeConfirmed, closeFeatureGridConfirmed, closeFeatureGrid} = require('../../../actions/featuregrid');
const {toolbarEvents, pageEvents} = require('../index');
const {getFilterRenderer} = require('../../../components/data/featuregrid/filterRenderers');
const {isDescribeLoaded, isFilterActive} = require('../../../selectors/query');
const {getFeatureTypeProperties, isGeometryType} = require('../../../utils/ogc/WFS/base');

const EmptyRowsView = connect(createStructuredSelector({
    loading: featureLoadingSelector
}))(require('../../../components/data/featuregrid/EmptyRowsView'));
const Toolbar = connect(
    createStructuredSelector({
        saving: isSavingSelector,
        saved: isSavedSelector,
        mode: modeSelector,
        hasChanges: hasChangesSelector,
        hasNewFeatures: hasNewFeaturesSelector,
        hasGeometry: hasGeometrySelector,
        syncPopover: state => ({
            showAgain: showAgainSelector(state),
            showPopoverSync: showPopoverSyncSelector(state),
            dockSize: mapLayoutValuesSelector(state, {dockSize: true}).dockSize + 3.2 + "%"
        }),
        isDrawing: isDrawingSelector,
        showChartButton: state => !chartDisabledSelector(state) && widgetBuilderAvailable(state),
        isSimpleGeom: isSimpleGeomSelector,
        selectedCount: selectedFeaturesCount,
        disableToolbar: state => state && state.featuregrid && state.featuregrid.disableToolbar || !isDescribeLoaded(state, selectedLayerNameSelector(state)),
        displayDownload: wfsDownloadAvailable,
        disableDownload: state => (resultsSelector(state) || []).length === 0,
        isDownloadOpen: state => state && state.controls && state.controls.wfsdownload && state.controls.wfsdownload.enabled,
        isSyncActive: isSyncWmsActive,
        isColumnsOpen: state => state && state.featuregrid && state.featuregrid.tools && state.featuregrid.tools.settings,
        disableZoomAll: (state) => state && state.featuregrid.virtualScroll || featureCollectionResultSelector(state).features.length === 0,
        isSearchAllowed: (state) => !isCesium(state),
        isEditingAllowed: isEditingAllowedSelector,
        hasSupportedGeometry,
        isFilterActive,
        showTimeSyncButton: showTimeSync,
        timeSync: timeSyncActive
    }),
    (dispatch) => ({events: bindActionCreators(toolbarEvents, dispatch)})
)(require('../../../components/data/featuregrid/toolbars/Toolbar'));


const Header = connect(
    createSelector(
        getTitleSelector,
        (title) => ({title})),
    {
        onClose: toolbarEvents.onClose
    }
)(require('../../../components/data/featuregrid/Header'));

// loading={props.featureLoading} totalFeatures={props.totalFeatures} resultSize={props.resultSize}/
const Footer = connect(
    createSelector(
        createStructuredSelector(paginationInfo),
        featureLoadingSelector,
        state => state && state.featuregrid && !!state.featuregrid.virtualScroll,
        (pagination, loading, virtualScroll) => ({
            ...pagination,
            loading,
            virtualScroll
        })),
    pageEvents
)(require('../../../components/data/featuregrid/Footer'));
const DeleteDialog = connect(
    createSelector(selectedFeaturesCount, (count) => ({count})), {
        onClose: () => toggleTool("deleteConfirm", false),
        onConfirm: () => deleteFeatures()
    })(require('../../../components/data/featuregrid/dialog/ConfirmDelete'));
const ClearDialog = connect(
    createSelector(selectedFeaturesCount, (count) => ({count})), {
        onClose: () => toggleTool("clearConfirm", false),
        onConfirm: () => clearChangeConfirmed()
    })(require('../../../components/data/featuregrid/dialog/ConfirmClear'));
const FeatureCloseDialog = connect(() => {}
    , {
        onClose: () => closeFeatureGridConfirmed(),
        onConfirm: () => closeFeatureGrid()
    })(require('../../../components/data/featuregrid/dialog/ConfirmFeatureClose'));

const panels = {
    settings: require('./AttributeSelector')
};

const dialogs = {
    deleteConfirm: DeleteDialog,
    featureCloseConfirm: FeatureCloseDialog,
    clearConfirm: ClearDialog
};
const panelDefaultProperties = {
    settings: {
        style: { padding: '0 12px', overflow: "auto", flex: "0 0 14em", boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.4)", height: "100%", minWidth: 195}
    }
};

module.exports = {
    getPanels: (tools = {}) =>
        Object.keys(tools)
            .filter(t => tools[t] && panels[t])
            .map(t => {
                const Panel = panels[t];
                return <Panel key={t} {...(panelDefaultProperties[t] || {})} />;
            }),
    getHeader: () => {
        return <Header ><Toolbar /></Header>;
    },
    getFooter: (props) => {
        return ( props.focusOnEdit && props.hasChanges || props.newFeatures.length > 0) ? null : <Footer />;
    },
    getEmptyRowsView: () => {
        return EmptyRowsView;
    },
    getFilterRenderers: createSelector((d) => d,
        (describe) =>
            describe ? (getFeatureTypeProperties(describe) || []).reduce( (out, cur) => ({
                ...out,
                [cur.name]: connect(
                    createSelector(
                        (state) => getAttributeFilter(state, cur.name),
                        modeSelector,
                        (filter, mode) => {
                            const props = {
                                value: filter && (filter.rawValue || filter.value),
                                ...(isGeometryType(cur) ? {
                                    filterEnabled: filter?.enabled,
                                    filterDeactivated: filter?.deactivated
                                } : {})
                            };
                            const editProps = !isGeometryType(cur) ? {
                                disabled: true,
                                tooltipMsgId: "featuregrid.filter.tooltips.editMode"
                            } : {};
                            return mode === "EDIT" ? {...props, ...editProps} : props;
                        }
                    ))(getFilterRenderer(isGeometryType(cur) ? 'geometry' : cur.localType, {name: cur.name}))
            }), {}) : {}),
    getDialogs: (tools = {}) => {
        return Object.keys(tools)
            .filter(t => tools[t] && dialogs[t])
            .map(t => {
                const Dialog = dialogs[t];
                return <Dialog key={t} />;
            });
    }
};
