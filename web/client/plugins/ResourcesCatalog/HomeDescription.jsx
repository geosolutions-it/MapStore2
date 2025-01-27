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
import Text from './components/Text';
import { Jumbotron } from 'react-bootstrap';

function HomeDescription({

}) {
    return (
        <Jumbotron className="ms-secondary-colors _padding-lg">
            <Text textAlign="center">
                <HTML msgId="home.shortDescription"/>
            </Text>
        </Jumbotron>
    );
}

export default createPlugin('HomeDescription', {
    component: HomeDescription
});
