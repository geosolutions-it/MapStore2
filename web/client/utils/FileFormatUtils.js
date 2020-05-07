const {head} = require('lodash');

const getFormatByName = (outF) => {
    const extension = outF.split(/[^\w]/)[1];
    return extension ? {outputFormat: outF, extension: extension.toLowerCase()} : undefined;

};

const formatToGlyph = {
    json: 'ext-json',
    wmc: 'ext-wmc'
};

const formatToText = {
    json: 'JSON',
    wmc: 'WMC'
};

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
}, {
    outputFormat: "application/vnd.google-earth.kml+xml",
    extension: "kml"
}, {
    outputFormat: "application/json",
    extension: "json"
}, {
    outputFormat: "gml3",
    extension: "gml"
}, {
    outputFormat: "GML2",
    extension: "gml"
}, {
    outputFormat: "application/vnd.googlxml",
    extension: "kml"
}, {
    outputFormat: "OGR-CSV",
    extension: "csv"
}, {
    outputFormat: "OGR-FileGDB",
    extension: "gdb"
}, {
    outputFormat: "OGR-GPKG",
    extension: "gpkg"
}, {
    outputFormat: "OGR-KML",
    extension: "kml"
}, {
    outputFormat: "OGR-MIF",
    extension: "mif"
}, {
    outputFormat: "OGR-TAB",
    extension: "tab"
}, {
    outputFormat: "SHAPE-ZIP",
    extension: "zip"
}, {
    outputFormat: "gml32",
    extension: "gml"
}, {
    outputFormat: "application/x-gpk",
    extension: "gpk"
}
];

module.exports = {
    formats,
    formatToGlyph,
    formatToText,
    getByOutputFormat: (outF) => head(formats.filter(format => format.outputFormat === outF)) || getFormatByName(outF)
};
