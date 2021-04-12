/**
  * Copyright 2017, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */

import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { createSelector, createStructuredSelector } from 'reselect';

import {
    clearChangeConfirmed,
    closeFeatureGrid,
    closeFeatureGridConfirmed,
    deleteFeatures,
    toggleTool
} from '../../../actions/featuregrid';
import ConfirmClearComp from '../../../components/data/featuregrid/dialog/ConfirmClear';
import ConfirmDeleteComp from '../../../components/data/featuregrid/dialog/ConfirmDelete';
import ConfirmFeatureCloseComp from '../../../components/data/featuregrid/dialog/ConfirmFeatureClose';
import EmptyRowsViewComp from '../../../components/data/featuregrid/EmptyRowsView';
import { getFilterRenderer } from '../../../components/data/featuregrid/filterRenderers';
import FooterComp from '../../../components/data/featuregrid/Footer';
import HeaderComp from '../../../components/data/featuregrid/Header';
import ToolbarComp from '../../../components/data/featuregrid/toolbars/Toolbar';
import { wfsDownloadAvailable, widgetBuilderAvailable } from '../../../selectors/controls';
import {
    chartDisabledSelector,
    getAttributeFilter,
    getTitleSelector,
    hasChangesSelector,
    hasGeometrySelector,
    hasNewFeaturesSelector,
    hasSupportedGeometry,
    isDrawingSelector,
    isEditingAllowedSelector,
    isSavedSelector,
    isSavingSelector,
    isSimpleGeomSelector,
    modeSelector,
    selectedFeaturesCount,
    selectedLayerNameSelector,
    showAgainSelector,
    showPopoverSyncSelector,
    showTimeSync,
    timeSyncActive
} from '../../../selectors/featuregrid';
import { mapLayoutValuesSelector } from '../../../selectors/maplayout';
import { isCesium } from '../../../selectors/maptype';
import {
    featureCollectionResultSelector,
    featureLoadingSelector,
    isDescribeLoaded,
    isFilterActive,
    isSyncWmsActive,
    paginationInfo,
    resultsSelector
} from '../../../selectors/query';
import { getFeatureTypeProperties, isGeometryType } from '../../../utils/ogc/WFS/base';
import { pageEvents, toolbarEvents } from '../index';
import settings from './AttributeSelector';

const EmptyRowsView = connect(createStructuredSelector({
    loading: featureLoadingSelector
}))(EmptyRowsViewComp);
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
        isDownloadOpen: state => state && state.controls && state.controls.layerdownload && state.controls.layerdownload.enabled,
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
)(ToolbarComp);


const Header = connect(
    createSelector(
        getTitleSelector,
        (title) => ({title})),
    {
        onClose: toolbarEvents.onClose
    }
)(HeaderComp);

// loading={props.featureLoading} totalFeatures={props.totalFeatures} resultSize={props.resultSize}/
const Footer = connect(
    createSelector(
        createStructuredSelector(paginationInfo),
        featureLoadingSelector,
        state => state && state.featuregrid && !!state.featuregrid.virtualScroll,
        selectedFeaturesCount,
        (pagination, loading, virtualScroll, selected) => ({
            ...pagination,
            selected,
            loading,
            virtualScroll
        })),
    pageEvents
)(FooterComp);
const DeleteDialog = connect(
    createSelector(selectedFeaturesCount, (count) => ({count})), {
        onClose: () => toggleTool("deleteConfirm", false),
        onConfirm: () => deleteFeatures()
    })(ConfirmDeleteComp);
const ClearDialog = connect(
    createSelector(selectedFeaturesCount, (count) => ({count})), {
        onClose: () => toggleTool("clearConfirm", false),
        onConfirm: () => clearChangeConfirmed()
    })(ConfirmClearComp);
const FeatureCloseDialog = connect(() => ({})
    , {
        onClose: () => closeFeatureGridConfirmed(),
        onConfirm: () => closeFeatureGrid()
    })(ConfirmFeatureCloseComp);

const panels = {
    settings
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

export const getPanels = (tools = {}) =>
    Object.keys(tools)
        .filter(t => tools[t] && panels[t])
        .map(t => {
            const Panel = panels[t];
            return <Panel key={t} {...(panelDefaultProperties[t] || {})} />;
        });
export const getHeader = () => {
    return <Header ><Toolbar /></Header>;
};
export const getFooter = (props) => {
    return ( props.focusOnEdit && props.hasChanges || props.newFeatures.length > 0) ? null : <Footer />;
};
export const getEmptyRowsView = () => {
    return EmptyRowsView;
};
export const getFilterRenderers = createSelector((d) => d,
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
        }), {}) : {});
export const getDialogs = (tools = {}) => {
    return Object.keys(tools)
        .filter(t => tools[t] && dialogs[t])
        .map(t => {
            const Dialog = dialogs[t];
            return <Dialog key={t} />;
        });
};


export default {
    getPanels,
    getHeader,
    getFooter,
    getEmptyRowsView,
    getFilterRenderers,
    getDialogs
};
