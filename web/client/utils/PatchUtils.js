import jiff from "jiff";
import jp from "jsonpath";
import isArray from "lodash/isArray";
import isString from "lodash/isString";
import castArray from "lodash/castArray";

/**
 * convert paths from jsonpath format to json patch format
 * @param {object[]} paths array of paths in jsonpath format
 */
export const transformPath = (paths) => {
    if (isArray(paths)) {
        return paths.map(([, ...other]) => ["", ...other].join("/"));
    }
    return isString(paths) ? paths : "";
};

/**
 * converts mixed rules with json path format in fully compatible json-patch rules
 * @param {object} sourceJSON usually the main json to perform research
 * @param {object[]} rawRules series of object defined with json patch format with jsonpath format for the path
 * @example rule for removing all ZoomIn plugins
 * {op: "remove", jsonpath: "$.plugins..[?(@.name == 'ZoomIn')]"}
 *
 *
 * @example rule for changing config to all ZoomIn plugins
 * {op: "replace", jsonpath: "$.plugins..[?(@.name == 'ZoomIn')].cfg.maxZoom, value: 3}
 */
export const convertToJsonPatch = (sourceJSON = {}, rawRules = []) => {
    const patchRules = castArray(rawRules).reduce((p, {op, jsonpath, value}) => {
        let transformedPaths;
        try {
            transformedPaths = transformPath(jp.paths(sourceJSON, jsonpath));
        } catch (e) {
            // in this case the jsonpath lib failed because the path was not a valid jsonpath one
            transformedPaths = [jsonpath];
        }
        let transformedRules = transformedPaths.map((path) => {
            let transformedRule = { op, path };
            if (value) {
                transformedRule.value = value;
            }
            return transformedRule;
        });
        return p.concat(transformedRules);
    }, []);
    return patchRules;
};

/**
 * Applies a single patch object to a full JSON object.
 *
 * @param {object} full full JSON object
 * @param {object} patch patch to be applied (in json-patch extended format)
 */
export function applyPatch(full, patch) {
    const patchesCount = convertToJsonPatch(full, patch).length;
    let merged = full;
    for (let i = 0; i < patchesCount; i++) {
        const rules = convertToJsonPatch(merged, patch);
        // when we apply a remove operation, the next convert will not return the related rule anymore
        const rule = (patch.op === "remove") ? rules[0] : rules[i];
        merged = jiff.patch([rule], merged);
    }
    return merged;
}

/**
 * Merges a JSON config object with a list of patches in json-patch extended format.
 * The extended json-patch format supports a jsonpath attribute, where a path can
 * be written with a more powerful syntax, json-path (https://goessner.net/articles/JsonPath/).
 *
 * @param {object} full main JSON object
 * @param {object[]} patches list of json-patch objects to be applied
 * @returns a patches object, with all patches applied
 */
export function mergeConfigsPatch(full, patches) {
    if (!patches) {
        return full;
    }
    return (patches || []).reduce((merged, patch) => {
        return applyPatch(merged, patch);
    }, full);
}
