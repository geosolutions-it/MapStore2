/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const FileSaver = require('browser-filesaver');
const toBlob = require('canvas-to-blob');


const FileUtils = {
    download: function(blob, name, mimetype) {
        let file = new Blob([blob], {type: mimetype});
        // a.href = URL.createObjectURL(file);
        FileSaver.saveAs(file, name);
    },

    downloadCanvasDataURL: function(dataURL, name, mimetype) {
        FileUtils.download(toBlob(dataURL), "snapshot.png", mimetype);
    }
};
module.exports = FileUtils;
