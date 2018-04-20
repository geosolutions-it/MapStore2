/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const emptyState = require('../../../../misc/enhancers/emptyState');
const Message = require('../../../../I18N/Message');

/**
 * Enhances a component to show the empty view in case of no attributes.
 * @param {function} the test to show the empty view
 */
const noAttributes = (func) => emptyState(
    func,
    {
        title: <Message msgId="widgets.builder.errors.noAttributesTitle" />,
        description: <Message msgId="widgets.builder.errors.noAttributesDescription" />,
        glyph: 'warning-sign'
    }
);
module.exports = noAttributes;
