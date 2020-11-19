/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { compose } from 'recompose';

import deleteWidget from "./deleteWidget";
import { defaultIcons, editableWidget, withHeaderTools } from './tools';

export default compose(
    deleteWidget,
    editableWidget(),
    defaultIcons(),
    withHeaderTools()
);
