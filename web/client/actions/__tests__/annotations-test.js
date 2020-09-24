/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const expect = require('expect');
const {isFunction} = require('lodash');

const {
    EDIT_ANNOTATION,
    REMOVE_ANNOTATION,
    CONFIRM_REMOVE_ANNOTATION,
    CANCEL_REMOVE_ANNOTATION,
    CLOSE_ANNOTATIONS,
    CONFIRM_CLOSE_ANNOTATIONS,
    CANCEL_CLOSE_ANNOTATIONS,
    CANCEL_EDIT_ANNOTATION,
    SAVE_ANNOTATION,
    TOGGLE_ADD,
    UPDATE_ANNOTATION_GEOMETRY,
    VALIDATION_ERROR,
    REMOVE_ANNOTATION_GEOMETRY,
    TOGGLE_STYLE,
    SET_STYLE,
    RESTORE_STYLE,
    SHOW_ANNOTATION,
    CANCEL_SHOW_ANNOTATION,
    NEW_ANNOTATION,
    HIGHLIGHT,
    CLEAN_HIGHLIGHT,
    FILTER_ANNOTATIONS,
    addText, ADD_TEXT,
    CHANGE_FORMAT, changeFormat,
    changedProperties, CHANGED_PROPERTIES,
    toggleUnsavedStyleModal, TOGGLE_STYLE_MODAL,
    startDrawing, START_DRAWING,
    toggleUnsavedChangesModal, TOGGLE_CHANGES_MODAL,
    setUnsavedStyle, UNSAVED_STYLE,
    setUnsavedChanges, UNSAVED_CHANGES,
    editAnnotation,
    removeAnnotation,
    confirmRemoveAnnotation,
    cancelRemoveAnnotation,
    cancelEditAnnotation,
    saveAnnotation,
    toggleAdd,
    updateAnnotationGeometry,
    validationError,
    removeAnnotationGeometry,
    toggleStyle,
    setStyle,
    restoreStyle,
    showAnnotation,
    cancelShowAnnotation,
    newAnnotation,
    highlight,
    cleanHighlight,
    filterAnnotations,
    closeAnnotations,
    confirmCloseAnnotations,
    cancelCloseAnnotations,
    DOWNLOAD, download,
    CHANGED_SELECTED, changeSelected,
    SET_INVALID_SELECTED, setInvalidSelected,
    TOGGLE_GEOMETRY_MODAL, toggleUnsavedGeometryModal,
    RESET_COORD_EDITOR, resetCoordEditor,
    CHANGE_RADIUS, changeRadius,
    CHANGE_TEXT, changeText,
    CONFIRM_DELETE_FEATURE, confirmDeleteFeature,
    OPEN_EDITOR, openEditor,
    TOGGLE_DELETE_FT_MODAL, toggleDeleteFtModal,
    ADD_NEW_FEATURE, addNewFeature,
    LOAD_ANNOTATIONS, loadAnnotations,
    UPDATE_SYMBOLS, updateSymbols,
    SET_DEFAULT_STYLE, setDefaultStyle,
    LOAD_DEFAULT_STYLES, loadDefaultStyles,
    LOADING, loading,
    TOGGLE_ANNOTATION_VISIBILITY, toggleVisibilityAnnotation,
    CHANGE_GEOMETRY_TITLE, changeGeometryTitle,
    FILTER_MARKER, filterMarker
} = require('../annotations');

