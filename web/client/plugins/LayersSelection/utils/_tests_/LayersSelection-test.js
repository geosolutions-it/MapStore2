import { makeCrsValid } from '../LayersSelection';
import expect from 'expect';

describe('LayersSelection Utils', () => {

    describe('Crs is valid should return same Crs', () => {
        // TODO
        // makeCrsValid
        const mockCRS = 'EPSG:2056';
        const crs = makeCrsValid(mockCRS);
        expect(crs).toEqual(mockCRS);
    });

    describe('CRS number should be convert as valid CRS ', () => {
        // TODO
        // makeCrsValid
        const mockCRS = '2056';
        const CRSValid = 'EPSG:2056';
        const crs = makeCrsValid(mockCRS);
        expect(crs).toEqual(CRSValid);
    });

    describe('CRS number should not be convert as default if it is valid ', () => {
        // TODO
        // makeCrsValid
        const mockCRS = '2056';
        const defaultCRS = 'EPSG:4326';
        const crs = makeCrsValid(mockCRS);
        expect(crs).toNotEqual(defaultCRS);
    });
});
