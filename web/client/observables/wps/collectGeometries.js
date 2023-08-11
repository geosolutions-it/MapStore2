/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {
    processReference,
    processParameter,
    rawDataOutput,
    responseForm
} from './common';
import {executeProcessXML} from './execute';

import requestBuilder from '../../utils/ogc/WFS/RequestBuilder';

const {
    getFeature,
    query
} = requestBuilder({ wfsVersion: "1.1.0" });

/**
 * function used to generate the Execute wps process payload for
 * the gs:CollectGeometries
 * @param {object} options the options to use
 * @param {string} options.name the layer typeName
 */
export const collectGeometriesXML = ({
    name
}) => executeProcessXML(
    'gs:CollectGeometries',
    [
        processParameter('features', processReference(
            "test/xml",
            "http://geoserver/wfs",
            'POST',
            getFeature(query(name))
        ))
    ],
    responseForm(
        rawDataOutput('result', "application/json")
    )
);

export default collectGeometriesXML;
