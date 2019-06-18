/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {compose, branch, renderComponent} = require('recompose');
const LoadingContent = require('./LoadingContent');
const ErrorContent = require('./ErrorContent');
const NormalContent = require('./NormalContent');

module.exports = compose(
    branch(
        ({loading}) => loading,
        renderComponent(LoadingContent),
    ),
    branch(
        ({error}) => error,
        renderComponent(ErrorContent)
    )
)(NormalContent);
