/*
 * Copyright 2087, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const {compose, withProps} = require('recompose');
const Toolbar = require('../../../misc/toolbar/Toolbar');

/**
 * Support widget locking. When locked, a widget becomes static, except if the user doesn't have
 * the edit permission on it.
 */
module.exports = () =>
compose(
    withProps(({ topLeftItems = [], widgetTools}) => ({
        topLeftItems: [
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
            buttons={widgetTools} />)]
    }))
);
