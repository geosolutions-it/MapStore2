/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


import { getMessageById } from '../../../utils/LocaleUtils';
import { extractLocalizedString } from '../../I18N/LocalizedString';

import PropTypes from 'prop-types';
import { castArray, isArray, isNil, isString } from 'lodash';
import { getContext, mapProps, compose } from 'recompose';

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
    const msg = path ? getMessageById(messages, path) : path;
    return !isNil(msg) ? msg : path;
};
const getLocalizedObjectEntry = (items, locale, defaultProp = "label") => {
    if (isArray(items)) {
        return items.map((item) => {
            const msg = extractLocalizedString(item[defaultProp] || isString(item) && item || "", locale);
            return {...item, [defaultProp]: !isNil(msg) ? msg : items};
        });
    }
    const msg = extractLocalizedString(items, locale);
    return !isNil(msg) ? msg : items;
};

const accumulate = (props, {messages, locale, mode}, labelName) => (acc = {}, propName) => ({
    ...acc,
    [propName]: mode === 'msgId' ? getMessage(messages, props[propName], labelName) : getLocalizedObjectEntry(props[propName], locale, labelName)
});
/**
 * Converts the properties indicated in the `propNames` parameter to localized.
 * If the property is a string, tries to get the localized string from the context.
 *
 * @name localizedProps
 * @memberof components.misc.enhancers
 * @param  {string|string[]} propNames Name of the prop(s) to replace. can be an array or a single prop
 * @param  {string} localizedKey Name of the prop used to localize properties in arrays, default "label"
 * @param {string} [mode="msgId"] the mode of the localized string, default "msgId". Can be "msgId" or "object". The possible values are:
 * .- `"msgId"`, so the localized string is a string is retrieved from the context
 *  - `"object"` the localized value is a string or an object with the localized strings for each language. (e.g. `{"it-IT": "italian", "en-US": "English", default: "DefaultString"}`)
 * @return {HOC} An HOC that replaces the prop string with localized string.
 * @example
 * // --- using msgId mode (Default) ---
 * // - localize single string ...
 * const Input = localizedProps('placeholder')(BootstrapInput);
 * //... and render
 * return (<Input placeholder="path.to.placeholder.message" />)
 * // - localize array of strings ...
 * const CustomSelect = localizedProps('options', 'customLabel')(ReactSelect);
 * //... and render
 * return (<CustomSelect options={[{customLabel: "path1", value: v}, {customLabel: "path2", value: v}]} />)
 * // - by default the localized string is in the "label" property...
 * const Select = localizedProps('options')(ReactSelect);
 * // ... and render
 * return (<Select options={[{label: "path1", value: v}, {label: "path2", value: v}]} />)
 * // -- using the object mode, extract the localized string from the object passed as prop
 * // - localize single string ...
 * const Input = localizedProps('placeholder', undefined, 'object')(BootstrapInput);
 * //... and render
 * return (<Input placeholder={{default: "path.to.placeholder.message", "it-IT": "italian"}} />)
 * // - localize array of strings ...
 * const CustomSelect = localizedProps('options', 'customLabel', 'object')(ReactSelect);
 * // ... and render
 * return (<CustomSelect options={[{customLabel: {default: "path1", "it-IT": "italian"}, value: v}]} />)
 */
export default (propNames, localizedKey = "label", mode = 'msgId') => compose(
    getContext({
        messages: PropTypes.object,
        locale: PropTypes.string
    }),
    mapProps(({messages, locale, ...props}) => ({
        ...props,
        ...(castArray(propNames).reduce(accumulate(props, {locale, messages, mode}, localizedKey), {}))
    })
    ));
