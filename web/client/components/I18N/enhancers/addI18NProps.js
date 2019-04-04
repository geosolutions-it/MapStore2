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
const { compose, branch, getContext, withProps, withPropsOnChange, mapProps } = require('recompose');

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
 * Add i18n functionalities and properties as props. Useful to get format functions when the react-intl components can not be used (i.e. with wrapped libs)
 * @name addI18NFormat
 * @param {string[]} props add the props to format as props. Should be keys of of this interface https://github.com/yahoo/react-intl/wiki/API#intlshape
 * @example
 * addI18NProps(['formatNumber'])(MyCmp); // MyCmp will receive `formatNumber` from current locale Intl object as a property
 */
module.exports = (propsToAdd = []) => compose(
    // check intl and inject (or add default dummy object)
    getContext({intl: PropTypes.object}),
    branch(
        ({intl}) => !!intl,
        injectIntl,
        withProps({intl: defaults})
    ),
    // add propsToAdd properties from intl object
    withPropsOnChange(['intl'], ({ intl = {} }) => propsToAdd.reduce((acc = {}, k) => ({
        ...acc,
        [k]: intl[k]
    }), {})),
    // clean up intl property
    omitProps(['intl'])
);
