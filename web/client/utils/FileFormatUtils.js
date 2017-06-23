const {head} = require('lodash');
const formats = [{
        outputFormat: "shape-zip",
        extension: "zip"
    }, {
            outputFormat: "csv",
            extension: "csv"
    }, {
        outputFormat: "excel",
        extension: "xls"
    }, {
        outputFormat: "excel2007",
        extension: "xlsx"
    }, {
        outputFormat: "dxf",
        extension: "dxf"
    }, {
        outputFormat: "dxf-zip",
        extension: "zip"
    }
];

module.exports = {
    formats,
    getByOutputFormat: (outF) => head(formats.filter(format => format.outputFormat === outF))
};
