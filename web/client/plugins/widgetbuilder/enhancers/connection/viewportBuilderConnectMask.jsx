/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { isWidgetSelectionActive } from '../../../../selectors/widgets';

import withMask from '../../../../components/misc/enhancers/withMask';
import { connect } from 'react-redux';
import { createSelector } from 'reselect';
import { compose } from 'recompose';
import React from 'react';
import Message from '../../../../components/I18N/Message';

export default compose(
    connect(createSelector(isWidgetSelectionActive, (widgetSelectionActive) => ({ widgetSelectionActive }))),
    withMask(
        ({ widgetSelectionActive }) => widgetSelectionActive,
        () => <div style={{margin: "auto"}} ><Message msgId="widgets.builder.wizard.selectMapToConnect" /></div>,
        {alwaysWrap: true}
    )
);
