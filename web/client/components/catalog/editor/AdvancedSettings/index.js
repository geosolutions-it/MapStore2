/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { isNil } from 'lodash';

import CommonAdvancedSettings from './CommonAdvancedSettings';
import SwitchPanel from "../../../misc/switch/SwitchPanel";
import TMSAdvancedEditor from './TMSAdvancedEditor';
import Message from '../../../I18N/Message';
import RasterAdvancedSettings from './RasterAdvancedSettings';


const getPanel = (type) => {
    switch (type) {
    case "tms":
        return TMSAdvancedEditor;
    case "wmts":
    case "wfs":
        return CommonAdvancedSettings;
    case "wms":
    case "csw":
        return RasterAdvancedSettings;
    default:
        return CommonAdvancedSettings;
    }
};

/**
 * Container for CatalogEditor Advanced Settings
 */
export default ({
    onToggleAdvancedSettings = () => { },
    ...props
}) => {
    const  {service = {}} = props;
    const type = service.type;
    const Panel = getPanel(type);
    return (<SwitchPanel
        useToolbar
        title={<Message msgId="catalog.advancedSettings" />}
        expanded={!isNil(service.showAdvancedSettings) ? service.showAdvancedSettings : false}
        onSwitch={onToggleAdvancedSettings}>
        <Panel {...props} />
    </SwitchPanel>);
};
