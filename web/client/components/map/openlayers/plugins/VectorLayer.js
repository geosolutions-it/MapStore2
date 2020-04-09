/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';

import {getStyle} from '../VectorStyle';
import isEqual from 'lodash/isEqual';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { bbox as bboxStrategy } from 'ol/loadingstrategy';

import { getFeature } from '../../../../api/WFS';
import { optionsToVendorParams } from '../../../../utils/VendorParamsUtils';

Layers.registerType('vector', {
    create: (options) => {
        let features = [];

        const source = new VectorSource({
            features: features
        });

        const style = getStyle(options);

        return new VectorLayer({
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            style,
            opacity: options.opacity
        });
    },
    update: (layer, newOptions, oldOptions) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = newOptions.crs || newOptions.srs || 'EPSG:3857';
        if (newCrs !== oldCrs) {
            layer.getSource().forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }

        if (!isEqual(oldOptions.style, newOptions.style)) {
            layer.setStyle(getStyle(newOptions));
        }
    },
    render: () => {
        return null;
    }
});

const createLoader = (source, options) => (extent, resolution, projection) => {
    const params = optionsToVendorParams(options);
    var proj = projection.getCode();
    const onError = () => {
        source.removeLoadedExtent(extent);
    };
    getFeature(options.url, options.name, {
        // bbox: extent.join(',') + ',' + proj,
        outputFormat: "application/json",
        srsname: proj,
        ...params
    })
        .then(response => {
            if (response.status === 200) {
                source.addFeatures(
                    source.getFormat().readFeatures(response.data));
            } else {
                onError();
            }
        })
        .catch(e => {
            onError(e);
        });

};

const needsReload = (oldOptions, newOptions) => {
    const oldParams = { ...(optionsToVendorParams(oldOptions) || {}), _v_: oldOptions._v_ };
    const newParams = { ...(optionsToVendorParams(newOptions) || {}), _v_: newOptions._v_ };
    return [ "_v_", "CQL_FILTER", "VIEWPARAMS"].reduce((found, param) => {
        if (oldParams[param] !== newParams[param]) {
            return true;
        }
        return found;
    }, false);
};
/**
 * WFS Source stores features in the layer internally, to distinguish from vector source.
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

        return new VectorLayer({
            msId: options.id,
            source: source,
            visible: options.visibility !== false,
            zIndex: options.zIndex,
            style,
            opacity: options.opacity
        });
    },
    update: (layer, newOptions, oldOptions) => {
        const oldCrs = oldOptions.crs || oldOptions.srs || 'EPSG:3857';
        const newCrs = newOptions.crs || newOptions.srs || 'EPSG:3857';
        const source = layer.getSource();
        if (newCrs !== oldCrs) {
            source.forEachFeature((f) => {
                f.getGeometry().transform(oldCrs, newCrs);
            });
        }
        if (needsReload(oldOptions, newOptions)) {
            source.setLoader(createLoader(source, newOptions));
            source.clear();
            source.refresh();
        }
    },
    render: () => {
        return null;
    }
});
