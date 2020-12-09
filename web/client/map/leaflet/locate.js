/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import LLocate from '../../utils/leaflet/LLocate';

class Locate {
    start({ map, options, status, onStateChange, onLocationError }) {
        if (map ) {
            this.locate = new LLocate(options);
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
    update({ status, messages }) {
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
