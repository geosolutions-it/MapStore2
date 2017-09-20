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

const {Glyphicon} = require('react-bootstrap');
const {toggleControl} = require('../actions/controls');

const {cancelRemoveAnnotation, confirmRemoveAnnotation, editAnnotation, removeAnnotation, cancelEditAnnotation,
        saveAnnotation, toggleAdd, validationError, removeAnnotationGeometry} = require('../actions/annotations');
/**
  * Annotations Plugin. Implements annotations handling on maps.
  * Adds:
  *  - a new vector layer, with id 'annotations', to show user created annotations on the map
  *  - a new menu in the BurgerMenu to handle current annotations (still to be implemented)
  *  - a custom template for Identify applied to annotations geometries that also allows editing {@link components.mapControls.annotations.AnnotationsInfoViewer}
  * Annotations are geometries (currently only markers are supported) with a set of properties. By default a title and
  * a description are managed, but you can configure a different set of fields, using initialState in localConfig.json:
  * @example
  * {
  *   ...
  *   "initialState": {
  *     "defaultState": {
  *         "annotations": {
  *             "fields": [{
  *                 "name": "myattribute",
  *                 "editable": true
  *                 "validator": "value.indexOf('fake') === -1",
  *                 "validateError": "annotations.error.fake"
  *             }]
  *         }
  *     }
  *   }
  * }
  *
  * @class Annotations
  * @memberof plugins
  * @static
  */
const AnnotationsPlugin = connect((state) => ({
    removing: state.annotations && state.annotations.removing,
    editing: state.annotations && !!state.annotations.editing
}), {
    onCancelRemove: cancelRemoveAnnotation,
    onConfirmRemove: confirmRemoveAnnotation
})(require('../components/mapcontrols/annotations/Annotations'));

const AnnotationsInfoViewer = connect((state) => ({
    fields: state.annotations && state.annotations.fields,
    editing: state.annotations && state.annotations.editing,
    drawing: state.annotations && state.annotations.drawing,
    errors: state.annotations.validationErrors
}),
{
    onEdit: editAnnotation,
    onCancelEdit: cancelEditAnnotation,
    onError: validationError,
    onSave: saveAnnotation,
    onRemove: removeAnnotation,
    onAddGeometry: toggleAdd,
    onDeleteGeometry: removeAnnotationGeometry
})(require('../components/mapcontrols/annotations/AnnotationsInfoViewer'));

module.exports = {
    AnnotationsPlugin: assign(AnnotationsPlugin, {
        BurgerMenu: {
            name: 'annotations',
            position: 2000,
            text: <Message msgId="annotationsbutton"/>,
            icon: <Glyphicon glyph="comment"/>,
            action: toggleControl.bind(null, 'annotations', null),
            priority: 2,
            doNotHide: true
        }
    }),
    reducers: {
        annotations: require('../reducers/annotations')
    },
    epics: require('../epics/annotations')(AnnotationsInfoViewer)
};
