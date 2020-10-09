/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { compose, withProps } from 'recompose';
import Text from '../../contents/Text';

import withControllableState from '../../../misc/enhancers/withControllableState';

const withDefaultTabs = withProps((props) => ({
    tabs: props.tabs || [{
        id: 'popup-editor',
        titleId: 'popup-editor',
        tooltipId: 'popup-editor',
        title: 'Popup',
        visible: true,
        Component: () => {
            return (<div className="ms-locations-popup-editor"><Text {...props} allowBlur={false} keepOpen mode="edit" /></div>);
        }
    }]
}));

export const withLocationPopupTabs = compose(
    withControllableState('activeTab', 'setActiveTab', 'popup-editor'),
    withDefaultTabs
);

export default withLocationPopupTabs;

