/**
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Observable } from 'rxjs';
import isObject from 'lodash/isObject';
import { getCurrentResolution } from '../MapUtils';
import isNil from 'lodash/isNil';

export default {
    buildRequest: (layer, props) => {
        const { features = [] } = props?.point?.intersectedFeatures?.find(({ id }) => id === layer.id) || {};
        return {
            request: {
                features: [...features],
                outputFormat: 'application/json',
                lat: props.point.latlng.lat,
                lng: props.point.latlng.lng
            },
            metadata: {
                fields: layer.features?.[0]?.properties && Object.keys(layer.features[0].properties) || [],
                title: isObject(layer.title)
                    ? layer.title[props?.currentLocale] || layer.title.default
                    : layer.title,
                resolution: isNil(props?.map?.resolution)
                    ? props?.map?.zoom && getCurrentResolution(props.map.zoom, 0, 21, 96)
                    : props.map.resolution,
                buffer: props.buffer || 2,
                units: props.map && props.map.units,
                rowViewer: layer.rowViewer,
                viewer: layer.viewer,
                layerId: layer.id
            },
            // this will force to use the getIdentifyFlow
            // instead of the getVectorInfo action
            // when a layer is not an annotation
            url: layer.id === 'annotations' ? undefined : 'client'
        };
    },
    getIdentifyFlow: (layer, baseURL, { features = [] } = {}) => {
        return Observable.of({
            data: {
                features
            }
        });
    }
};
