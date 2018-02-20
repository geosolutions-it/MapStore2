/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const React = require('react');
const {connect} = require('../utils/PluginsUtils');
const assign = require('object-assign');
const Message = require('../components/I18N/Message');
const PropTypes = require('prop-types');

const {Glyphicon} = require('react-bootstrap');
const {on, toggleControl} = require('../actions/controls');
const {createSelector} = require('reselect');

const {cancelRemoveAnnotation, confirmRemoveAnnotation, editAnnotation, newAnnotation, removeAnnotation, cancelEditAnnotation,
    saveAnnotation, toggleAdd, validationError, removeAnnotationGeometry, toggleStyle, setStyle, restoreStyle,
    highlight, cleanHighlight, showAnnotation, cancelShowAnnotation, filterAnnotations, closeAnnotations,
    cancelCloseAnnotations, confirmCloseAnnotations, stopDrawing, changeStyler, setUnsavedChanges, toggleUnsavedChangesModal, changedProperties,
    setUnsavedStyle, toggleUnsavedStyleModal, addText, cancelText, saveText, download} =
    require('../actions/annotations');

const { zoomToExtent } = require('../actions/map');

const { annotationsInfoSelector, annotationsListSelector } = require('../selectors/annotations');
const {mapLayoutValuesSelector} = require('../selectors/maplayout');
const commonEditorActions = {
    onEdit: editAnnotation,
    onCancelEdit: cancelEditAnnotation,
    onChangeStyler: changeStyler,
    onCleanHighlight: cleanHighlight,
    onError: validationError,
    onSave: saveAnnotation,
    onRemove: removeAnnotation,
    onAddGeometry: toggleAdd,
    onCancelText: cancelText,
    onAddText: addText,
    onSaveText: saveText,
    onSetUnsavedChanges: setUnsavedChanges,
    onSetUnsavedStyle: setUnsavedStyle,
    onChangeProperties: changedProperties,
    onToggleUnsavedChangesModal: toggleUnsavedChangesModal,
    onToggleUnsavedStyleModal: toggleUnsavedStyleModal,
    onStyleGeometry: toggleStyle,
    onCancelStyle: restoreStyle,
    onSaveStyle: toggleStyle,
    onSetStyle: setStyle,
    onStopDrawing: stopDrawing,
    onDeleteGeometry: removeAnnotationGeometry,
    onZoom: zoomToExtent
};
const AnnotationsEditor = connect(annotationsInfoSelector,
{
    onCancel: cancelShowAnnotation,
    ...commonEditorActions
})(require('../components/mapcontrols/annotations/AnnotationsEditor'));

const AnnotationsInfoViewer = connect(annotationsInfoSelector,
{
    onCancelRemove: cancelRemoveAnnotation,
    onCancelEdit: cancelEditAnnotation,
    onCancelClose: cancelCloseAnnotations,
    onConfirmClose: confirmCloseAnnotations,
    onConfirmRemove: confirmRemoveAnnotation,
    ...commonEditorActions
})(require('../components/mapcontrols/annotations/AnnotationsEditor'));

const panelSelector = createSelector([annotationsListSelector], (list) => ({
    ...list,
    editor: AnnotationsEditor
}));

const Annotations = connect(panelSelector, {
    onCancelRemove: cancelRemoveAnnotation,
    onCancelStyle: restoreStyle,
    onCancelEdit: cancelEditAnnotation,
    onToggleUnsavedChangesModal: toggleUnsavedChangesModal,
    onToggleUnsavedStyleModal: toggleUnsavedStyleModal,
    onConfirmRemove: confirmRemoveAnnotation,
    onCancelClose: cancelCloseAnnotations,
    onConfirmClose: confirmCloseAnnotations,
    onAdd: newAnnotation,
    onHighlight: highlight,
    onCleanHighlight: cleanHighlight,
    onDetail: showAnnotation,
    onFilter: filterAnnotations,
    onDownload: download
})(require('../components/mapcontrols/annotations/Annotations'));

const ContainerDimensions = require('react-container-dimensions').default;
const Dock = require('react-dock').default;

class AnnotationsPanel extends React.Component {
    static propTypes = {
        id: PropTypes.string,
        active: PropTypes.bool,
        wrap: PropTypes.bool,
        wrapWithPanel: PropTypes.bool,
        panelStyle: PropTypes.object,
        panelClassName: PropTypes.string,
        toggleControl: PropTypes.func,
        closeGlyph: PropTypes.string,
        buttonStyle: PropTypes.object,
        style: PropTypes.object,
        dockProps: PropTypes.object,

        // side panel properties
        width: PropTypes.number
    };


    static defaultProps = {
        id: "mapstore-annotations-panel",
        active: false,
        wrap: false,
        modal: true,
        wrapWithPanel: false,
        panelStyle: {
            zIndex: 100,
            overflow: "hidden",
            height: "100%"
        },
        panelClassName: "annotations-panel",
        toggleControl: () => {},
        closeGlyph: "1-close",

        // side panel properties
        width: 660,
        dockProps: {
            dimMode: "none",
            size: 0.30,
            fluid: true,
            position: "right",
            zIndex: 1030
        },
        dockStyle: {}
    };

    render() {
        return this.props.active ? (
            <ContainerDimensions>
            { ({ width }) =>
                <span className="ms-annotations-panel">
                    <Dock
                        dockStyle={this.props.dockStyle} {...this.props.dockProps}
                        isVisible={this.props.active}
                        size={this.props.width / width > 1 ? 1 : this.props.width / width} >
                            <Annotations {...this.props} width={this.props.width}/>
                    </Dock>
                </span>
            }
            </ContainerDimensions>
        ) : null;
    }
}

const conditionalToggle = on.bind(null, toggleControl('annotations', null), (state) =>
    !(state.controls && state.controls.annotations && state.controls.annotations.enabled && state.annotations && state.annotations.editing)
, closeAnnotations);

/**
  * Annotations Plugin. Implements annotations handling on maps.
  * Adds:
  *  - a new vector layer, with id 'annotations', to show user created annotations on the map
  *  - a new menu in the BurgerMenu to handle current annotations
  *  - a custom template for Identify applied to annotations geometries that also allows editing {@link #components.mapControls.annotations.AnnotationsEditor}
  *  - styling of the annotation
  * Annotations are geometries (currently only markers are supported) with a set of properties. By default a title and
  * a description are managed, but you can configure a different set of fields, and other stuff in localConfig.json.
  * Look at {@link #components.mapControls.annotations.AnnotationsConfig} for more documentation on configuration options
  *
  * @class Annotations
  * @memberof plugins
  * @static
  */

const annotationsSelector = createSelector([
    state => (state.controls && state.controls.annotations && state.controls.annotations.enabled) || (state.annotations && state.annotations.closing) || false,
    state => mapLayoutValuesSelector(state, {height: true})
], (active, dockStyle) => ({
    active,
    dockStyle
}));

const AnnotationsPlugin = connect(annotationsSelector, {
    toggleControl: conditionalToggle
})(AnnotationsPanel);

module.exports = {
    AnnotationsPlugin: assign(AnnotationsPlugin, {
        BurgerMenu: {
            name: 'annotations',
            position: 2000,
            text: <Message msgId="annotationsbutton"/>,
            icon: <Glyphicon glyph="comment"/>,
            action: conditionalToggle,
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        annotations: require('../reducers/annotations')
    },
    epics: require('../epics/annotations')(AnnotationsInfoViewer)
};
