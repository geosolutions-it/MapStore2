/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

var expect = require('expect');
var {
    DOWNLOAD_FEATURES,
    DOWNLOAD_OPTIONS_CHANGE,
    DOWNLOAD_FINISHED,
    FORMAT_OPTIONS_FETCH,
    FORMAT_OPTIONS_UPDATE,
    downloadFeatures,
    onDownloadOptionChange,
    onDownloadFinished,
    onFormatOptionsFetch,
    updateFormats
} = require('../wfsdownload');

describe('Test correctness of the wfsdownload actions', () => {
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
