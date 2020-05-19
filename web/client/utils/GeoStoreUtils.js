/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { isArray } from 'lodash';

export const fixPermissions = (permissions) => {
    let fixedSecurityRule = [];

    // Fix to overcome GeoStore bad encoding of single object arrays
    if (permissions && permissions.SecurityRuleList && permissions.SecurityRuleList.SecurityRule) {
        if (isArray(permissions.SecurityRuleList.SecurityRule)) {
            fixedSecurityRule = permissions.SecurityRuleList.SecurityRule;
        } else {
            fixedSecurityRule = [permissions.SecurityRuleList.SecurityRule];
        }
    }

    return {
        SecurityRuleList: {
            SecurityRule: fixedSecurityRule
        }
    };
};
