import { filterLayerForSelect, canDrawSelection } from '../layersSelection';
import expect from 'expect';


describe('LayersSelection Selectors', () => {

    it('only enables drawing while the tool is open with an eligible checked layer', () => {
        const state = {
            controls: { layersSelection: { enabled: true } },
            layers: { flat: [{ id: 'layer', type: 'wms', visibility: true }] }
        };
        expect(canDrawSelection(state)).toBe(true);
        expect(canDrawSelection({ ...state, controls: {} })).toBe(false);
        expect(canDrawSelection({ ...state, layers: { flat: [{ type: 'wms', visibility: true, isSelectQueriable: false }] } })).toBe(false);
        expect(canDrawSelection({ ...state, layers: { flat: [{ type: 'vector', isSelectQueriable: true }] } })).toBe(false);
        expect(canDrawSelection({ ...state, layers: { flat: [] } })).toBe(false);
    });

    describe('Keep a layer', () => {

        const layerToKeep = {
            group: 'testA',
            type: 'wms'
        };

        const filteredLayer = filterLayerForSelect(layerToKeep);
        expect(filteredLayer).toBeTruthy();
    });

    describe('filter a layer', () => {

        const layerToFilter = {
            group: 'background',
            type: 'wms'
        };

        const filteredLayer = filterLayerForSelect(layerToFilter);
        expect(filteredLayer).toBeFalsy();
    });


});
