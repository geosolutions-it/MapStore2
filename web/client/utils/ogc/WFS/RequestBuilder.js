/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const filterBuilder = require('../Filter/FilterBuilder');
const {wfsToGmlVersion} = require("./base");
const getStaticAttributesWFS1 = (ver) => 'service="WFS" version="' + ver + '" ' +
    (ver === "1.0.0" ? 'outputFormat="GML2" ' : "") +
    'xmlns:gml="http://www.opengis.net/gml" ' +
    'xmlns:wfs="http://www.opengis.net/wfs" ' +
    'xmlns:ogc="http://www.opengis.net/ogc" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xsi:schemaLocation="http://www.opengis.net/wfs ' +
    (ver === "1.0.0" ? `http://schemas.opengis.net/wfs/${ver}/WFS-basic.xsd"` : `http://schemas.opengis.net/wfs/${ver}/wfs.xsd"`);
const getStaticAttributesWFS2 = (ver) => 'service="WFS" version="' + ver + '" ' +
    'xmlns:wfs="http://www.opengis.net/wfs/2.0" ' +
    'xmlns:fes="http://www.opengis.net/fes/2.0" ' +
    'xmlns:gml="http://www.opengis.net/gml/3.2" ' +
    'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
    'xsi:schemaLocation="http://www.opengis.net/wfs/2.0 ' +
        'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' +
        'http://www.opengis.net/gml/3.2 ' +
        'http://schemas.opengis.net/gml/3.2.1/gml.xsd"';

module.exports = function({wfsVersion = "1.1.0", gmlVersion, filterNS, wfsNS="wfs"}) {
    let gmlV = gmlVersion;
    if (!gmlV && wfsVersion) {
        gmlV = wfsToGmlVersion(wfsVersion);
    } else if (!gmlV) {
        gmlV = "3.1.1";
    }
    const requestAttributes = ({
        resultType,
        outputFormat,
        startIndex,
        maxFeatures
    } = {}) => {
        const getMaxFeatures = (mf) => wfsVersion.indexOf("2.") === 0 ? `count=${mf}` : `maxFeatures=${mf}`;
        return (wfsVersion.indexOf("1.") === 0 ? getStaticAttributesWFS1(wfsVersion) : getStaticAttributesWFS2(wfsVersion))
            + (resultType ? ` resultType=${resultType}` : "")
            + (outputFormat ? ` outputFormat=${outputFormat}` : ``)
            + ((startIndex || startIndex === 0) ? ` startIndex=${startIndex}` : "")
            + ((maxFeatures || maxFeatures === 0) ? ` ${getMaxFeatures(maxFeatures)}` : "");
    };
    return {
        ...filterBuilder({gmlVersion: gmlV, wfsVersion, filterNS: filterNS || wfsVersion === "2.0" ? "fes" : "ogc"}),
        /**
         * generate a getFeature request.
         * @param  {object} opts    object with : `resultType` (null or 'hits'), outputFormat, startIndex, maxFeatures
         * @param  {string|string[]} content content of the request
         * @return {string}         The request body
         */
        getFeature: (content, opts) => `<${wfsNS}:GetFeature ${requestAttributes(opts)}>${Array.isArray(content) ? content.join("") : content}</${wfsNS}:GetFeature>`,
        query: (featureName, content, ...other) =>
            `<${wfsNS}:Query ${wfsVersion === "2.0" ? "typeNames" : "typeName"}="${featureName}" srsName="EPSG:4326">`
            + (other && other.length > 0
                    ? `${[Array.isArray(content) ? content.join("") : content, ...other].join("") }`
                    : `${Array.isArray(content) ? content.join("") : content}`)
            + `</${wfsNS}:Query>`
    };

};
