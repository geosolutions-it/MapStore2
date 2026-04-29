/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';
import layersSelection from '../layersSelection';
import {
    storeConfiguration,
    addOrUpdateSelection,
    cleanSelection
} from '../../actions/layersSelection';

const GeoJsonfeatures = {
    "type": "FeatureCollection",
    "crs": {
        "type": "name",
        "properties": {
            "name": "EPSG:4326"
        }
    },
    "features": [
        {
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [102.0, 0.5]
            },
            "properties": {
                "name": "Sample Point"
            }
        }
    ]
};

describe('LayersSelection Reducer', () => {
    const initialState = {
        cfg: {},
        selections: {}
    };

    describe('Initial State', () => {
        it('should return initial state when state is undefined', () => {
            const state = layersSelection(undefined, { type: 'UNKNOWN_ACTION' });
            expect(state).toEqual(initialState);
        });

        it('should return update state cfg ', () => {
            const highlightOptions = {};
            const queryOptions = {};

            const updatedStateToSetcfg = {
                cfg: { highlightOptions, queryOptions }
            };

            const state = layersSelection(initialState, storeConfiguration(updatedStateToSetcfg));
            expect(state.cfg).toEqual(updatedStateToSetcfg);
        });

        it('should add to selection ', () => {

            const layer = {
                id: 'fakelayerId'
            };
            const state = layersSelection(initialState, addOrUpdateSelection(layer, GeoJsonfeatures));
            expect(state.selections[layer.id]).toEqual(GeoJsonfeatures);
        });

        it('should delete selected geom type ', () => {
            const state = layersSelection(initialState, cleanSelection(null));
            expect(state.drawType).toBeFalsy();
            expect(state.selectionFeature).toBeFalsy();
        });
    });
});
