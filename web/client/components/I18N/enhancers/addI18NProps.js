/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const {injectIntl} = require('react-intl');
const PropTypes = require('prop-types');
const {omit} = require('lodash');
const { compose, branch, getContext, withProps, mapProps } = require('recompose');

const omitProps = keys => mapProps(props => omit(props, keys));

// TODO: provide better defaults
const defaults = {
    locale: navigator && navigator.language,
    formats: { },
    messages: { },
    defaultLocale: 'en',
    defaultFormats: {},
    formatDate: v => v,
    formatTime: v => v,
    formatRelative: v => v,
    formatNumber: v => v,
    formatPlural: v => v,
    formatMessage: v => v,
    formatHTMLMessage: v => v,
    now: () => new Date()
};

/**
 * @name addI18NFormat
 * @param {string[]} props add the props to format as props. One of these https://github.com/yahoo/react-intl/wiki/API#intlshape
 */
module.exports = (propsToAdd = []) => compose(
    getContext({intl: PropTypes.object}),
    branch(
        ({intl}) => !!intl,
        injectIntl,
        withProps({intl: defaults})
    ),
    withProps(({ intl = {} }) => propsToAdd.reduce((acc = {}, k) => ({
        ...acc,
        [k]: intl[k]
    }), {})),
    omitProps(['intl'])
);
