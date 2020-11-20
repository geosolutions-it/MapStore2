/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { connect } from 'react-redux';
import { onEditorChange } from '../../../../actions/widgets';

export default connect(() => ({}), {
    onLayerChoice: (l) => onEditorChange("layer", l),
    onResetChange: onEditorChange
});
