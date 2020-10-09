/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { get } from 'lodash';

import Layers from '../../../../utils/openlayers/Layers';
import XYZ from 'ol/source/XYZ';
import TileGrid from 'ol/tilegrid/TileGrid';

import TileLayer from 'ol/layer/Tile';

function tileXYZToOpenlayersOptions(options = {}) {
    const { minx, miny, maxx, maxy } = get(options, "bbox.bounds", {});
    const sourceOpt = {
        projection: options.srs,
        url: `${options.tileMapUrl}/{z}/{x}/{-y}.${options.extension}`, // TODO use resolutions
        attributions: options.attribution ? [options.attribution] : []
    };
    let source = new XYZ(sourceOpt);
    const defaultTileGrid = source.getTileGrid();

    if (options.forceDefaultTileGrid) {
        const defaultExtent = defaultTileGrid.getExtent();
        const newOrigin = [defaultExtent[0], defaultExtent[1]]; // minx, miny instead of top left corner, origin is bottom left.
        const newTileGrid = new TileGrid({
            // origin must be overridden because GeoServer uses the tile-set origin and OL uses by default extent corner.
            origin: newOrigin,
            extent: options.bbox && [minx, miny, maxx, maxy],
            resolutions: defaultTileGrid.getResolutions(),
            tileSize: options.tileSize
        });
        source.setTileGridForProjection(options.srs, newTileGrid);
        if (options.srs === "EPSG:3857") {
            source.setTileGridForProjection("EPSG:900913", newTileGrid);
        }
    } else if (options.tileSets) {
        source.setTileGridForProjection(options.srs, new TileGrid({
            origin: options.origin,
            extent: options.bbox && [minx, miny, maxx, maxy],
            resolutions: options.tileSets.map(({ resolution }) => resolution),
            tileSize: options.tileSize
        }));
    }
    let olOpt = {
        msId: options.id,
        extent: options.bbox && [minx, miny, maxx, maxy],
        opacity: options.opacity !== undefined ? options.opacity : 1,
        visible: options.visibility !== false,
        zIndex: options.zIndex,
        source: source
    };
    return olOpt;
}

Layers.registerType('tms', {
    create: (options) => {
        return new TileLayer(tileXYZToOpenlayersOptions(options));
    }
});

