/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import ConfigUtils from "../utils/ConfigUtils";
import { push } from 'connected-react-router';

export const GO_TO_PAGE = 'GO_TO_PAGE';


export function goToPage(page, router) {
    if (router) {
        router.history.push(page);
    }
    return {
        type: GO_TO_PAGE,
        page
    };
}

export function goToHomePage() {
    const homePath = ConfigUtils.getMiscSetting('homePath', '/');
    return push(homePath);
}
