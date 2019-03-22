/**
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

const FeatureGridEditorUtils = {
    forceSelection: ( {oldValue, changedValue, data, allowEmpty}) => {
        if (allowEmpty && changedValue === "") {
            return "";
        }
        return data.indexOf(changedValue) !== -1 ? changedValue : oldValue;
    }
};

module.exports = FeatureGridEditorUtils;
