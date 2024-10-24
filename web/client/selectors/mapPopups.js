/*
* Copyright 2024, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/


/**
 * selects mapPopups state
 * @name mapPopups
 * @memberof selectors
 * @static
 */

export const mapPopupsSelector = (state) => state?.mapPopups && state?.mapPopups?.popups || [];
export const hideEmptyPopupSelector = (state) => state?.mapPopups && state?.mapPopups?.hideEmptyPopupOption || false;
