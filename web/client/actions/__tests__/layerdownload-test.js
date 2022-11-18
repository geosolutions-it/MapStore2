/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import expect from 'expect';

import {
    DOWNLOAD_FEATURES,
    DOWNLOAD_OPTIONS_CHANGE,
    DOWNLOAD_FINISHED,
    FORMAT_OPTIONS_FETCH,
    FORMAT_OPTIONS_UPDATE,
    CHECK_WPS_AVAILABILITY,
    SET_WPS_AVAILABILITY,
    downloadFeatures,
    onDownloadOptionChange,
    onDownloadFinished,
    onFormatOptionsFetch,
    updateFormats,
    checkWPSAvailability,
    setWPSAvailability
} from '../layerdownload';

describe('Test correctness of the layerdownload actions', () => {
    it('test checkWPSAvailability action', () => {
        const checkingUrl =
            'https://gs-stable.geo-solutions.it/geoserver/wps?service=WPS&version=1.0.0&REQUEST=DescribeProcess&IDENTIFIER=gs%3ADownloadEstimator%2Cgs%3ADownload';
        let {type, url, selectedService} = checkWPSAvailability(checkingUrl, 'wfs');
        expect(type).toBe(CHECK_WPS_AVAILABILITY);
        expect(url).toBe(checkingUrl);
        expect(selectedService).toBe('wfs');
    });
    it('test downloadFeatures action', () => {
        let {type, url, filterObj, downloadOptions} = downloadFeatures("url", "filterObj", "downloadOptions");
        expect(type).toBe(DOWNLOAD_FEATURES);
        expect(url).toBe("url");
        expect(filterObj).toBe("filterObj");
        expect(downloadOptions).toBe("downloadOptions");
    });
    it('test onDownloadOptionChange action', () => {
        let {type, key, value} = onDownloadOptionChange("key", "value");
        expect(type).toBe(DOWNLOAD_OPTIONS_CHANGE);
        expect(key).toBe("key");
        expect(value).toBe("value");
    });
    it('test onDownloadFinished action', () => {
        let {type} = onDownloadFinished();
        expect(type).toBe(DOWNLOAD_FINISHED);
    });
    it('test setWPSAvailability action', () => {
        let {type, value} = setWPSAvailability(true);
        expect(type).toBe(SET_WPS_AVAILABILITY);
        expect(value).toBe(true);
    });
    it('test onFormatOptionsFetch action', () => {
        let {type, layer} = onFormatOptionsFetch("layer");
        expect(type).toBe(FORMAT_OPTIONS_FETCH);
        expect(layer).toBe("layer");
    });
    it('test updateFormats action', () => {
        let {type, wfsFormats} = updateFormats("wfsFormats");
        expect(type).toBe(FORMAT_OPTIONS_UPDATE);
        expect(wfsFormats).toBe("wfsFormats");
    });

});
