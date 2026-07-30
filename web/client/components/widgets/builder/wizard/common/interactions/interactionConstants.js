/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { TARGET_TYPES } from "../../../../../../utils/InteractionUtils";

export const CONFIGURATION_RENDER_MODES = {
    INLINE_BUTTON: "inline-button",
    PANEL_CHECKBOX: "panel-checkbox"
};

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
    },
    autoZoom: {
        label: "widgets.filterWidget.autoZoomLabel",
        renderAs: CONFIGURATION_RENDER_MODES.INLINE_BUTTON,
        visibleWhen: {
            targetType: {
                isEqual: TARGET_TYPES.APPLY_ZOOM_TO
            },
            plugged: { isEqual: true }
        },
        infoMsgByTargetType: {
            "default": "widgets.filterWidget.autoZoomInfo"
        }
    }
};

// Default configuration structure (simple boolean values)
export const DEFAULT_CONFIGURATION = {
    forcePlug: false,
    twoWaySynchronization: false,
    autoZoom: false
};
