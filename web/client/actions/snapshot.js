/**
 * Copyright 2015, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
// const axios = require('axios');
import {downloadCanvasDataURL} from '../utils/FileUtils';

export const CHANGE_SNAPSHOT_STATE = 'CHANGE_SNAPSHOT_STATE';
export const SNAPSHOT_ERROR = 'SNAPSHOT_ERROR';
export const SNAPSHOT_READY = 'SNAPSHOT_READY';
export const SNAPSHOT_ADD_QUEUE = 'SNAPSHOT_ADD_QUEUE';
export const SNAPSHOT_REMOVE_QUEUE = 'SNAPSHOT_REMOVE_QUEUE';
export const SAVE_IMAGE = 'SAVE_IMAGE';

export function changeSnapshotState(state, tainted) {
    return {
        type: CHANGE_SNAPSHOT_STATE,
        state: state,
        tainted
    };
}
export function onSnapshotError(error) {
    return {
        type: SNAPSHOT_ERROR,
        error: error
    };
}
export function onSnapshotReady(snapshot, width, height, size) {
    return {
        type: SNAPSHOT_READY,
        imgData: snapshot,
        width: width,
        height: height,
        size: size
    };
}

export function onCreateSnapshot(options) {
    return {
        type: SNAPSHOT_ADD_QUEUE,
        options: options
    };
}

export function onRemoveSnapshot(options) {
    return {
        type: SNAPSHOT_REMOVE_QUEUE,
        options: options
    };
}
/**
 * Post canvas image to servicebox (IF FILE WRITER DON' WORK')
 *
 * @param canvasData {string} image to post string

export function postCanvas(canvasData, serviceUrl) {

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
 */
export function saveImage(dataURL) {
    downloadCanvasDataURL(dataURL, "snapshot.png", "image/png");
    return {
        type: SAVE_IMAGE,
        dataURL: dataURL
    };
}
