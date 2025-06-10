/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { castArray } from 'lodash';
import {
    processParameter,
    processData,
    literalData,
    processReference,
    responseForm,
    rawDataOutput
} from './common';
import { executeProcessXML, executeProcess } from './execute';

export const aggregateXML = ({featureType, aggregationAttribute, classificationAttribute = [], groupByAttributes = [], aggregateFunction, viewParams, filter = ""}) => {
    const getFeature =
        `<wfs:GetFeature ${viewParams ? `viewParams="${viewParams}"` : ""} outputFormat="GML2" service="WFS" version="1.0.0">` +
        `<wfs:Query typeName="${featureType}">${filter}</wfs:Query></wfs:GetFeature>`;

    return executeProcessXML(
        'gs:Aggregate',
        [
            processParameter('features', processReference('text/xml', 'http://geoserver/wfs', 'POST', getFeature)),
            processParameter('aggregationAttribute', processData(literalData(aggregationAttribute))),
            ...castArray(aggregateFunction).map(fun => processParameter('function', processData(literalData(fun)))),
            processParameter('singlePass', processData(literalData('false'))),
            ...castArray(groupByAttributes).map(attribute => processParameter('groupByAttributes', processData(literalData(attribute)))),
            ...castArray(classificationAttribute).map(attribute => processParameter('groupByAttributes', processData(literalData(attribute))))
        ],
        responseForm(rawDataOutput('result', 'application/json'))
    );
};

const aggregate = (url, options, requestOptions = {}, layer) => executeProcess(url, aggregateXML(options), {}, requestOptions, layer);

export default aggregate;
