/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {
    processParameter,
    processReference,
    responseForm,
    rawDataOutput
} from './common';
import { executeProcess, executeProcessXML } from './execute';

export const boundsXML = ({wfsGetFeature}) => executeProcessXML(
    'gs:Bounds',
    [
        processParameter('features', processReference('text/xml', 'http://geoserver/wfs', 'POST', wfsGetFeature))
    ],
    responseForm(rawDataOutput('bounds', 'application/json'))
);

const bounds = (url, options, requestOptions = {}) => executeProcess(url, boundsXML(options), {}, requestOptions);

export default bounds;
