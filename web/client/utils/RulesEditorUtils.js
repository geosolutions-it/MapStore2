/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import { isEqual, isEmpty } from 'lodash';

export const checkIp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.)){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?(\/)(?:3[0-2]|[1-2]?[0-9]))\b/g;

export const isRulePristine = (currentRule, initRule) => {
    return isEqual(currentRule, initRule);
};

export const isSaveDisabled = (currentRule, initRule) => {
    return isRulePristine(currentRule, initRule) && initRule && initRule.hasOwnProperty("id");
};
export const areDetailsActive = (layer, {grant} = {}) => {
    return !!layer && grant !== "DENY";
};
export const isRuleValid = ({ipaddress = ""} = {}) => {
    if (ipaddress !== null && ipaddress.length > 0 ) {
        return !!ipaddress.match(checkIp);
    }
    return true;
};
export const askConfirm = ({constraints = {}} = {}, key, value) => {
    return !isEmpty(constraints) && (key === "workspace" || key === "layer" || (key === "grant" && value !== "ALLOW"));
};
