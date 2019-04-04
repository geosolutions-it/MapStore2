/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {injectIntl} = require('react-intl');
const {omit} = require('lodash');
const { compose, toClass, mapProps, withProps } = require('recompose');

const omitProps = keys => mapProps(props => omit(props, keys));

/**
 * @name addI18NFormat
 * @param {string[]} propsToAdd add the props to format as props. Choose in theese of these https://github.com/yahoo/react-intl/wiki/API#intlshape
 */
module.exports = (propsToAdd = []) => compose(
    C => injectIntl(C, { intlPropName: '__intl__'} ),
    withProps(({__intl__ = {}}) => propsToAdd.reduce((acc = {}, k) => ({
        ...acc,
        [k]: __intl__[k]
    }), {})),
    omitProps(['__intl__'])
);
