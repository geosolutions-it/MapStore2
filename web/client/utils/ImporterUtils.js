/**
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const getbsStyleForState = function(state) {
    switch (state) {
    case "NO_FORMAT":
    case "NO_CRS":
    case "BAD_FORMAT":
    case "NO_BOUNDS":
    case "ERROR":
    case "CANCELED":
    case "INIT_ERROR":
        return "danger";
    case "READY":
    case "PENDING":
        return "info";
    case "INIT":
    case "RUNNING":
        return "warning";
    case "COMPLETE":
        return "success";
    default:
        return "default";

    }
};
