import expect from "expect";

import { isValidURL } from '../MainFormUtils';

describe('Catalog Main Form Editor Utils', () => {
    it('isValidURL', () => {
        const URLS = [
            // http
            ['http://myDomain.com/geoserver/wms', 'https://myMapStore.com/geoserver/wms', false],
            ['http://myDomain.com/geoserver/wms', 'http://myMapStore.com/geoserver/wms', true],
            // https
            ['https://myDomain.com/geoserver/wms', 'http://myMapStore.com/geoserver/wms', true],
            ['https://myDomain.com/geoserver/wms', 'https://myMapStore.com/geoserver/wms', true],
            // protocol relative URL
            ['//myDomain.com/geoserver/wms', 'http://myMapStore.com/geoserver/wms', true],
            ['//myDomain.com/geoserver/wms', 'https://myMapStore.com/geoserver/wms', true],
            // absolute path
            ['/geoserver/wms', 'http://myMapStore.com/geoserver/wms', true],
            ['/geoserver/wms', 'https://myMapStore.com/geoserver/wms', true],
            // relative path
            ["geoserver/wms", "http://myMapStore.com/geoserver/wms", true],
            ["geoserver/wms", "https://myMapStore.com/geoserver/wms", true]


        ];
        URLS.forEach(([catalogURL, locationURL, valid]) => {
            const result = isValidURL(catalogURL, locationURL);
            expect(!!result).toEqual(!!valid, `${catalogURL} - added when location is ${locationURL} should be ${valid}, but it is ${result}`);
        });
    });
});
