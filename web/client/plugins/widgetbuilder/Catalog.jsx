/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');
const Message = require('../../components/I18N/Message');
const {defaultProps} = require('recompose');
module.exports =
    defaultProps({
        title: <Message msgId="widgets.builder.wizard.selectALayer" />
    })(require('../../components/catalog/CompactCatalog'));
