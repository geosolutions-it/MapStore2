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
