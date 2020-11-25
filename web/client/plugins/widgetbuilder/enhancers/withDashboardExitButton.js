/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { compose, withProps } from 'recompose';

import { connect } from 'react-redux';
import { onEditorChange } from '../../../actions/widgets';

/**
 * Reset widgets
 */
export default compose(
    connect(() => ({}), {
        backFromWizard: () => onEditorChange('layer', undefined)
    }),
    withProps(({ backFromWizard = () => {} }) => ({
        exitButton: {
            onClick: backFromWizard,
            glyph: 'arrow-left',
            tooltipId: "widgets.builder.wizard.backToLayerSelection"
        }
    }))
);
