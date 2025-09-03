/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import PropTypes from 'prop-types';

import { castArray } from 'lodash';
import { getContext, mapProps, compose } from 'recompose';
import { getLocalizedProp } from '../../../utils/LocaleUtils';

const accumulate = (props, locale) => (acc = {}, propName) => ({
    ...acc,
    [propName]: props[propName] && getLocalizedProp(locale, props[propName])
});

/**
 * Converts the props indicated as arguments into localized strings checking if they are map of localized strings, like this:
 * ```
 * {
 *  "default": "TEST",
 *  "en-US": "TEST en-US"
 * }
 * ```
 * @name localizeStringMap
 * @memberof components.misc.enhancers
 * @param  {string|string[]} propNames Name of the prop(s) to replace. can be an array or a single prop
 * @return {HOC}         An HOC that replaces the prop string with localized string.
 * @example
 * const Input = localizeStringMap('title')(TitleBar);
 * // render
 * //...
 * <Input placeholder={{title}} />
 */
export default (propNames) => compose(
    getContext({
        locale: PropTypes.string
    }),
    mapProps(({locale, ...props}) => ({
        ...props,
        ...(castArray(propNames).reduce(accumulate(props, locale), {}))
    })
    ));
