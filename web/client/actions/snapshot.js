/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const axios = require('axios');
const CHANGE_SNAPSHOT_STATE = 'CHANGE_SNAPSHOT_STATE';
const SNAPSHOT_ERROR = 'SNAPSHOT_ERROR';
const SNAPSHOT_READY = 'SNAPSHOT_READY';


function changeSnapshotState(state) {
    return {
        type: CHANGE_SNAPSHOT_STATE,
        state: state
    };
}
function onSnapshotError(error) {
    return {
        type: SNAPSHOT_ERROR,
        error: error
    };
}
function onSnapshotReady(snapshot, width, height, size) {
    return {
        type: SNAPSHOT_READY,
        imgData: snapshot,
        width: width,
        height: height,
        size: size
    };
}
/**
 * Post canvas image to servicebox
 *
 * @param canvasData {string} image to post string
 */
function postCanvas(canvasData, serviceUrl) {
    return (dispatch) => {
        // dispatch(newMapInfoRequest(reqId, param));
        axios.post(serviceUrl, {params: canvasData}, {headers: {'Content-Type': 'application/upload'}}).then((response) => {
            if (response.data.exceptions) {
                dispatch(onSnapshotError(response.data.exceptions));
            } else {
                window.location.assign(serviceUrl + "?ID=" + response.data);
            }
        }).catch((e) => {
            dispatch(onSnapshotError(e.status + " " + e.statusText));
        });
    };
}

module.exports = {
    CHANGE_SNAPSHOT_STATE,
    SNAPSHOT_ERROR,
    SNAPSHOT_READY,
    changeSnapshotState,
    onSnapshotError,
    onSnapshotReady,
    postCanvas
};
