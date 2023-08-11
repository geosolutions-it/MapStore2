/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    cdata,
    complexData,
    literalData,
    processData,
    processParameter,
    rawDataOutput,
    responseForm
} from './common';
import {executeProcessXML} from './execute';

/**
 * function used to generate the Execute wps process payload for
 * the geo:buffer
 * @param {object} options the options to use
 * @param {string} options.geometry3857 the geometry coordinates reprojected in 3857
 * @param {number} options.distance the distance to buffer the input geometry, in the units of the geometry
 * @param {number} options.quadrantSegments Number determining the style and smoothness of buffer corners. Positive numbers create round corners with that number of segments per quarter-circle, 0 creates flat corners.
 * @param {string} options.capStyle Style for the buffer end caps. Values are: Round - rounded ends (default), Flat - flat ends; Square - square ends.
 * @return {string} the body payload for the wps process
 */
export const bufferXML = ({
    geometry3857,
    distance = 100,
    quadrantSegments,
    capStyle
}) => {
    const payload = [
        processParameter('geom', processData(complexData(cdata(geometry3857), "application/wkt"))),
        processParameter('distance', processData(literalData(distance))),
        ...(quadrantSegments ? [processParameter("quadrantSegments", processData(literalData(quadrantSegments)))] : []),
        ...(capStyle ? [processParameter("capStyle", processData(literalData(capStyle)))] : [])
    ];
    return executeProcessXML(
        'geo:buffer',
        payload,
        responseForm(
            rawDataOutput('result', "application/json")
        )
    );
};

export default bufferXML;
