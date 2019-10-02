/*
 * Copyright 2087, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const { compose, withPropsOnChange } = require('recompose');
const Toolbar = require('../../../misc/toolbar/Toolbar');

const isIcon = t => t.target === "icons";
const hasIcons = (tt = []) => tt.filter(isIcon).length > 0;

/**
 * Transforms `widgetTools` with target `icons` into `icons` for the WidgetContainer
 */
module.exports = () =>
    compose(
        withPropsOnChange(
            ['icons', 'widgetTools'],
            ({ icons = [], widgetTools }) => ({
                icons: hasIcons(widgetTools)
                    ? (<Toolbar
                        btnDefaultProps={{
                            className: 'no-border',
                            bsSize: 'xs',
                            bsStyle: 'link'
                        }}
                        buttons={widgetTools.filter(isIcon)} />)
                    : icons
            })
        )
    );
