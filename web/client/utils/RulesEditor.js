/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
const {isEqual, isEmpty} = require("lodash");
const checkIp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.)){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?(\/)(?:3[0-2]|[1-2]?[0-9]))\b/g;
const RulesEditorUtils = {
    isSaveDisabled: (currentRule, initRule) => {
        return RulesEditorUtils.isRulePristine(currentRule, initRule) && initRule && initRule.hasOwnProperty("id");
    },
    areDetailsActive: (layer, {grant} = {}) => {
        return !!layer && grant !== "DENY";
    },
    isRulePristine: (currentRule, initRule) => {
        return isEqual(currentRule, initRule);
    },
    isRuleValid: ({ipaddress = ""} = {}) => {
        if (ipaddress !== null && ipaddress.length > 0 ) {
            return !!ipaddress.match(checkIp);
        }
        return true;
    },
    askConfirm: ({constraints = {}} = {}, key, value) => {
        return !isEmpty(constraints) && (key === "workspace" || key === "layer" || (key === "grant" && value !== "ALLOW"));
    },
    checkIp
};

module.exports = RulesEditorUtils;
