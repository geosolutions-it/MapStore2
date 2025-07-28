/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { createPlugin } from '../utils/PluginsUtils';

import * as autoResourceUpdateEpic from '../epics/autoResourceUpdate';
import { startUpdatingResource } from '../actions/autoResourceUpdate';

/**
  * AutoResourceUpdate Plugin.
  * It sends a notification to update resources only if showNotificationForRoles is defined and user match the role defined
  * The notification will disappear after 10 seconds (See https://github.com/igorprado/react-notification-system for details)
  * The updated resource is not automatically saved
  * a generic configuration has been places in the root of locaConfig called "AutoResourceUpdateOptions". These are not plugin cfg
  *
  * NOTE: just remove AutoResourceUpdateOptions from localConfig to not trigger updates
  *
  * @param {string[]} AutoResourceUpdateOptions.showNotificationForRoles the list of roles for which this notification must be visible, can be ["ALL","ADMIN","USER"], default is []
  * @param {number} AutoResourceUpdateOptions.autoDismiss seconds of duration of the notification popup
  * @param {object} AutoResourceUpdateOptions.urlsToReplace list of key value pairs as object to replace the url
  * @memberof plugins
  */
const AutoResourceUpdate = ({
    onStartUpdatingResource = () => {}
}) => {
    useEffect(() => {
        onStartUpdatingResource();
    }, []);
    return null;
};

const AutoResourceUpdateConnected = connect(() => ({}), {
    onStartUpdatingResource: startUpdatingResource
})(AutoResourceUpdate);

export default createPlugin(
    "AutoResourceUpdate", {
        component: AutoResourceUpdateConnected,
        epics: autoResourceUpdateEpic
    });

AutoResourceUpdate.propTypes = {
    showNotificationForRoles: PropTypes.array,
    onStartUpdatingResource: PropTypes.func
};
