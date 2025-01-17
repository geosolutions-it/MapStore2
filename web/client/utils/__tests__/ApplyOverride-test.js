import expect from 'expect';
import { applyOverrides } from '../ConfigUtils';

/*
Tests to check override logic for original Config and override config
*/
describe('applyOverrides', () => {

    it('should merge simple objects', () => {
        const config = { key1: 'value1', key2: 'value2' };
        const override = { key2: 'overriddenValue', key3: 'newKey' };
        const expected = { key1: 'value1', key2: 'overriddenValue', key3: 'newKey' };

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });

    it('should prioritize values from the override when arrays are empty', () => {
        const config = { layers: [{ id: 1, name: 'layer1' }] };
        const override = { layers: [] };
        const expected = { layers: [{ id: 1, name: 'layer1' }] };

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });

    it('should keep original array if override array is empty', () => {
        const config = { layers: [{ id: 1, name: 'layer1' }] };
        const override = { layers: [] };
        const expected = { layers: [{ id: 1, name: 'layer1' }] };

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });

    it('should return an empty object when both config and override are empty', () => {
        const config = {};
        const override = {};
        const expected = {};

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });

    it('should merge arrays with no overrides gracefully', () => {
        const config = { layers: [{ id: 1, name: 'layer1' }] };
        const override = {};
        const expected = { layers: [{ id: 1, name: 'layer1' }] };

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });


    it('should handle deep merging where the array is part of the config object', () => {
        const config = { settings: { layers: [{ id: 1, name: 'layer1' }] } };
        const override = { settings: { layers: [{ id: 2, name: 'layer2' }] } };
        const expected = { settings: { layers: [{ id: 2, name: 'layer2' }] } };

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });


    it('should return merged result even with deeply nested objects', () => {
        const config = { settings: { layers: [{ id: 1, name: 'layer1' }] } };
        const override = { settings: { layers: [{ id: 2, name: 'layer2' }] } };
        const expected = { settings: { layers: [{ id: 2, name: 'layer2' }] } };

        const result = applyOverrides(config, override);
        expect(result).toEqual(expected);
    });

});
