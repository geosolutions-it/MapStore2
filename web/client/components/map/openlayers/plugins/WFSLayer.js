/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import {getStyle} from '../VectorStyle';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';

import { getFeature, describeFeatureType } from '../../../../api/WFS';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';
import { needsReload, extractGeometryType } from '../../../../utils/WFSLayerUtils';

const createLoader = (source, options) => (extent, resolution, projection) => {
    const params = optionsToVendorParams(options);
    var proj = projection.getCode();
    const onError = () => {
        source.removeLoadedExtent(extent);
    };
    getFeature(options.url, options.name, {
        // bbox: extent.join(',') + ',' + proj,
        outputFormat: "application/json",
        // maxFeatures: 3600, // This looks the internal openlayers limit. TODO: investigate more
        srsname: proj,
        ...params
    }).then(response => {
        if (response.status === 200) {
            source.addFeatures(
                source.getFormat().readFeatures(response.data));
        } else {
            onError();
        }
    }).catch(e => {
        onError(e);
    });
};
/**
 * Generate the OL style from options and geometryType. It workarounds some issues
 * @param {object} options MapStore's layer options
 * @param {string} geometryType the geometry type
 */
const getWFSStyle = (options, geometryType) => {
    return getStyle({ ...options, style: { ...(options.style || {}), type: geometryType } });
};

/**
 * Fetch describeFeatureType if missing and set the style accordingly with the geometry type.
 * @param {object} layer the openlayers layer
 * @param {object} options MapStore layer configuration
 */
const updateStyle = (layer, options) => layer.geometryType
    ? layer.setStyle(getWFSStyle(options, layer.geometryType))
    : describeFeatureType(options.url, options.name)
        .then(extractGeometryType)
        .then(geometryType => {
            layer.geometryType = geometryType;
            layer.setStyle(getWFSStyle(options, geometryType));
        });

/**
 * WFS Layer for MapStore. Openlayers implementation.
 * Note: WFS Source stores features in the layer internally, to distinguish from vector source.
 * These features are not stored in the final layer object.
 *
 */
Layers.registerType('wfs', {
    create: (options) => {

        const source = new VectorSource({
            format: new GeoJSON()
        });
        source.setLoader(createLoader(source, options));
        const style = getStyle(options);

        const layer = new VectorLayer({
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            style,
            opacity: options.opacity
        });
        updateStyle(layer, options);
        return layer;
    },
    update: (layer, options = {}, oldOptions = {}) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = options.crs || options.srs || 'EPSG:3857';
        const source = layer.getSource();
        if (newCrs !== oldCrs) {
            source.forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }
        if (needsReload(oldOptions, options)) {
            source.setLoader(createLoader(source, options));
            source.clear();
            source.refresh();
        }
        if (options.style !== oldOptions.style || options.styleName !== oldOptions.styleName) {
            updateStyle(layer, options);
        }
    },
    render: () => {
        return null;
    }
});
