
import expect from 'expect';
import {
    cleanSelection,
    SELECT_CLEAN_SELECTION,
    storeConfiguration,
    SELECT_STORE_CFG,
    addOrUpdateSelection,
    ADD_OR_UPDATE_SELECTION,
    updateSelectionFeature,
    UPDATE_SELECTION_FEATURE
} from '../layersSelection';

describe('LayersSelection Actions', () => {
    describe('cleanSelection', () => {
        it('should create action with a geometry type Point', () => {
            const geomType = 'Point';
            const action = cleanSelection(geomType);

            expect(action).toEqual({
                type: SELECT_CLEAN_SELECTION,
                geomType
            });
        });

        it('should create action of a store Configuration', () => {
            const cfg = {};
            const action = storeConfiguration(cfg);

            expect(action).toEqual({
                type: SELECT_STORE_CFG,
                cfg
            });
        });

        it('should create action to add or update selection', () => {
            const layer = 'name layer';
            const geoJsonData = {};
            const action = addOrUpdateSelection(layer, geoJsonData);

            expect(action).toEqual({
                type: ADD_OR_UPDATE_SELECTION,
                layer,
                geoJsonData
            });
        });

        it('should create action to update feature selection', () => {
            const feature = {};
            const action = updateSelectionFeature(feature);

            expect(action).toEqual({
                type: UPDATE_SELECTION_FEATURE,
                feature
            });
        });

    });
});
