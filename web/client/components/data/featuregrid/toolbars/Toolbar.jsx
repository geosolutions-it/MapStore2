import React from 'react';
import './toolbar.css';
import { sortBy } from 'lodash';
import {ButtonGroup, Checkbox, Glyphicon, FormControl, FormGroup, Col} from 'react-bootstrap';

import Message from '../../../I18N/Message';
import withHint from '../enhancers/withHint';
import TButtonComp from "./TButton";
import { getApi } from '../../../../api/userPersistedStorage';
import TSplitButtonComp from "./TSplitButton";
import Spinner from "react-spinkit";
import Select from "react-select";
import { MapLibraries } from '../../../../utils/MapTypeUtils';
import { areLayerFeaturesEditable } from "../../../../utils/FeatureGridUtils";

const TButton = withHint(TButtonComp);
const TSplitButton = withHint(TSplitButtonComp);
const getDrawFeatureTooltip = (isDrawing, isSimpleGeom) => {
    if (isDrawing) {
        return "featuregrid.toolbar.stopDrawGeom";
    }
    return isSimpleGeom ? "featuregrid.toolbar.drawGeom" : "featuregrid.toolbar.addGeom";
};
const getSaveMessageId = ({ saving, saved, error }) => {
    if (saving || saved) {
        return "featuregrid.toolbar.saving";
    }
    if (error) {
        return "featuregrid.toolbar.validationError";
    }
    return "featuregrid.toolbar.saveChanges";
};
const standardButtons = {
    editMode: ({disabled, mode, isEditingAllowed, layer, events = {}}) => (<TButton
        id="edit-mode"
        keyProp="edit-mode"
        tooltipId="featuregrid.toolbar.editMode"
        disabled={disabled}
        visible={mode === "VIEW" && isEditingAllowed && areLayerFeaturesEditable(layer)}
        onClick={events.switchEditMode}
        glyph="pencil"/>),
    filter: ({isFilterActive = false, viewportFilter, disabled, isSearchAllowed, mode, showAdvancedFilterButton = true, events = {}}) => (<TButton
        id="search"
        keyProp="search"
        tooltipId="featuregrid.toolbar.advancedFilter"
        active={isFilterActive || viewportFilter}
        disabled={disabled || !isSearchAllowed}
        visible={mode === "VIEW" && showAdvancedFilterButton}
        onClick={events.showQueryPanel}
        glyph="filter"/>),
    zoomAll: ({disabled, disableZoomAll = false, mode, events = {}}) => (<TButton
        id="zoom-all"
        keyProp="zoom-all"
        tooltipId="featuregrid.toolbar.zoomAll"
        disabled={disabled || disableZoomAll}
        visible={mode === "VIEW"}
        onClick={events.zoomAll}
        glyph="zoom-to"/>),
    backToViewMode: ({disabled, mode, hasChanges, hasNewFeatures, events = {}}) => (<TButton
        id="back-view"
        keyProp="back-view"
        tooltipId="featuregrid.toolbar.quitEditMode"
        disabled={disabled}
        visible={mode === "EDIT" && !hasChanges && !hasNewFeatures}
        onClick={events.switchViewMode}
        glyph="arrow-left"/>),
    addFeature: ({disabled, mode, hasNewFeatures, hasChanges, hasSupportedGeometry = true, events = {}}) => (<TButton
        id="add-feature"
        keyProp="add-feature"
        tooltipId="featuregrid.toolbar.addNewFeatures"
        disabled={disabled}
        visible={mode === "EDIT" && !hasNewFeatures && !hasChanges && hasSupportedGeometry}
        onClick={events.createFeature}
        glyph="row-add"/>),
    drawFeature: ({isDrawing = false, disabled, isSimpleGeom, mode, selectedCount, hasGeometry, hasSupportedGeometry = true, events = {}}) => (<TButton
        id="draw-feature"
        keyProp="draw-feature"
        tooltipId={getDrawFeatureTooltip(isDrawing, isSimpleGeom)}
        disabled={disabled}
        visible={mode === "EDIT" && selectedCount === 1 && (!hasGeometry || hasGeometry && !isSimpleGeom) && hasSupportedGeometry}
        onClick={events.startDrawingFeature}
        active={isDrawing}
        glyph="pencil-add"/>),
    removeFeature: ({disabled, mode, selectedCount, hasChanges, hasNewFeatures, events = {}}) => (<TButton
        id="remove-features"
        keyProp="remove-features"
        tooltipId="featuregrid.toolbar.deleteSelectedFeatures"
        disabled={disabled}
        visible={mode === "EDIT" && selectedCount > 0 && !hasChanges && !hasNewFeatures}
        onClick={events.deleteFeatures}
        glyph="trash-square"/>),
    saveFeature: ({saving = false, saved = false, disabled, mode, hasChanges, hasNewFeatures, events = {}, validationErrors = {} }) => {
        const hasValidationErrors = Object.keys(validationErrors).some(key => validationErrors[key].changed);
        return (<TButton
            id="save-feature"
            keyProp="save-feature"
            className={hasValidationErrors ? 'ms-notification-circle danger' : undefined}
            tooltipId={getSaveMessageId({ saving, saved, error: hasValidationErrors })}
            disabled={saving || saved || disabled}
            visible={mode === "EDIT" && hasChanges || hasNewFeatures}
            active={saved}
            onClick={events.saveChanges}
            glyph="floppy-disk"
        />);
    },
    cancelEditing: ({disabled, mode, hasChanges, hasNewFeatures, events = {}}) => (<TButton
        id="cancel-editing"
        keyProp="cancel-editing"
        tooltipId="featuregrid.toolbar.cancelChanges"
        disabled={disabled}
        visible={mode === "EDIT" && hasChanges || hasNewFeatures}
        onClick={events.clearFeatureEditing}
        glyph="remove-square"/>),
    deleteGeometry: ({disabled, mode, hasGeometry, selectedCount, hasSupportedGeometry = true, events = {}}) => (<TButton
        id="delete-geometry"
        keyProp="delete-geometry"
        tooltipId="featuregrid.toolbar.deleteGeometry"
        disabled={disabled}
        visible={mode === "EDIT" && hasGeometry && selectedCount === 1 && hasSupportedGeometry}
        onClick={events.deleteGeometry}
        glyph="polygon-trash"/>),
    gridSettings: ({disabled, isColumnsOpen, selectedCount, mode, events = {}}) => (<TButton
        id="grid-settings"
        keyProp="grid-settings"
        tooltipId="featuregrid.toolbar.hideShowColumns"
        disabled={disabled}
        active={isColumnsOpen}
        visible={selectedCount <= 1 && mode === "VIEW"}
        onClick={events.settings}
        glyph="features-grid-set"/>),
    syncGridFilterToMap: ({disabled, isSyncActive = false, showSyncOnMapButton = true, events = {}, syncPopover = { dockSize: "32.2%" }, showPopoverSync, hideSyncPopover}) => (<TButton
        id="grid-map-filter"
        keyProp="grid-map-filter"
        tooltipId="featuregrid.toolbar.syncOnMap"
        disabled={disabled}
        active={isSyncActive}
        visible={showSyncOnMapButton}
        onClick={events.sync}
        glyph="map-filter"
        renderPopover={showPopoverSync}
        popoverOptions={!disabled && {
            placement: "top",
            content: (<span>
                <p><Message msgId="featuregrid.toolbar.synchPopoverText"/></p>
                <p>
                    <Checkbox {...{checked: syncPopover.showAgain, onClick: events.toggleShowAgain}}>
                        <Message msgId="featuregrid.toolbar.notShowAgain"/>
                    </Checkbox>
                </p>
            </span>),
            props: {
                id: "sync-popover",
                title: <div>
                    <Message msgId="featuregrid.toolbar.synchPopoverTitle"/>
                    <button onClick={() => {
                        if (syncPopover.showAgain) {
                            try {
                                getApi().setItem("showPopoverSync", false);
                            } catch (e) {
                                console.error(e);
                            }
                        }
                        hideSyncPopover();
                    }} className="close">
                        <Glyphicon className="pull-right" glyph="1-close"/>
                    </button>
                </div>,
                style: {
                    bottom: syncPopover.dockSize
                }
            }}
        } />),
    syncTimeParameter: ({timeSync, showTimeSyncButton = false, events = {}}) => (<TButton
        id="timeSync-button"
        keyProp="fg-timeSync-button"
        tooltipId={timeSync ? "featuregrid.toolbar.disableTimeSync" : "featuregrid.toolbar.enableTimeSync"}
        visible={showTimeSyncButton}
        active={timeSync}
        onClick={() => events.setTimeSync && events.setTimeSync(!timeSync)}
        glyph="time" />),
    snapToFeature: ({snapping, availableSnappingLayers = [], isSnappingLoading, snappingConfig, mode, mapType, editorHeight, pluginCfg, events = {}}) => (<TSplitButton
        id="snap-button"
        keyProp="snap-button"
        tooltipId={snapping ? "featuregrid.toolbar.disableSnapping" : "featuregrid.toolbar.enableSnapping"}
        visible={mode === "EDIT" && (pluginCfg?.snapTool ?? true) && mapType === MapLibraries.OPENLAYERS}
        onClick={() => {
            events.toggleSnapping && events.toggleSnapping(!snapping);
        }}
        onMount={() => !snappingConfig && events.setSnappingConfig && events.setSnappingConfig(null, null, pluginCfg)}
        title={isSnappingLoading ? <Spinner spinnerName="ball-beat" overrideSpinnerClassName="spinner" key="loadingSpinner" noFadeIn /> : <Glyphicon glyph="magnet" />}
        tooltipPosition="top"
        className="snap-tool"
        buttonClassName="square-button-md no-border"
        menuStyle={{maxHeight: `calc(${Math.round(editorHeight * 100)}vh - 50px)`, overflowY: 'auto'}}
        active={!!snapping}
        pullLeft
    >
        <>
            <label className="control-label"><Message msgId="featuregrid.toolbar.snapToLayer"/></label>
            <Select
                clearable={false}
                escapeClearsValue={false}
                options={availableSnappingLayers}
                onChange={option => events.setSnappingLayer(option.value)}
                value = {
                    availableSnappingLayers.find(option => option.active)
                }
            />
        </>
        <label className="control-label"><Message msgId="featuregrid.toolbar.snappingSettings.header"/></label>
        <FormGroup>
            <Col xs={6}>
                <Checkbox
                    key="edge"
                    checked={(snappingConfig?.edge ?? pluginCfg?.snapConfig?.edge) ?? true}
                    inline
                    onChange={(e) => events.setSnappingConfig(e.target.checked, 'edge', pluginCfg)}
                >
                    <Message msgId="featuregrid.toolbar.snappingSettings.edge"/>
                </Checkbox>
            </Col>
            <Col xs={6}>
                <Checkbox
                    key="vertex"
                    checked={(snappingConfig?.vertex ?? pluginCfg?.snapConfig?.vertex) ?? true}
                    inline
                    onChange={(e) => events.setSnappingConfig(e.target.checked, 'vertex', pluginCfg)}
                >
                    <Message msgId="featuregrid.toolbar.snappingSettings.vertex"/>
                </Checkbox>
            </Col>
            <span className="clearfix" />
        </FormGroup>
        <FormGroup>
            <Col xs={7}>
                <span className="inline-control-label"><Message msgId="featuregrid.toolbar.snappingSettings.pixelTolerance"/></span>
            </Col>
            <Col xs={5}>
                <FormControl
                    key="pixelTolerance"
                    type="number"
                    onChange={(e) => events.setSnappingConfig(e.target.value, 'pixelTolerance', pluginCfg)}
                    defaultValue={snappingConfig?.pixelTolerance ?? pluginCfg?.snapConfig?.pixelTolerance ?? 10}
                />
            </Col>
            <span className="clearfix" />
        </FormGroup>
        <FormGroup>
            <Col xs={7}>
                <span className="inline-control-label"><Message msgId="featuregrid.toolbar.snappingSettings.loadingStrategy"/></span>
            </Col>
            <Col xs={5}>
                <FormControl
                    componentClass="select"
                    defaultValue={snappingConfig?.strategy ?? pluginCfg?.snapConfig?.strategy ?? 'bbox'}
                    onChange={(e) => events.setSnappingConfig(e.target.value, 'strategy', pluginCfg)}
                >
                    <option value="bbox">bbox</option>
                    <option value="all">all</option>
                </FormControl>
            </Col>
            <span className="clearfix" />
        </FormGroup>
    </TSplitButton>),
    viewportFilter: ({viewportFilter, isFilterByViewportSupported, pluginCfg, events = {}}) => (<TButton
        id="viewportFilter-button"
        keyProp="viewportFilter-button"
        tooltipId={viewportFilter ? "featuregrid.toolbar.disableViewportFilter" : "featuregrid.toolbar.enableViewportFilter"}
        visible={(pluginCfg?.showFilterByViewportTool ?? true) && isFilterByViewportSupported}
        onClick={() => {
            events.setViewportFilter && events.setViewportFilter(!viewportFilter);
        }}
        glyph="viewport-filter"
        tooltipPosition="top"
        className="viewportFilter-tool"
        buttonClassName="square-button-md no-border"
        active={viewportFilter ?? pluginCfg?.filterByViewport}
        pullLeft
    />)
};

