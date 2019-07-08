/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import Layers from '../../../../utils/openlayers/Layers';
import eventListener from 'eventlistener';
import Overlay from 'ol/Overlay';

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
    if (options.onLink) {
        let links = cloned.getElementsByTagName('a');
        for (let i = 0; i < links.length; i++) {
            eventListener.add(links[i], 'click', options.onLink);
        }
    }
    return cloned;
};

Layers.registerType('overlay', {
    create: (options, map) => {
        const original = document.getElementById(options.id);
        const cloned = cloneOriginalOverlay(original, options);
        document.body.appendChild(cloned);
        const overlay = new Overlay({
            id: options.id,
            element: cloned,
            autoPan: options.autoPan || false,
            positioning: options.positioning || 'top-left',
            offset: options.offset || [0, 0],
            autoPanAnimation: {
                duration: options.autoPanAnimation || 250
            },
            position: [options.position.x, options.position.y]
        });
        map.addOverlay(overlay);
        return {
            detached: true,
            remove: () => {
                map.removeOverlay(overlay);
            }
        };
    }
});
