const React = require('react');
const {ButtonGroup} = require('react-bootstrap');
require("./toolbar.css");
const Message = require('../../../I18N/Message');
const TButton = require("./TButton");
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

module.exports = ({events = {}, mode = "VIEW", selectedCount, hasChanges, hasGeometry, hasNewFeatures, isSimpleGeom, isDrawing = false, isEditingAllowed, saving = false, saved = false, isDownloadOpen, isColumnsOpen, disableToolbar} = {}) =>
    (<ButtonGroup id="featuregrid-toolbar" className="featuregrid-toolbar featuregrid-toolbar-margin">
        <TButton
            id="edit-mode"
            tooltip={<Message msgId="featuregrid.toolbar.editMode"/>}
            disabled={disableToolbar}
            visible={mode === "VIEW" && isEditingAllowed}
            onClick={events.switchEditMode}
            glyph="pencil"/>
        <TButton
            id="back-view"
            tooltip={<Message msgId="featuregrid.toolbar.quitEditMode"/>}
            disabled={disableToolbar}
            visible={mode === "EDIT" && !hasChanges && !hasNewFeatures}
            onClick={events.switchViewMode}
            glyph="arrow-left"/>
        <TButton
            id="add-feature"
            tooltip={<Message msgId="featuregrid.toolbar.addNewFeatures"/>}
            disabled={disableToolbar}
            visible={mode === "EDIT" && !hasNewFeatures && !hasChanges}
            onClick={events.createFeature}
            glyph="row-add"/>
        <TButton
            id="draw-feature"
            tooltip={<Message msgId={getDrawFeatureTooltip(isDrawing, isSimpleGeom)}/>}
            disabled={disableToolbar}
            visible={mode === "EDIT" && selectedCount === 1 && (!hasGeometry || hasGeometry && !isSimpleGeom)}
            onClick={events.startDrawingFeature}
            active={isDrawing}
            glyph="pencil-add"/>
        <TButton
            id="remove-features"
            tooltip={<Message msgId="featuregrid.toolbar.deleteSelectedFeatures"/>}
            disabled={disableToolbar}
            visible={mode === "EDIT" && selectedCount > 0 && !hasChanges && !hasNewFeatures}
            onClick={events.deleteFeatures}
            glyph="trash-square"/>
        <TButton
            id="save-feature"
            tooltip={<Message msgId={getSaveMessageId({saving, saved})}/>}
            disabled={saving || saved || disableToolbar}
            visible={mode === "EDIT" && hasChanges || hasNewFeatures}
            active={saved}
            onClick={events.saveChanges}
            glyph="floppy-disk"/>
        <TButton
            id="cancel-editing"
            tooltip={<Message msgId="featuregrid.toolbar.cancelChanges"/>}
            disabled={disableToolbar}
            visible={mode === "EDIT" && hasChanges || hasNewFeatures}
            onClick={events.clearFeatureEditing}
            glyph="remove-square"/>
        <TButton
            id="delete-geometry"
            tooltip={<Message msgId="featuregrid.toolbar.deleteGeometry"/>}
            disabled={disableToolbar}
            visible={mode === "EDIT" && hasGeometry && selectedCount === 1}
            onClick={events.deleteGeometry}
            glyph="polygon-trash"/>
        <TButton
            id="download-grid"
            tooltip={<Message msgId="featuregrid.toolbar.downloadGridData"/>}
            disabled={disableToolbar}
            active={isDownloadOpen}
            visible={mode === "VIEW"}
            onClick={events.download}
            glyph="features-grid-download"/>
        <TButton
            id="grid-settings"
            tooltip={<Message msgId="featuregrid.toolbar.hideShowColumns"/>}
            disabled={disableToolbar}
            active={isColumnsOpen}
            visible={selectedCount <= 1 && mode === "VIEW"}
            onClick={events.settings}
            glyph="features-grid-set"/>
    </ButtonGroup>);
