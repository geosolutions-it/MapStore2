/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { createPlugin } from "../../utils/PluginsUtils";
import HTML from '../../components/I18N/HTML';
import Text from '../../components/layout/Text';

function Footer({

}) {

    return (
        <div className="ms-footer _padding-tb-lg _padding-lr-md">
            <Text textAlign="center">
                <HTML msgId="home.footerDescription"/>
            </Text>
        </div>
    );
}


export default createPlugin('Footer', {
    component: Footer
});
