/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const EXPORT_MAP = "EXPORT::EXPORT_MAP";

module.exports = {
    EXPORT_MAP,
    exportMap: (format = "mapstore2") => ({ type: EXPORT_MAP, format})
};
