/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { error, success } from '../actions/notifications';


export const basicError = ({ title = "notification.warning", autoDismiss = 6, position = "tc", message = "Error" } = {}) =>
    error({ title, autoDismiss, position, message });
export const basicSuccess = ({ title = "notification.success", autoDismiss = 6, position = "tc", message = "Success" } = {}) =>
    success({ title, autoDismiss, position, message });
