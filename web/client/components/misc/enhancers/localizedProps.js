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
            return {...item, [defaultProp]: !isNil(msg) ? msg : path};
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
 * @param  {string} localizedKey Name of the prop used to localize properties in arrays, default "label"
 * @return {HOC}         An HOC that replaces the prop string with localized string.
 * @example
 * const Input = localizedProps('placeholder')(BootstrapInput);
 * const CustomSelect = localizedProps('options', 'customLabel')(ReactSelect);
 * const Select = localizedProps('options')(ReactSelect);
 * // render
 * //...
 * <Input placeholder="path.to.placeholder.message" />
 * or
 * <CustomSelect options={[{customLabel: "path1", value: v}, {customLabel: "path2", value: v}]} />
 * <Select options={[{label: "path1", value: v}, {label: "path2", value: v}]} />
 */
module.exports = (propNames, localizedKey = "label") => compose(
    getContext({
        messages: PropTypes.object
    }),
    mapProps(({messages, ...props}) => ({
        ...props,
        ...(castArray(propNames).reduce(accumulate(props, messages, localizedKey), {}))
    })
    ));
