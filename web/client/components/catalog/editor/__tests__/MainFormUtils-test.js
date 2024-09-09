import expect from "expect";

import { checkUrl } from '../MainFormUtils';

describe('Catalog Main Form Editor Utils', () => {
    it('checkUrl', () => {
        const URLS = [
            // http
            ['http://myDomain.com/geoserver/wms', 'https://myMapStore.com/geoserver/wms', false, "catalog.invalidUrlHttpProtocol"],
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
            ["geoserver/wms", "https://myMapStore.com/geoserver/wms", true],
            [["geoserver/wms", "geoserver/wms"], "https://myMapStore.com/geoserver/wms", false, "catalog.invalidArrayUsageForUrl"], // array
            ["http://com/geoserver/wms", "https://myMapStore.com/geoserver/wms", false, "catalog.invalidUrlHttpProtocol"]
        ];
        URLS.forEach(([catalogURL, locationURL, valid, messageId]) => {
            const {valid: isValid, errorMsgId} = checkUrl(catalogURL, locationURL);
            expect(!!isValid).toEqual(!!valid, `${catalogURL} - added when location is ${locationURL} should be ${valid}, but it is ${isValid}`);
            expect(messageId).toEqual(errorMsgId);
        });
    });
});
