/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import deleteWidget from './deleteWidget';

import { compose } from 'recompose';
import { editableWidget, hidableWidget, defaultIcons, withHeaderTools } from './tools';

/**
 * enhancers for the text widget
 */
export default compose(
    deleteWidget,
    editableWidget(),
    hidableWidget(),
    defaultIcons(),
    withHeaderTools()
);
