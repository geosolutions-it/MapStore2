/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


const {getMessageById} = require('../../../utils/LocaleUtils');
const PropTypes = require('prop-types');
const {castArray, isArray, isNil, isString} = require('lodash');
const {getContext, mapProps, compose} = require('recompose');

/**
 * @returns {string|object[]} the translated message or array of message in the form of [{label: "path1"}, {label: "path2"}]
 */
const getMessage = (messages, path, defaultProp = "label") => {
    if (isArray(path)) {
        return path.map((item) => {
            const msg = getMessageById(messages, item[defaultProp] || isString(item) && item || "");
            return {...item, label: !isNil(msg) ? msg : path};
        });
    }
    const msg = getMessageById(messages, path);
    return !isNil(msg) ? msg : path;
};
const accumulate = (props, messages, labelName) => (acc = {}, propName) => ({
    ...acc,
    [propName]: props[propName] && getMessage(messages, props[propName], labelName)
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
module.exports = (propNames, labelName) => compose(
    getContext({
        messages: PropTypes.object
    }),
    mapProps(({messages, ...props}) => ({
        ...props,
        ...(castArray(propNames).reduce(accumulate(props, messages, labelName), {}))
    })
    ));
