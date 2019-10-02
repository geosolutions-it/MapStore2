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

const isTool = t => t.target === "tools";
const hasTools = (tt = []) => tt.filter(isTool).length > 0;

/**
 * Transforms widgetTools into leftItems for the widget.
 */
module.exports = () =>
    compose(
        withPropsOnChange(
            ['topLeftItems', 'widgetTools'],
            ({ topLeftItems = [], widgetTools}) => ({
                topLeftItems: hasTools(widgetTools)
                    ? [
                        ...topLeftItems,
                        (<Toolbar btnGroupProps={{
                            style: {
                                position: 'absolute',
                                left: 14
                            }
                        }}
                        btnDefaultProps={{
                            className: 'no-border',
                            bsSize: 'small',
                            bsStyle: 'link',
                            style: {
                                paddingLeft: 4,
                                paddingRight: 4
                            }
                        }}
                        buttons={widgetTools.filter(isTool)} />)]
                    : topLeftItems
            })
        )
    );
