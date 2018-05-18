/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { compose, withProps } = require('recompose');
const { connect } = require('react-redux');

const { onEditorChange } = require('../../../actions/widgets');
/**
 * Reset widgets
 */
module.exports = compose(
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
