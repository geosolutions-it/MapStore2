/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import tinycolor from 'tinycolor2';
import uuidv1 from 'uuid/v1';
import defaultIcon from '../components/map/openlayers/img/marker-icon.png';
import isEmpty from 'lodash/isEmpty';
import { flattenFeatures } from './VectorStyleUtils';

const getFeatureCollectionSingleGeometryType = ({ features } = {}) => {
    const { geometry: validGeometry } = (features || []).find(({ geometry }) => geometry?.type) || {};
    if (!validGeometry) {
        return null;
    }
    const singleGeometryType = validGeometry.type.replace('Multi', '');
    if (singleGeometryType === 'GeometryCollection') {
        return 'GeometryCollection';
    }
    const isGeometryCollection = (features || []).find(({ geometry }) => geometry?.type?.replace('Multi', '') !== singleGeometryType);
    return isGeometryCollection ? 'GeometryCollection' : singleGeometryType;
};

const createDefaultStyle = ({
    marker,
    fillColor = '#f2f2f2',
    fillOpacity = 0.3,
    strokeColor = '#3075e9',
    strokeOpacity = 1,
    strokeWidth = 2,
    radius = 10,
    geometryType = 'GeometryCollection'
}) => {
    return {
        format: 'geostyler',
        metadata: { editorType: 'visual' },
        body: {
            rules: [
                ...(marker ? [{
                    name: 'Default Marker Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Icon',
                            image: defaultIcon,
                            opacity: 1,
                            size: 32,
                            rotate: 0,
                            msBringToFront: true,
                            msHeightReference: 'none',
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : []),
                ...(['GeometryCollection', 'Point', 'MultiPoint'].includes(geometryType) && !marker ? [{
                    name: 'Default Point Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Mark',
                            color: fillColor,
                            fillOpacity,
                            opacity: 1,
                            strokeColor,
                            strokeOpacity,
                            strokeWidth,
                            wellKnownName: 'Circle',
                            radius,
                            msBringToFront: true,
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : []),
                ...(['GeometryCollection', 'LineString', 'MultiLineString'].includes(geometryType) && !marker ? [{
                    name: 'Default Line Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Line',
                            color: strokeColor,
                            opacity: strokeOpacity,
                            width: strokeWidth,
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : []),
                ...(['GeometryCollection', 'Polygon', 'MultiPolygon'].includes(geometryType) && !marker ? [{
                    name: 'Default Polygon Style',
                    ruleId: uuidv1(),
                    symbolizers: [
                        {
                            kind: 'Fill',
                            color: fillColor,
                            fillOpacity: fillOpacity,
                            outlineColor: strokeColor,
                            outlineOpacity: strokeOpacity,
                            outlineWidth: strokeWidth,
                            symbolizerId: uuidv1()
                        }
                    ]
                }] : [])
            ]
        }
    };
};

export const applyDefaultStyleToVectorLayer = (layer, customStyle) => {

    const features = flattenFeatures(layer?.features || []);
    const hasFeatureStyle = features.find(feature => !isEmpty(feature?.style || {}) && feature?.properties?.id);
    if (hasFeatureStyle
    || layer?.style?.format && !isEmpty(layer?.style?.body)
    || !layer?.style?.format && !isEmpty(layer.style)) {
        return layer;
    }

    const geometryType = getFeatureCollectionSingleGeometryType({ features });
    const markerStyle = !!(customStyle?.marker && ['Point', 'MultiPoint'].includes(geometryType));
    const fillColor = customStyle && tinycolor(customStyle.fill).toHexString();
    const fillOpacity = customStyle?.fill?.a;
    const strokeColor = customStyle && tinycolor(customStyle?.color).toHexString();
    const strokeOpacity = customStyle?.color?.a;
    const strokeWidth = customStyle?.width;
    const radius = customStyle?.radius;

    return {
        ...layer,
        ...(markerStyle && { handleClickOnLayer: true }),
        style: createDefaultStyle(customStyle
            ? {
                marker: markerStyle,
                fillColor,
                fillOpacity,
                strokeColor,
                strokeOpacity,
                strokeWidth,
                radius,
                geometryType
            }
            : { geometryType }
        )
    };
};
