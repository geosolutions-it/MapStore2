/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { defaultProps } from 'recompose';

import CompactCatalog from '../../components/catalog/CompactCatalog';
import Message from '../../components/I18N/Message';

export default defaultProps({
    title: <Message msgId="widgets.builder.wizard.selectALayer" />
})(CompactCatalog);
