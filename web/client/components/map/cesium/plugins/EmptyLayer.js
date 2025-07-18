/**
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import {
    GeographicTilingScheme
} from 'cesium';

function EmptyImageryProvider({ color = '#ffffff' } = {}) {
    this._tilingScheme = new GeographicTilingScheme();
    // create a tile 1px x 1px of color white to simulate an empty background
    this._canvas = document.createElement('canvas');
    this._canvas.width = 1;
    this._canvas.height = 1;
    const ctx = this._canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
}

Object.defineProperties(EmptyImageryProvider.prototype, {
    proxy: {
        get: function() {
            return undefined;
        }
    },
    tileWidth: {
        get: function() {
            return undefined;
        }
    },
    tileHeight: {
        get: function() {
            return undefined;
        }
    },
    maximumLevel: {
        get: function() {
            return undefined;
        }
    },
    minimumLevel: {
        get: function() {
            return undefined;
        }
    },
    tilingScheme: {
        get: function() {
            return this._tilingScheme;
        }
    },
    rectangle: {
        get: function() {
            return this._tilingScheme.rectangle;
        }
    },
    tileDiscardPolicy: {
        get: function() {
            return undefined;
        }
    },
    errorEvent: {
        get: function() {
            return undefined;
        }
    },
    credit: {
        get: function() {
            return undefined;
        }
    },
    hasAlphaChannel: {
        get: function() {
            return true;
        }
    }
});

EmptyImageryProvider.prototype.getTileCredits = function() {
    return undefined;
};

EmptyImageryProvider.prototype.requestImage = function() {
    return Promise.resolve(this._canvas);
};

EmptyImageryProvider.prototype.pickFeatures = function() {
    return undefined;
};

Layers.registerType('empty', () => {
    return new EmptyImageryProvider({ color: '#ffffff' });
});
