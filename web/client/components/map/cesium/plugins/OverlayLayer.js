/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/cesium/Layers';
import * as Cesium from 'cesium';

import eventListener from 'eventlistener';
import isEqual from 'lodash/isEqual';
/**
 * Created by thomas on 27/01/14.
 */

const InfoWindow = (function() {
    function _(cesiumWidget) {
        this._destroyed = false;
        this._scene = cesiumWidget.scene;

        let div = document.createElement('div');
        div.className = 'infoWindow';
        this._div = div;
        let frame = document.createElement('div');
        frame.className = 'frame';
        this._div.appendChild(frame);
        let content = document.createElement('div');
        content.className = 'content';
        frame.appendChild(content);
        cesiumWidget.container.appendChild(div);
        this._content = content;
        this.setVisible(true);

        // set the position to absolute to correctly positioning the info window
        // based on left and top properties
        this._div.style.position = 'absolute';
    }

    // This is now required to make the InfoWindow compatible with Cesium Primitive interface
    // https://github.com/CesiumGS/cesium/blob/1.131/packages/engine/Source/Scene/Primitive.js#L2436
    _.prototype.isDestroyed = function() {
        return this._destroyed;
    };
    _.prototype.setVisible = function(visible) {
        this._visible = visible;
        this._div.style.display = visible ? 'block' : 'none';
    };

    _.prototype.setContent = function(content) {
        if (typeof content === 'string') {
            this._content.innerHTML = content;
        } else {
            while (this._content.firstChild) {
                this._content.removeChild(this._content.firstChild);
            }
            this._content.appendChild(content);
        }
    };

    _.prototype.setPosition = function(lat, lng) {
        this._position = this._scene.globe.ellipsoid.cartographicToCartesian(Cesium.Cartographic.fromDegrees(lng, lat, 0));
    };

    _.prototype.showAt = function(lat, lng, content) {
        this.setPosition(lat, lng);
        this.setContent(content);
        this.setVisible(true);
    };

    _.prototype.hide = function() {
        this.setVisible(false);
    };

    _.prototype.computeVisible = function() {
        // Ellipsoid radii - WGS84 shown here
        const rX = 6378137.0;
        const rY = 6378137.0;
        const rZ = 6356752.3142451793;
        // Vector CV
        const cameraPosition = this._scene.camera.position;
        const cvX = cameraPosition.x / rX;
        const cvY = cameraPosition.y / rY;
        const cvZ = cameraPosition.z / rZ;

        const vhMagnitudeSquared = cvX * cvX + cvY * cvY + cvZ * cvZ - 1.0;

        // Target position, transformed to scaled space

        const position = this._position;
        const tX = position.x / rX;
        const tY = position.y / rY;
        const tZ = position.z / rZ;

        // Vector VT
        const vtX = tX - cvX;
        const vtY = tY - cvY;
        const vtZ = tZ - cvZ;
        const vtMagnitudeSquared = vtX * vtX + vtY * vtY + vtZ * vtZ;

        // VT dot VC is the inverse of VT dot CV
        const vtDotVc = -(vtX * cvX + vtY * cvY + vtZ * cvZ);

        const isOccluded = vtDotVc > vhMagnitudeSquared &&
            vtDotVc * vtDotVc / vtMagnitudeSquared > vhMagnitudeSquared;

        if (isOccluded) {
            this.setVisible(false);
        } else {
            this.setVisible(true);
        }

    };

    _.prototype.update = function() {
        this.computeVisible();

        if (!this._visible || !this._position) {
            return;
        }
        // get the position on the globe as screen coordinates
        // coordinates with origin at the top left corner
        let coordinates = Cesium.SceneTransforms.wgs84ToWindowCoordinates(this._scene, this._position);
        if (coordinates) {
            let left = Math.floor(coordinates.x) - this._div.clientWidth / 2 + "px";
            let top = Math.floor(coordinates.y) - this._div.clientHeight + "px";
            this._div.tabIndex = 5;
            this._div.style.left = left;
            this._div.style.top = top;
        }
    };

    _.prototype.destroy = function() {
        this._div.parentNode.removeChild(this._div);
        this._destroyed = true;
    };

    return _;

})();

const removeIds = (items) => {
    if (items.length !== 0) {
        for (let i = 0; i < items.length; i++) {
            let item = items.item(i);
            item.removeAttribute('data-reactid');
            removeIds(item.children || []);
        }
    }
};

const cloneOriginalOverlay = (original, options) => {
    let cloned = original.cloneNode(true);
    cloned.id = options.id + '-overlay';
    cloned.className = (options.className || original.className) + "-overlay";
    cloned.removeAttribute('data-reactid');
    // remove reactjs generated ids from cloned object
    removeIds(cloned.children || []);
    // handle optional close button on overlay
    const closeClassName = options.closeClass || 'close';
    if (options.onClose && cloned.getElementsByClassName(closeClassName).length === 1) {
        const close = cloned.getElementsByClassName(closeClassName)[0];
        const onClose = (e) => {
            options.onClose(e.target.getAttribute('data-overlayid'));
        };
        eventListener.add(close, 'click', onClose);
    }
    return cloned;
};

Layers.registerType('overlay', {
    create: (options, map) => {

        if (!options.visibility) {
            return {
                detached: true,
                info: undefined,
                remove: () => {}
            };
        }
        const original = document.getElementById(options.id);
        // use a div fallback to avoid error if the original element does not exist
        const cloned = original ? cloneOriginalOverlay(original, options) : document.createElement('div');

        let infoWindow = new InfoWindow(map);
        infoWindow.showAt(options?.position?.y || 0, options?.position?.x || 0, cloned);
        infoWindow.setVisible(true);

        let info = map.scene.primitives.add(infoWindow);

        return {
            detached: true,
            info: info,
            remove: () => {
                map.scene.primitives.remove(info);
            }
        };
    },
    update: function(layer, newOptions, oldOptions, map) {
        if (!isEqual(newOptions.position, oldOptions.position)) {
            return this.create(newOptions, map);
        }
        return null;
    }
});
