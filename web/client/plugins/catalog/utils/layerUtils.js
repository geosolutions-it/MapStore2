/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import API from '../../../api/catalog';
import { getResolutions } from '../../../utils/MapUtils';
import { buildSRSMap } from '../../../utils/CatalogUtils';
import { isAllowedSRS, isSRSAllowed } from '../../../utils/CoordinatesUtils';

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
    catalogURL,
    crs,
    selectedService,
    onError,
    onLayerAdd,
    source,
    onAddBackground,
    onAddBackgroundProperties,
    zoomToLayer = true
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
