/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import {
    loadAnnotations,
    newAnnotation,
    editAnnotation,
    download,
    confirmCloseAnnotations,
    removeAnnotation,
    mergeAnnotationsFeatures
} from '../../actions/annotations';
import {
    REMOVE_LAYER,
    ADD_LAYER,
    UPDATE_NODE,
    SELECT_NODE
} from '../../../../actions/layers';
import {
    HIDE_MAPINFO_MARKER,
    CLOSE_IDENTIFY,
    PURGE_MAPINFO_RESULTS
} from '../../../../actions/mapInfo';
import {
    SET_CONTROL_PROPERTY
} from '../../../../actions/controls';
import {
    SHOW_NOTIFICATION
} from '../../../../actions/notifications';
import {
    loadAnnotationsEpic,
    newAnnotationEpic,
    editAnnotationEpic,
    downloadAnnotationsEpic,
    confirmCloseAnnotationsEpic,
    removeAnnotationsEpic,
    mergeAnnotationsFeaturesEpic
} from '../annotations';
import { testEpic } from '../../../../epics/__tests__/epicTestUtils';

describe('annotations epics', () => {
    it('loadAnnotationsEpic override false', (done) => {
        const state = {
            layers: {
                flat: [{ id: 'annotations:1', features: [], type: 'vector', rowViewer: 'annotations' }]
            }
        };
        const annotations = [{ id: 'annotations:2', features: [], type: 'vector', rowViewer: 'annotations' }];
        testEpic(loadAnnotationsEpic, 1, loadAnnotations(annotations, false), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ ADD_LAYER ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('loadAnnotationsEpic override false same id', (done) => {
        const state = {
            layers: {
                flat: [{ id: 'annotations:1', features: [], type: 'vector', rowViewer: 'annotations' }]
            }
        };
        const annotations = [{ id: 'annotations:1', features: [], type: 'vector', rowViewer: 'annotations' }];
        testEpic(loadAnnotationsEpic, 1, loadAnnotations(annotations, false), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ UPDATE_NODE ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('loadAnnotationsEpic override true', (done) => {
        const state = {
            layers: {
                flat: [{ id: 'annotations:1', features: [], type: 'vector', rowViewer: 'annotations' }]
            }
        };
        const annotations = [{ id: 'annotations:2', features: [], type: 'vector', rowViewer: 'annotations' }];
        testEpic(loadAnnotationsEpic, 2, loadAnnotations(annotations, true), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ REMOVE_LAYER, ADD_LAYER ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('newAnnotationEpic', (done) => {
        const state = {};
        testEpic(newAnnotationEpic, 4, newAnnotation(), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([
                    HIDE_MAPINFO_MARKER,
                    ADD_LAYER,
                    SELECT_NODE,
                    SET_CONTROL_PROPERTY
                ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('editAnnotationEpic', (done) => {
        const state = {
            layers: {
                flat: [{ id: 'annotations:1', features: [], type: 'vector', rowViewer: 'annotations' }],
                selected: []
            }
        };
        testEpic(editAnnotationEpic, 3, editAnnotation('annotations:1'), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([
                    HIDE_MAPINFO_MARKER,
                    SELECT_NODE,
                    SET_CONTROL_PROPERTY
                ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('editAnnotationEpic layer already selected', (done) => {
        const state = {
            layers: {
                flat: [{ id: 'annotations:1', features: [], type: 'vector', rowViewer: 'annotations' }],
                selected: ['annotations:1']
            }
        };
        testEpic(editAnnotationEpic, 2, editAnnotation('annotations:1'), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([
                    HIDE_MAPINFO_MARKER,
                    SET_CONTROL_PROPERTY
                ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('downloadAnnotationsEpic error', (done) => {
        const state = {};
        testEpic(downloadAnnotationsEpic, 1, download('wrong-type'), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([SHOW_NOTIFICATION]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('confirmCloseAnnotationsEpic remove if features are empty', (done) => {
        const state = {};
        testEpic(confirmCloseAnnotationsEpic, 2, confirmCloseAnnotations({ id: 'annotations:1', features: [] }), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ SET_CONTROL_PROPERTY, REMOVE_LAYER ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('confirmCloseAnnotationsEpic update if features are not empty', (done) => {
        const state = {};
        testEpic(confirmCloseAnnotationsEpic, 2, confirmCloseAnnotations({ id: 'annotations:1', features: [{ id: 'feature-01', type: 'Feature', properties: { id: 'feature-01', annotationType: 'Point' }, geometry: { type: 'Point', coordinates: [0, 0] } }] }), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ SET_CONTROL_PROPERTY, UPDATE_NODE ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('removeAnnotationsEpic', (done) => {
        const state = {};
        testEpic(removeAnnotationsEpic, 3, removeAnnotation('annotations:1'), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ PURGE_MAPINFO_RESULTS, CLOSE_IDENTIFY, REMOVE_LAYER ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
    it('mergeAnnotationsFeaturesEpic', (done) => {
        const state = {
            layers: {
                flat: [{ id: 'annotations:1', style: {format: 'geostyler', body: { neme: '', rules: [] }}, features: [], type: 'vector', rowViewer: 'annotations' }]
            }
        };
        const annotation = { id: 'annotations:2', style: {format: 'geostyler', body: { neme: '', rules: [{ name: '', symbolizers: [{ kind: 'Mark' }] }] }}, features: [{ id: 'feature-01', type: 'Feature', properties: { id: 'feature-01', annotationType: 'Point' }, geometry: { type: 'Point', coordinates: [0, 0] } }], type: 'vector', rowViewer: 'annotations' };
        testEpic(mergeAnnotationsFeaturesEpic, 1, mergeAnnotationsFeatures('annotations:1', annotation), (actions) => {
            try {
                expect(actions.map(({ type }) => type)).toEqual([ UPDATE_NODE ]);
                done();
            } catch (e) {
                done(e);
            }
        }, state);
    });
});
