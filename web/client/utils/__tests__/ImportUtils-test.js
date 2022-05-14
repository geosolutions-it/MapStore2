import expect from 'expect';
import {checkFeaturesStyle} from '../ImporterUtils';

describe('ImporterUtils', () => {
    it('should return false if layer features donot have styles', () => {
        const layer = {name: 'Layer', features: [{name: 'Feature'}]};
        const hasStyles = checkFeaturesStyle(layer);
        expect(hasStyles).toBeFalsy();
    });

    it('should return true if layer features have style array with an item', () => {
        const layer = {name: 'Layer', features: [{name: 'Feature', style: [{color: 'red'}]}]};
        const hasStyles = checkFeaturesStyle(layer);
        expect(hasStyles).toBeTruthy();
    });

    it('should return true if layer features have style Object with atleast one item', () => {
        const layer = {name: 'Layer', features: [{name: 'Feature', style: {color: 'red'}}]};
        const hasStyles = checkFeaturesStyle(layer);
        expect(hasStyles).toBeTruthy();
    });
});
