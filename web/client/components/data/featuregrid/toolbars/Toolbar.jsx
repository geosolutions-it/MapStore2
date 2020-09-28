const React = require('react');
const {ButtonGroup, Glyphicon, Checkbox} = require('react-bootstrap');
require("./toolbar.css");
const Message = require('../../../I18N/Message');
const withHint = require("../enhancers/withHint");
const TButton = withHint(require("./TButton"));
const getDrawFeatureTooltip = (isDrawing, isSimpleGeom) => {
    if (isDrawing) {
        return "featuregrid.toolbar.stopDrawGeom";
    }
    return isSimpleGeom ? "featuregrid.toolbar.drawGeom" : "featuregrid.toolbar.addGeom";
};
const getSaveMessageId = ({saving, saved}) => {
    if (saving || saved) {
        return "featuregrid.toolbar.saving";
    }
    return "featuregrid.toolbar.saveChanges";
};
/**
 * Standard Toolbar for the FeatureGrid plugin.
 *
 * @param {bool} disableToolbar if true it disables all the buttons in the toolbar
 * @param {bool} disableDownload if true it disables the Download button
 * @param {bool} disableZoomAll if true it disables the ZoomAll button (defaults to false)
 * @param {bool} displayDownload used to set visibility of download button
 * @param {bool} showAdvancedFilterButton shows / hide the advanced filter button (defaults to true)
 * @param {bool} showChartButton shows / hide the Chart (widget) button (defaults to true)
 * @param {bool} showSyncOnMapButton shows / hide the show on map button (defaults to true)
 * @param {bool} showTimeSyncButton shows / hide the timeSync button (defaults to false)
*/
module.exports = ({
    disableToolbar,
    disableDownload,
    disableZoomAll = false,
    displayDownload,
    events = {},
    hasChanges,
    hasGeometry,
    hasNewFeatures,
    hasSupportedGeometry = true,
    isColumnsOpen,
    isDrawing = false,
    isEditingAllowed,
    isFilterActive = false,
    isDownloadOpen,
    isSearchAllowed,
    isSimpleGeom,
    isSyncActive = false,
    saved = false,
    saving = false,
    selectedCount,
    showAdvancedFilterButton = true,
    showChartButton = true,
    showSyncOnMapButton = true,
    showTimeSyncButton = false,
    syncPopover = { showPopoverSync: true, dockSize: "32.2%" }, mode = "VIEW",
    timeSync = false
} = {}) => {
    return (<ButtonGroup id="featuregrid-toolbar" className="featuregrid-toolbar featuregrid-toolbar-margin">
        <TButton
            id="edit-mode"
            keyProp="edit-mode"
            tooltipId="featuregrid.toolbar.editMode"
            disabled={disableToolbar}
            visible={mode === "VIEW" && isEditingAllowed}
            onClick={events.switchEditMode}
            glyph="pencil"/>
        <TButton
            id="search"
            keyProp="search"
            tooltipId="featuregrid.toolbar.advancedFilter"
            active={isFilterActive}
            disabled={disableToolbar || !isSearchAllowed}
            visible={mode === "VIEW" && showAdvancedFilterButton}
            onClick={events.showQueryPanel}
            glyph="filter"/>
        <TButton
            id="zoom-all"
            keyProp="zoom-all"
            tooltipId="featuregrid.toolbar.zoomAll"
            disabled={disableToolbar || disableZoomAll}
            visible={mode === "VIEW"}
            onClick={events.zoomAll}
            glyph="zoom-to"/>
        <TButton
            id="back-view"
            keyProp="back-view"
            tooltipId="featuregrid.toolbar.quitEditMode"
            disabled={disableToolbar}
            visible={mode === "EDIT" && !hasChanges && !hasNewFeatures}
            onClick={events.switchViewMode}
            glyph="arrow-left"/>
        <TButton
            id="add-feature"
            keyProp="add-feature"
            tooltipId="featuregrid.toolbar.addNewFeatures"
            disabled={disableToolbar}
            visible={mode === "EDIT" && !hasNewFeatures && !hasChanges && hasSupportedGeometry}
            onClick={events.createFeature}
            glyph="row-add"/>
        <TButton
            id="draw-feature"
            keyProp="draw-feature"
            tooltipId={getDrawFeatureTooltip(isDrawing, isSimpleGeom)}
            disabled={disableToolbar}
            visible={mode === "EDIT" && selectedCount === 1 && (!hasGeometry || hasGeometry && !isSimpleGeom) && hasSupportedGeometry}
            onClick={events.startDrawingFeature}
            active={isDrawing}
            glyph="pencil-add"/>
        <TButton
            id="remove-features"
            keyProp="remove-features"
            tooltipId="featuregrid.toolbar.deleteSelectedFeatures"
            disabled={disableToolbar}
            visible={mode === "EDIT" && selectedCount > 0 && !hasChanges && !hasNewFeatures}
            onClick={events.deleteFeatures}
            glyph="trash-square"/>
        <TButton
            id="save-feature"
            keyProp="save-feature"
            tooltipId={getSaveMessageId({saving, saved})}
            disabled={saving || saved || disableToolbar}
            visible={mode === "EDIT" && hasChanges || hasNewFeatures}
            active={saved}
            onClick={events.saveChanges}
            glyph="floppy-disk"/>
        <TButton
            id="cancel-editing"
            keyProp="cancel-editing"
            tooltipId="featuregrid.toolbar.cancelChanges"
            disabled={disableToolbar}
            visible={mode === "EDIT" && hasChanges || hasNewFeatures}
            onClick={events.clearFeatureEditing}
            glyph="remove-square"/>
        <TButton
            id="delete-geometry"
            keyProp="delete-geometry"
            tooltipId="featuregrid.toolbar.deleteGeometry"
            disabled={disableToolbar}
            visible={mode === "EDIT" && hasGeometry && selectedCount === 1 && hasSupportedGeometry}
            onClick={events.deleteGeometry}
            glyph="polygon-trash"/>
        <TButton
            id="download-grid"
            keyProp="download-grid"
            tooltipId="featuregrid.toolbar.downloadGridData"
            disabled={disableToolbar || disableDownload}
            active={isDownloadOpen}
            visible={displayDownload && mode === "VIEW"}
            onClick={events.download}
            glyph="features-grid-download"/>
        <TButton
            id="grid-settings"
            keyProp="grid-settings"
            tooltipId="featuregrid.toolbar.hideShowColumns"
            disabled={disableToolbar}
            active={isColumnsOpen}
            visible={selectedCount <= 1 && mode === "VIEW"}
            onClick={events.settings}
            glyph="features-grid-set"/>
        <TButton
            id="grid-map-chart"
            keyProp="grid-map-chart"
            tooltipId="featuregrid.toolbar.createNewChart"
            disabled={disableToolbar}
            visible={mode === "VIEW" && showChartButton}
            onClick={events.chart}
            glyph="stats"/>
        <TButton
            id="grid-map-filter"
            keyProp="grid-map-filter"
            tooltipId="featuregrid.toolbar.syncOnMap"
            disabled={disableToolbar}
            active={isSyncActive}
            visible={showSyncOnMapButton}
            onClick={events.sync}
            glyph="map-filter"
            renderPopover={syncPopover.showPopoverSync}
            popoverOptions={!disableToolbar && {
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
                                localStorage.setItem("showPopoverSync", false);
                            }
                            events.hideSyncPopover();
                        }} className="close">
                            <Glyphicon className="pull-right" glyph="1-close"/>
                        </button>
                    </div>,
                    style: {
                        bottom: syncPopover.dockSize
                    }
                }}
            } />
        <TButton
            id="timeSync-button"
            keyProp="fg-timeSync-button"
            tooltipId={timeSync ? "featuregrid.toolbar.disableTimeSync" : "featuregrid.toolbar.enableTimeSync"}
            visible={showTimeSyncButton}
            active={timeSync}
            onClick={() => events.setTimeSync && events.setTimeSync(!timeSync)}
            glyph="time" />

    </ButtonGroup>);
};
