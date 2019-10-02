/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const { withPropsOnChange } = require('recompose');
const { get, castArray, mapValues, isString, isArray } = require('lodash');

const parseRules = ({accessInfo, postProcessValue, reduceFun}) => rawRules => {
    let rules = castArray(rawRules);
    let effectiveReduceFun = reduceFun;
    if (rules.length > 1 && rules[0] === "__OR__") {
        effectiveReduceFun = (acc, v) => acc || v;
        rules = rules.slice(1);
    }
    // evaluate rules
    return rules
        .map(r => {
            let rule = r;
            if (isArray(rule)) {
                return parseRules({ accessInfo, postProcessValue, reduceFun })(rule);
            }
            let negate = false;
            if (rule && isString(rule) && rule.startsWith("!")) {
                negate = true;
                rule = rule.substr(1);
            }
            const finalize = v => negate ? !v : v;
            const ruleParts = isString(rule) && rule.split(":"); // part after `:` is reserved for future use, e.g. default values or flags
            if (ruleParts && ruleParts[0]) {
                const diffRuleCore = ruleParts[0].split(/\!\=\=?/); // = can be used to compare
                const equalRuleCore = ruleParts[0].split(/\=\=?\=?/);
                if (diffRuleCore.length > 1) {
                    return finalize(postProcessValue(get(accessInfo, diffRuleCore[0]), rule) !== diffRuleCore[1]);
                } else if (equalRuleCore.length > 1) { // if != is not matched, than also = is valid
                    return finalize(postProcessValue(get(accessInfo, equalRuleCore[0]), rule) === equalRuleCore[1]);
                }
                // in case of normal string
                return finalize(postProcessValue(get(accessInfo, ruleParts[0]), rule));
            }
            // in case it was not a string
            return rule;

        })
        // combine rules
        .reduce(effectiveReduceFun || ((acc, v) => acc && v));
};
/**
 * Allow to transform a property processing another property (as an object) and applying certain rules.
 * It's useful if you want to generate flags that allow or deny certain functionalities based on certain rules to put in configuration.
 * Typically used with connect, expect to have an `accessInfo` object to use as source of information to apply the rules.
 * example:
 * ```
 * const CMP = accessRuleParser("hasAllAccess")(oldCMP);
 * // hasAllAccess property in nestedComponent will be the result of accessInfo.mapInfo.canEdit && accessInfo.mapInfo.canDelete ( true )
 * return <CMP accessInfo={{ user: {role: "ADMIN"}, mapInfo: {canEdit: true, canDelete: true}}} hasAllAccess={["mapInfo.canEdit", "mapInfo.canDelete"]} />
 * // or
 * return <CMP accessInfo={{ user: {role: "ADMIN"}, mapInfo: {canEdit: true, canDelete: true}}} hasAllAccess={["user.role=ADMIN", "mapInfo.canDelete"]} />
 * // you can even transform a structured object
 * const CMP = accessRuleParser("hasAllAccess", {asObject: true})(oldCMP);
 * return <CMP accessInfo={{ user: {role: "ADMIN"}, mapInfo: {canEdit: true, canDelete: true}}} hasAllAccess={["mapInfo.canEdit", "mapInfo.canDelete"]} />
 *
 * // you can use "__OR__" as first element to change the default AND check of rules in array to OR
 * const CMP = accessRuleParser("hasAllAccess", {asObject: true})(oldCMP);
 * return <CMP accessInfo={{ user: {role: "ADMIN"}, mapInfo: {canEdit: true, canDelete: true}}} hasAllAccess={["__OR__", "mapInfo.canEdit", "mapInfo.canDelete"]} />
 * ```
 * **NOTE**: this limit the values of the variables that work with this parser. They can not start with `!` or be contained in `{}` (TODO: support JS expression like plugins)
 *
 * @name accessRuleParser
 * @memberof components.misc.enhancers.security
 * @param {string} name - name of the property to transform
 * @param {Object} options - The options to generate the enhancer
 * @param {string} [options.asObject = false] if true, the property is intended to be an object. The rules will be applied on each key of the object.
 *        If not defined, at propToMap have to be defined. Otherwise the rule will be applied only to the property. Useful if you have more than one flag to set.
 * @param {function} [options.postProcessValue = identity] process the value get from a rule to return. The function has the rule as second argument. Example of custom postProcessValue function is: `(v, rule) => rule == "_ALWAYS_FALSE_" ? false : v * 2
 * @param {function} [options.reduceFun = AND]. An Array.reduce function to accumulate the rules, useful if you want to transform the variable in a different thing that a flag, or you want to use OR condition.
 * @param {object} [options.accessInfo="accessInfo"]: the property name of the property to use to retrieve data
 */
module.exports = (name, { asObject = false, postProcessValue = v => v, reduceFun, accessInfo = "accessInfo" } = {}) =>
    withPropsOnChange(
        [name, accessInfo],
        (props = {}) => (
            asObject
                ? {
                    [name]: mapValues(props[name], parseRules({accessInfo: props[accessInfo], postProcessValue, reduceFun}))
                }
                : {
                    [name]: parseRules({accessInfo: props[accessInfo], postProcessValue, reduceFun })(props[name])
                })
    );
