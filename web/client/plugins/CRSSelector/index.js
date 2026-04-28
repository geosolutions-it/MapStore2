/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import crsselectorReducers from './reducers/crsselector';
import annotationsReducers from '../Annotations/reducers/annotations';
import crsselectorEpics  from './epics/crsselector';

import CRSSelector from './containers/CRSSelector';
import { createPlugin } from '../../utils/PluginsUtils';

/**
  * CRSSelector Plugin is a plugin that switches from to the pre-configured projections.
  * it gets displayed into the mapFooter plugin
  * @name CRSSelector
  * @memberof plugins
  * @class
  * @prop {object[]} projectionDefs list of additional project definitions
  * @prop {array} cfg.allowedRoles list of the authorized roles that can use the plugin, if you want all users to access the plugin, add a "ALL" element to the array.
  * @prop {array} cfg.availableProjections list of the available projections to be displayed in the combobox.
  * @prop {string[]} cfg.filterAllowedCRS (deprecated) list of allowed crs in the combobox list to used as filter for the one of retrieved proj4.defs()
  * @prop {object} cfg.additionalCRS (deprecated) additional crs added to the list. The label param is used after in the combobox.
  * @prop {string} cfg.projectionDefsEndpoint (optional) if provided, the plugin will fetch available projections from this endpoint.
  *
  * @example
  * // If you want to add some crs you need to provide a definition and adding it in the additionalCRS property
  * // Put the following lines at the first level of the localconfig
  * {
  *   "projectionDefs": [{
  *     "code": "EPSG:3003",
  *     "def": "+proj=tmerc +lat_0=0 +lon_0=9 +k=0.9996 +x_0=1500000 +y_0=0 +ellps=intl+towgs84=-104.1,-49.1,-9.9,0.971,-2.917,0.714,-11.68 +units=m +no_defs",
  *     "extent": [1241482.0019, 973563.1609, 1830078.9331, 5215189.0853],
  *     "worldExtent": [6.6500, 8.8000, 12.0000, 47.0500]
  *   }]
  * }
  * @example
  * // And configure the new projection for the plugin as below:
  * { "name": "CRSSelector",
  *   "cfg": {
  *     "projectionDefsEndpoint": "https://example.com/geoserver/rest/crs",
  *     "availableProjections": [
  *       { "value": "EPSG:4326", "label": "EPSG:4326" },
  *       { "value": "EPSG:3857", "label": "EPSG:3857" },
  *       { "value": "EPSG:3003", "label": "EPSG:3003" }
  *     ],
  *     "allowedRoles" : ["ADMIN", "USER", "ALL"]
  *   }
  * }
*/
export default createPlugin('CRSSelector', {
    component: CRSSelector,
    reducers: {
        crsselector: crsselectorReducers,
        annotations: annotationsReducers
    },
    epics: {
        ...crsselectorEpics
    },
    options: {
        disablePluginIf: "{state('mapType') === 'leaflet'}"
    },
    containers: {
        MapFooter: {
            name: "crsSelector",
            position: 10,
            target: 'right-footer',
            priority: 1
        }
    }
});
