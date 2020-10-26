/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
export const EXPORT_MAP = "EXPORT::EXPORT_MAP";

export const exportMap =  (format = "mapstore2") => ({ type: EXPORT_MAP, format});
