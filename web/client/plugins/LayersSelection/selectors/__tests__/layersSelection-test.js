import { filterLayerForSelect } from '../layersSelection';
import expect from 'expect';


describe('LayersSelection Selectors', () => {

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