// standard buttons with position set to index in this array. shape {name, Component, position} is aligned with attributes expected from tools injected.
const buttons = [
    {name: "editMode", Component: standardButtons.editMode}, // EDITOR
    {name: "backToViewMode", Component: standardButtons.backToViewMode}, // EDITOR
    {name: "addFeature", Component: standardButtons.addFeature}, // EDITOR
    {name: "drawFeature", Component: standardButtons.drawFeature}, // EDITOR
    {name: "removeFeature", Component: standardButtons.removeFeature}, // EDITOR
    {name: "saveFeature", Component: standardButtons.saveFeature}, // EDITOR
    {name: "cancelEditing", Component: standardButtons.cancelEditing}, // EDITOR
    {name: "deleteGeometry", Component: standardButtons.deleteGeometry}, // EDITOR
    {name: "filter", Component: standardButtons.filter}, // GRID (needs query panel plugin)
    {name: "viewportFilter", Component: standardButtons.viewportFilter},
    {name: "zoomAll", Component: standardButtons.zoomAll}, // GRID (should remove or hide? Is always disabled and not to much useful)
    {name: "gridSettings", position: 900, Component: standardButtons.gridSettings}, // GRID. (settings buttons are usually near the end of a toolbar)
    {name: "snap", position: 1300, Component: standardButtons.snapToFeature}, // GRID. (settings buttons are usually near the end of a toolbar)
    // note: `syncGridFilterToMap` needs to stay at the end of the toolbar because of a bug. The tooltip active forces this button to be at the end (see #7271)
    // so to avoid a replacement after the button closes, we need to put it at the end, until the bug is solved.
    {name: "syncGridFilterToMap", position: 1100, Component: standardButtons.syncGridFilterToMap}, // GRID
    {name: "syncTimeParameter", Component: standardButtons.syncTimeParameter} // GRID (generic functionality not mandatory related to timeline)
].map(({position, ...rest}, index) => ({
    ...rest,
    position: position ?? index
}));

