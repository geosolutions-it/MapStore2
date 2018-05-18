/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {getMessageById} = require('../../../utils/LocaleUtils');
const PropTypes = require('prop-types');
const {castArray, isNil} = require('lodash');
const {getContext, mapProps, compose} = require('recompose');

const getMessage = (messages, path) => {
    const msg = getMessageById(messages, path);
    return !isNil(msg) ? msg : path;
};
const accumulate = (props, messages) => (acc = {}, propName) => ({
            ...acc,
            [propName]: props[propName] && getMessage(messages, props[propName])
        });
/**
 * Converts the msgId provided for the props indicated as arguments into localized
 * strings getting them from the context.
 * @name localizedProps
 * @memberof components.misc.enhancers
 * @param  {string|[string]} propNames Name of the prop(s) to replace. can be an array or a single prop
 * @return {HOC}         An HOC that replaces the prop string with localized string.
 * @example
 * const Input = localizeProps('placeholder')(BootstrapInput);
 * // render
 * //...
 * <Input placeholder="path.to.placeholder.message" />
 */
module.exports = (propNames) => compose(
    getContext({
        messages: PropTypes.object
    }),
    mapProps(({messages, ...props}) => ({
        ...props,
        ...(castArray(propNames).reduce(accumulate(props, messages), {}))
    })
));
