/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import LLocate from '../../utils/leaflet/LLocate';

const defaultOpt = { // For all configuration options refer to https://github.com/Norkart/Leaflet-MiniMap
    follow: true,  // follow with zoom and pan the user's location
    remainActive: true,
    stopFollowingOnDrag: true,
    locateOptions: {
        maximumAge: 2000,
        enableHighAccuracy: false,
        timeout: 10000,
        maxZoom: 18,
        watch: true  // if you overwrite this, visualization cannot be updated
    }
};

function mergeOptions(options) {
    return {
        ...defaultOpt,
        ...options,
        locateOptions: {
            ...defaultOpt.locateOptions,
            ...options.locateOptions
        }
    };
}
class Locate {
    start({ map, options, status, onStateChange, onLocationError }) {
        if (map ) {
            this.locate = new LLocate(mergeOptions(options));
            this.locate.setMap(map);
            map.on('locatestatus', (state) => this.locateControlState(state, { onStateChange }));
            this.locate.options.onLocationError = onLocationError;
            this.locate.options.onLocationOutsideMapBounds = onLocationError;
        }
        if (status.enabled) {
            this.locate.start();
        }
        this.status = status;
    }
    update({ status, messages, options }) {
        this.fol = false;

        if ( status === "ENABLED" && !this.locate._active) {
            this.locate.start();
        } else if (status === "FOLLOWING" && this.locate._active && !this.locate._following) {
            this.fol = true;
            this.locate.stop();
            this.locate.start();
        } else if ( status === "DISABLED") {
            this.locate._following = false;
            this.locate.stop();
        }

        this.locate.setStrings(messages);
        if (status !== "DISABLED" && this.locate.drawMarker) {
            this.locate.drawMarker(this.locate._map);
        }

        this.locate.setLocateOptions(mergeOptions(options).locateOptions);

        this.status = status;
    }
    clear() {}

    locateControlState(state, { onStateChange }) {
        if (state.state === 'requesting' && this.status !== "LOCATING" ) {
            onStateChange("LOCATING");
        } else if (state.state === 'following' && !this.fol ) {
            onStateChange("FOLLOWING");
        } else if (state.state === 'active' && this.status !== "ENABLED" ) {
            onStateChange("ENABLED");
        }
    }
}


export default Locate;
