/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import API from '../api/catalog';
import { getResolutions } from './MapUtils';
import { buildSRSMap } from './CatalogUtils';
import { isAllowedSRS, isSRSAllowed } from './CoordinatesUtils';
import { isImageServerUrl } from './ArcGISUtils';
import { getConfigProp } from './ConfigUtils';
import uuid from 'uuid';
import { isEmpty } from 'lodash';
import url from 'url';


export const SOURCE_TYPES = {
    LOCAL: 'LOCAL',
    REMOTE: 'REMOTE'
};

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

/**
 * Check if the SRS is not allowed for the record
 */
export const isSRSNotAllowed = (record, crs) => {
    if (record.serviceType !== 'cog') {
        const ogcReferences = record.ogcReferences || { SRS: [] };
        const allowedSRS = ogcReferences?.SRS?.length > 0 && buildSRSMap(ogcReferences.SRS);
        return allowedSRS && !isAllowedSRS(crs, allowedSRS);
    }
    const recordCrs = record?.sourceMetadata?.crs;
    return recordCrs && !isSRSAllowed(recordCrs);
};

export const addLayerToMap = ({
    record,
    service,
    defaultFormat,
    layerBaseConfig,
    authkeyParamNames,
    catalogType,
    catalogURL="",
    crs,
    selectedService,
    onError,
    onLayerAdd,
    source,
    onAddBackground,
    onAddBackgroundProperties,
    zoomToLayer = true,
}) => {
    const serviceType = record.serviceType;
    
    if (isSRSNotAllowed(record, crs)) {
        onError('catalog.srs_not_allowed');
        return Promise.reject(new Error('SRS not allowed'));
    }

    return API[serviceType].getLayerFromRecord(record, {
        fetchCapabilities: !!record.fetchCapabilities,
        service: {
            service,
            format: service?.format ?? defaultFormat
        },
        layerBaseConfig,
        removeParams: authkeyParamNames,
        catalogURL: catalogType === 'csw' && catalogURL
            ? catalogURL +
            "?request=GetRecordById&service=CSW&version=2.0.2&elementSetName=full&id=" +
            record.identifier
            : null,
        map: {
            projection: crs,
            resolutions: getResolutions()
        }
    }, true)
        .then((layer) => {
            if (layer) {
                let layerOpts = layer;
                if (service?.protectedId && selectedService) {
                    layerOpts = {
                        ...layerOpts,
                        security: {
                            type: 'basic',
                            sourceId: service.protectedId
                        }
                    };
                }
                
                // Handle different sources
                if (source === 'backgroundSelector') {
                    if (record.background) {
                        onLayerAdd({ ...layerOpts, group: 'background' }, { source });
                        onAddBackground(layerOpts.id);
                    } else {
                        onAddBackgroundProperties({
                            editing: false,
                            layer: layerOpts
                        }, true);
                    }
                } else {
                    onLayerAdd(layerOpts, { zoomToLayer });
                }
            }
            return layer;
        });
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
        console.log('tilesetUrl', tilesetUrl);

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
