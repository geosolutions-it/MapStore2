/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Configuration metadata for UI display.
// The visibleWhen and disabledWhen conditions support context fields such as targetType,
// nodePath and config-specific values passed by the caller.
// Each field can use direct equality ("applyDimension") or operators:
// { isEqual: "map.time" } and { isNotEqual: "map.time" }.
export const CONFIGURATION_METADATA = {
    forcePlug: {
        label: "widgets.filterWidget.forcePlugLabel",
        visibleWhen: {
            nodePath: {
                isNotEqual: "map.time"
            }
        },
        infoMsgByTargetType: {
            applyStyle: "widgets.filterWidget.styleForcePlugInfo",
            "default": "widgets.filterWidget.filterForcePlugInfo"
        }
    },
    twoWaySynchronization: {
        label: "widgets.filterWidget.twoWaySynchronizationLabel",
        visibleWhen: {
            targetType: {
                isEqual: "applyDimension"
            },
            nodePath: {
                isEqual: "map.time"
            }
        },
        infoMsgByTargetType: {
            "default": "widgets.filterWidget.twoWaySynchronizationInfo"
        },
        disabledWhen: {
            hasOtherThanMapTimeConnected: {
                isEqual: true
            }
        }
    }
};

// Default configuration structure (simple boolean values)
export const DEFAULT_CONFIGURATION = {
    forcePlug: false,
    twoWaySynchronization: false
};