describe('Test correctness of the annotations actions', () => {
    it('edit annotation', (done) => {
        const result = editAnnotation('1');
        expect(result).toExist();
        expect(isFunction(result)).toBe(true);
        result((action) => {
            expect(action.type).toEqual(EDIT_ANNOTATION);
            expect(action.featureType).toEqual('Point');
            expect(action.feature).toExist();
            expect(action.feature.properties.name).toEqual('myannotation');
            done();
        }, () => ({
            layers: {
                flat: [{
                    id: 'annotations',
                    features: [{
                        properties: {
                            id: '1',
                            name: 'myannotation'
                        },
                        geometry: {
                            type: "Point"
                        }
                    }]
                }]
            }
        }));
    });

    it('remove annotation', () => {
        const result = removeAnnotation('1');
        expect(result.type).toEqual(REMOVE_ANNOTATION);
        expect(result.id).toEqual('1');
    });
    it('openEditor annotation', () => {
        const result = openEditor('1');
        expect(result.type).toEqual(OPEN_EDITOR);
        expect(result.id).toEqual('1');
    });
    it('addNewFeature', () => {
        const result = addNewFeature();
        expect(result.type).toEqual(ADD_NEW_FEATURE);
    });
    it('confirmDeleteFeature', () => {
        const result = confirmDeleteFeature();
        expect(result.type).toEqual(CONFIRM_DELETE_FEATURE);
    });
    it('toggleDeleteFtModal', () => {
        const result = toggleDeleteFtModal();
        expect(result.type).toEqual(TOGGLE_DELETE_FT_MODAL);
    });
    it('changeSelected', () => {
        const coordinates = [1, 2];
        const radius = 0;
        const text = "text";
        const crs = "EPS:3857";
        const result = changeSelected(coordinates, radius, text, crs);
        expect(result.type).toEqual(CHANGED_SELECTED);
        expect(result.coordinates).toEqual(coordinates);
        expect(result.radius).toEqual(radius);
        expect(result.crs).toEqual(crs);
        expect(result.text).toEqual(text);
    });
    it('setInvalidSelected', () => {
        const errorFrom = "text";
        const coordinates = [1, 2];
        const result = setInvalidSelected(errorFrom, coordinates);
        expect(result.type).toEqual(SET_INVALID_SELECTED);
        expect(result.errorFrom).toEqual(errorFrom);
        expect(result.coordinates).toEqual(coordinates);
    });
    it('addText', () => {
        const result = addText();
        expect(result.type).toEqual(ADD_TEXT);
    });
    it('changeFormat', () => {
        const format = "decimal";
        const result = changeFormat(format);
        expect(result.type).toEqual(CHANGE_FORMAT);
        expect(result.format).toEqual(format);
    });
    it('confirm remove annotation', () => {
        const result = confirmRemoveAnnotation('1', 'geometry');
        expect(result.type).toEqual(CONFIRM_REMOVE_ANNOTATION);
        expect(result.id).toEqual('1');
        expect(result.attribute).toEqual('geometry');
    });
    it('changedProperties', () => {
        const field = "desc";
        const value = "desc value";
        const result = changedProperties(field, value);
        expect(result.type).toEqual(CHANGED_PROPERTIES);
        expect(result.field).toEqual(field);
        expect(result.value).toEqual(value);
    });
    it('cancel remove annotation', () => {
        const result = cancelRemoveAnnotation();
        expect(result.type).toEqual(CANCEL_REMOVE_ANNOTATION);
    });
    it('setUnsavedChanges', () => {
        const result = setUnsavedChanges(true);
        expect(result.type).toEqual(UNSAVED_CHANGES);
        expect(result.unsavedChanges).toEqual(true);
    });
    it('setUnsavedStyle', () => {
        const result = setUnsavedStyle(true);
        expect(result.type).toEqual(UNSAVED_STYLE);
        expect(result.unsavedStyle).toEqual(true);
    });
    it('cancel edit annotation', () => {
        const result = cancelEditAnnotation();
        expect(result.type).toEqual(CANCEL_EDIT_ANNOTATION);
    });
    it('startDrawing', () => {
        const result = startDrawing();
        expect(result.type).toEqual(START_DRAWING);
    });
    it('toggleUnsavedChangesModal', () => {
        const result = toggleUnsavedChangesModal();
        expect(result.type).toEqual(TOGGLE_CHANGES_MODAL);
    });
    it('toggleUnsavedStyleModal', () => {
        const result = toggleUnsavedStyleModal();
        expect(result.type).toEqual(TOGGLE_STYLE_MODAL);
    });

    it('save annotation', () => {
        const result = saveAnnotation('1', {
            name: 'changed'
        }, {}, {}, true);
        expect(result.type).toEqual(SAVE_ANNOTATION);
        expect(result.id).toEqual('1');
        expect(result.fields.name).toEqual('changed');
        expect(result.geometry).toExist();
        expect(result.style).toExist();
        expect(result.newFeature).toBe(true);
    });

    it('toggle add', () => {
        const result = toggleAdd();
        expect(result.type).toEqual(TOGGLE_ADD);
    });

    it('toggle style', () => {
        const result = toggleStyle();
        expect(result.type).toEqual(TOGGLE_STYLE);
    });

    it('restore style', () => {
        const result = restoreStyle();
        expect(result.type).toEqual(RESTORE_STYLE);
    });

    it('set style', () => {
        const result = setStyle({});
        expect(result.type).toEqual(SET_STYLE);
        expect(result.style).toExist();
    });

    it('update annotation geometry', () => {
        const result = updateAnnotationGeometry({});
        expect(result.type).toEqual(UPDATE_ANNOTATION_GEOMETRY);
        expect(result.geometry).toExist();
    });

    it('validation error', () => {
        const result = validationError({
            'title': 'error1'
        });
        expect(result.type).toEqual(VALIDATION_ERROR);
        expect(result.errors.title).toEqual('error1');
    });

    it('remove annotation geometry', () => {
        const result = removeAnnotationGeometry('1');
        expect(result.type).toEqual(REMOVE_ANNOTATION_GEOMETRY);
        expect(result.id).toBe('1');
    });

    it('shows annotation', () => {
        const result = showAnnotation('1');
        expect(result.type).toEqual(SHOW_ANNOTATION);
        expect(result.id).toEqual('1');
    });

    it('cancels show annotation', () => {
        const result = cancelShowAnnotation();
        expect(result.type).toEqual(CANCEL_SHOW_ANNOTATION);
    });

    it('creates new annotation', () => {
        const result = newAnnotation();
        expect(result.type).toEqual(NEW_ANNOTATION);
    });

    it('highlights annotation', () => {
        const result = highlight('1');
        expect(result.type).toEqual(HIGHLIGHT);
        expect(result.id).toEqual('1');
    });

    it('cleans highlights', () => {
        const result = cleanHighlight('1');
        expect(result.type).toEqual(CLEAN_HIGHLIGHT);
    });

    it('filters annotaions', () => {
        const result = filterAnnotations('1');
        expect(result.type).toEqual(FILTER_ANNOTATIONS);
        expect(result.filter).toEqual('1');
    });

    it('close annotations', () => {
        const result = closeAnnotations();
        expect(result.type).toEqual(CLOSE_ANNOTATIONS);
    });

    it('confirm close annotations', () => {
        const result = confirmCloseAnnotations();
        expect(result.type).toEqual(CONFIRM_CLOSE_ANNOTATIONS);
    });

    it('changeRadius', () => {
        const radius = "";
        const components = "";
        const crs = "ESPG:4326";
        const result = changeRadius(radius, components, crs);
        expect(result.components).toEqual(components);
        expect(result.radius).toEqual(radius);
        expect(result.crs).toEqual(crs);
        expect(result.type).toEqual(CHANGE_RADIUS);
    });
    it('changeText', () => {
        const text = "";
        const components = "";
        const result = changeText(text, components);
        expect(result.type).toEqual(CHANGE_TEXT);
        expect(result.text).toEqual(text);
        expect(result.components).toEqual(components);
    });

    it('toggleUnsavedGeometryModal', () => {
        const result = toggleUnsavedGeometryModal();
        expect(result.type).toEqual(TOGGLE_GEOMETRY_MODAL);
    });
    it('resetCoordEditor', () => {
        const result = resetCoordEditor();
        expect(result.type).toEqual(RESET_COORD_EDITOR);
    });

    it('cancel close annotations', () => {
        const result = cancelCloseAnnotations();
        expect(result.type).toEqual(CANCEL_CLOSE_ANNOTATIONS);
    });
    it('download  annotations', () => {
        const result = download();
        expect(result.type).toEqual(DOWNLOAD);
    });
    it('updateSymbols', () => {
        const symbols = [{name: "symbol1"}, {name: "symbol2"}];
        let result = updateSymbols(symbols);
        expect(result.type).toEqual(UPDATE_SYMBOLS);
        expect(result.symbols.length).toEqual(2);
        expect(result.symbols[0].name).toEqual(symbols[0].name);

        result = updateSymbols();
        expect(result.symbols.length).toEqual(0);
    });
    it('load  annotations', () => {
        const result = loadAnnotations([]);
        expect(result.type).toEqual(LOAD_ANNOTATIONS);
        expect(result.features).toExist();
        expect(result.override).toBe(false);
    });
    it('setDefaultStyle', () => {
        const result = setDefaultStyle('POINT.symbol', {size: 64});
        expect(result.type).toBe(SET_DEFAULT_STYLE);
        expect(result.path).toBe('POINT.symbol');
        expect(result.style).toEqual({size: 64});
    });
    it('loadDefaultStyles', () => {
        const result = loadDefaultStyles('circle', 64, '#0000FF', '#00FF00', '/path/to/symbols');
        expect(result.type).toBe(LOAD_DEFAULT_STYLES);
        expect(result.shape).toBe('circle');
        expect(result.size).toBe(64);
        expect(result.fillColor).toBe('#0000FF');
        expect(result.strokeColor).toBe('#00FF00');
        expect(result.symbolsPath).toBe('/path/to/symbols');
    });
    it('loading', () => {
        const result = loading(true, 'loadingFlag');
        expect(result.type).toBe(LOADING);
        expect(result.value).toBe(true);
        expect(result.name).toBe('loadingFlag');
    });
    it('toggleVisibilityAnnotation ', () => {
        const result = toggleVisibilityAnnotation('1');
        expect(result.type).toBe(TOGGLE_ANNOTATION_VISIBILITY);
        expect(result.id).toBe('1');
    });
    it('changeGeometryTitle ', () => {
        const result = changeGeometryTitle('New title');
        expect(result.type).toBe(CHANGE_GEOMETRY_TITLE);
        expect(result.title).toBe('New title');
    });
    it('filterMarker ', () => {
        const result = filterMarker('glass');
        expect(result.type).toBe(FILTER_MARKER);
        expect(result.filter).toBe('glass');
    });
});
