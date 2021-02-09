/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import OlLocate from '../../utils/openlayers/OlLocate';

const defaultOpt = {
    follow: true, // follow with zoom and pan the user's location
    remainActive: true,
    metric: true,
    stopFollowingOnDrag: true,
    keepCurrentZoomLevel: false,
    locateOptions: {
        maximumAge: 2000,
        enableHighAccuracy: false,
        timeout: 10000,
        maxZoom: 18
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
    start({map, options, messages, status, onStateChange, onLocationError}) {
        this.locate = new OlLocate(map, mergeOptions(options));
        this.locate.setStrings(messages);
        this.locate.options.onLocationError = onLocationError;
        this.locate.on("propertychange", (e) => {onStateChange(e.target.get(e.key)); });
        this.configureLocate(status);
    }
    update({ status, messages, options }) {
        this.configureLocate(status);
        this.locate.setStrings(messages);
        this.locate.setTrackingOptions(mergeOptions(options).locateOptions);
    }
    clear() {}

    configureLocate(newStatus) {
        let state = this.locate.get("state");
        if ( newStatus === "ENABLED" && state === "DISABLED") {
            this.locate.start();
        } else if (newStatus === "FOLLOWING" && state === "ENABLED") {
            this.locate.startFollow();
        } else if (newStatus === "DISABLED") {
            this.locate.stop();
        }
    }
}

export default Locate;
