/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import deleteWidget from './deleteWidget';

import { compose } from 'recompose';
import { editableWidget, defaultIcons, withHeaderTools } from './tools';

export default compose(
    deleteWidget,
    editableWidget(),
    defaultIcons(),
    withHeaderTools()
);
