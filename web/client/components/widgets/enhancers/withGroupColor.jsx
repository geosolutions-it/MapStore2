/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { withProps } from 'recompose';

import { get, head } from 'lodash';
const getGroupColor = groups => get(head(groups, ({ color }) => color), 'color');

/**
 * get the first color found in widget groups array.
 */
export default withProps(({ groups, showGroupColor, headerStyle = {borderTop: "3px solid rgba(0,0,0,0)", transition: "border-color .5s ease-out"} }) => ({
    headerStyle: showGroupColor && groups && getGroupColor(groups)
        ? { ...headerStyle, borderTop: `3px solid ${getGroupColor(groups)}` }
        : headerStyle
}));