/**
 * Standard Toolbar for the FeatureGrid plugin.
 *
 * @param {bool} disableToolbar if true it disables all the buttons in the toolbar
 * @param {bool} disableZoomAll if true it disables the ZoomAll button (defaults to false)
 * @param {bool} showAdvancedFilterButton shows / hide the advanced filter button (defaults to true)
 * @param {bool} showSyncOnMapButton shows / hide the show on map button (defaults to true)
 * @param {bool} showTimeSyncButton shows / hide the timeSync button (defaults to false)
*/
export default React.memo((props = {}) => {
    const {
        toolbarItems = [],
        pluginCfg = { showPopoverSync: false }
    } = props;
    const [showPopover, setShowPopoverSync] = React.useState(getApi().getItem("showPopoverSync") !== null && pluginCfg?.showPopoverSync ? getApi().getItem("showPopoverSync") === "true" : pluginCfg?.showPopoverSync);
    React.useEffect(()=>{
        if (showPopover && props.mode === 'EDIT') {
            setShowPopoverSync(false);
        } else if (!showPopover && props.mode !== 'EDIT') {
            setShowPopoverSync(getApi().getItem("showPopoverSync") !== null && pluginCfg?.showPopoverSync ? getApi().getItem("showPopoverSync") === "true" : pluginCfg?.showPopoverSync);
        }
    }, [props.mode]);
    return (<ButtonGroup id="featuregrid-toolbar" className="featuregrid-toolbar featuregrid-toolbar-margin">

        {sortBy(buttons.concat(toolbarItems), ["position"]).map(({Component}) => <Component {...props} showPopoverSync={showPopover} hideSyncPopover={() => setShowPopoverSync(false)} mode={props?.mode ?? "VIEW"} disabled={props.disableToolbar} />)}
    </ButtonGroup>);
});
