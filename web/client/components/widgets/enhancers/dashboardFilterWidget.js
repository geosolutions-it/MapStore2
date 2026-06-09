/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose } from 'recompose';
import deleteWidget from './deleteWidget';
import { editableWidget, hidableWidget, defaultIcons, withHeaderTools } from './tools';

/**
 * Enhancers for the dashboard filter widget
 * Adds base widget functionality: delete, edit, hide, icons, and header tools
 */
export default compose(
    deleteWidget,
    editableWidget(),
    hidableWidget(),
    defaultIcons(),
    withHeaderTools()
);

