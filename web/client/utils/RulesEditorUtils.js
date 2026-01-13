/**
  * Copyright 2018, GeoSolutions Sas.
  * All rights reserved.
  *
  * This source code is licensed under the BSD-style license found in the
  * LICENSE file in the root directory of this source tree.
  */
import { isEqual, isEmpty } from 'lodash';
import Api from '../api/geoserver/GeoFence';

export const checkIp = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.)){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-2]?[0-9]|3[0-2]))$/;
export const checkIpV4Range = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.)){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

export const isRulePristine = (currentRule, initRule) => {
    return isEqual(currentRule, initRule);
};

export const isSaveDisabled = (currentRule, initRule) => {
    const isStandAloneGeofence = Api.getRuleServiceType() === 'geofence';
    if (isStandAloneGeofence) {
        // for stand-alone geofence -> save btn is disable in case gs instance not selected
        return (isRulePristine(currentRule, initRule) && initRule && initRule.hasOwnProperty("id")) || !currentRule.instance;
    }
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
    return !isEmpty(constraints) && (key === "workspace" || key === "layer" || (key === "grant" && value !== "ALLOW") || key === "instance");
};

// gs instances
export const isGSInstanceValid = (
//    instance
) => {
    // based on geofence api --> there is no restriction for adding gs instance
    // if any restrictions needed --> we can handle this here
    return true;
};
export const isGSInstancePristine = (currentGSInstance, initGSInstance) => {
    return isEqual(currentGSInstance, initGSInstance);
};
export const isSaveGSInstanceDisabled = (currentGSInstance, initGSInstance) => {
    return isGSInstancePristine(currentGSInstance, initGSInstance) && initGSInstance && initGSInstance.hasOwnProperty("id");
};
