/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isImageServerUrl } from './ArcGISUtils';
import { getConfigProp } from './ConfigUtils';
import uuid from 'uuid';
import { isEmpty } from 'lodash';
import url from 'url';
import { ServerTypes } from './LayersUtils';


export const SOURCE_TYPES = {
    LOCAL: 'LOCAL',
    REMOTE: 'REMOTE'
};

export const FEATURE_INFO_FORMAT = 'TEMPLATE';

export const GXP_PTYPES = {
    'AUTO': 'gxp_wmscsource',
    'OWS': 'gxp_wmscsource',
    'WMS': 'gxp_wmscsource',
    'WFS': 'gxp_wmscsource',
    'WCS': 'gxp_wmscsource',
    'REST_MAP': 'gxp_arcrestsource',
    'REST_IMG': 'gxp_arcrestsource',
    'HGL': 'gxp_hglsource',
    'GN_WMS': 'gxp_geonodecataloguesource'
};

const datasetAttributeSetToFields = ({ attribute_set: attributeSet = [] }) => {
    return attributeSet
        .filter(({ attribute_type: type }) => !type.includes('gml:'))
        .map(({
            attribute,
            attribute_label: alias,
            attribute_type: type
        }) => {
            return {
                name: attribute,
                alias: alias,
                type: type
            };
        });
};

export const getDimensions = ({links, has_time: hasTime} = {}) => {
    const { url: wmsUrl } = links?.find(({ link_type: linkType }) => linkType === 'OGC:WMS') || {};
    const { url: wmtsUrl } = links?.find(({ link_type: linkType }) => linkType === 'OGC:WMTS') || {};
    const dimensions = [
        ...(hasTime ? [{
            name: 'time',
            source: {
                type: 'multidim-extension',
                url: wmtsUrl || (wmsUrl || '').split('/geoserver/')[0] + '/geoserver/gwc/service/wmts'
            }
        }] : [])
    ];
    return dimensions;
};

function getExtentFromResource({ extent }) {
    if (isEmpty(extent?.coords)) {
        return null;
    }
    const [minx, miny, maxx, maxy] = extent.coords;

    // if the extent is greater than the max extent of the WGS84 return null
    const WGS84_MAX_EXTENT = [-180, -90, 180, 90];
    if (minx < WGS84_MAX_EXTENT[0] || miny < WGS84_MAX_EXTENT[1] || maxx > WGS84_MAX_EXTENT[2] || maxy > WGS84_MAX_EXTENT[3]) {
        return null;
    }
    const bbox = {
        crs: 'EPSG:4326',
        bounds: { minx, miny, maxx, maxy }
    };
    return bbox;
}

/**
* convert resource layer configuration to a mapstore layer object
* @param {object} resource geonode layer resource
* @return {object}
*/
export const resourceToLayerConfig = (resource) => {

    const {
        alternate,
        links = [],
        featureinfo_custom_template: template,
        title,
        perms,
        pk,
        default_style: defaultStyle,
        ptype,
        subtype,
        sourcetype,
        data: layerSettings
    } = resource;

    const bbox = getExtentFromResource(resource);
    const defaultStyleParams = defaultStyle && {
        defaultStyle: {
            title: defaultStyle.sld_title,
            name: defaultStyle.workspace ? `${defaultStyle.workspace}:${defaultStyle.name}` : defaultStyle.name
        }
    };

    const extendedParams = {
        pk,
        mapLayer: {
            dataset: resource
        },
        ...defaultStyleParams
    };

    if (subtype === '3dtiles') {

        const { url: tilesetUrl } = links.find(({ extension }) => (extension === '3dtiles')) || {};

        return {
            id: uuid(),
            type: '3dtiles',
            title,
            url: tilesetUrl,
            ...(bbox && { bbox }),
            visibility: true,
            extendedParams
        };
    }
    if (subtype === 'cog') {
        const { url: cogUrl } = links.find(({ extension }) => (extension === 'cog')) || {};
        return {
            perms,
            id: uuid(),
            type: 'cog',
            title,
            sources: [{
                url: cogUrl
            }],
            ...(bbox && { bbox }),
            visibility: true,
            extendedParams
        };
    }

    switch (ptype) {
    case GXP_PTYPES.REST_MAP:
    case GXP_PTYPES.REST_IMG: {
        const { url: arcgisUrl } = links.find(({ mime, link_type: linkType }) => (mime === 'text/html' && linkType === 'image')) || {};
        return {
            perms,
            id: uuid(),
            pk,
            type: 'arcgis',
            ...(isImageServerUrl(arcgisUrl)
                ? { queryable: false }
                : { name: alternate.replace('remoteWorkspace:', '') }),
            url: arcgisUrl,
            ...(bbox && { bbox }),
            title,
            visibility: true,
            extendedParams
        };
    }
    default:
        const { url: wfsUrl } = links.find(({ link_type: linkType }) => linkType === 'OGC:WFS') || {};
        const { url: wmsUrl } = links.find(({ link_type: linkType }) => linkType === 'OGC:WMS') || {};

        const dimensions = getDimensions(resource);

        const params = wmsUrl && url.parse(wmsUrl, true).query;
        const {
            defaultLayerFormat = 'image/png',
            defaultTileSize = 512
        } = getConfigProp('geoNodeSettings') || {};
        const fields = datasetAttributeSetToFields(resource);
        return {
            perms,
            id: uuid(),
            pk,
            type: 'wms',
            name: alternate,
            url: wmsUrl || '',
            format: defaultLayerFormat,
            ...(wfsUrl && {
                search: {
                    type: 'wfs',
                    url: wfsUrl
                }
            }),
            ...(bbox ? { bbox } : { bboxError: true }),
            ...(template && {
                featureInfo: {
                    format: FEATURE_INFO_FORMAT,
                    template
                }
            }),
            style: defaultStyleParams?.defaultStyle?.name || '',
            title,
            tileSize: defaultTileSize,
            visibility: true,
            ...(params && { params }),
            ...(dimensions.length > 0 && ({ dimensions })),
            extendedParams,
            ...(fields && { fields }),
            ...(sourcetype === SOURCE_TYPES.REMOTE && !wmsUrl.includes('/geoserver/') && {
                serverType: ServerTypes.NO_VENDOR
            }),
            ...layerSettings
        };
    }
};
