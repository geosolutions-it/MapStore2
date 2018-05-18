/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
/**
 * Works with handleNodeSelection and mapToNode to retrieve node in `nodes` with the `editNode` id.
 */
const { isMatch } = require('lodash');
const { withProps } = require('recompose');
const traverse = (branch = [], filter) => {
    for (let i = 0; i < branch.length; i++) {
        if (isMatch(branch[i], filter)) {
            return branch[i];
        }
    }

    for (let j = 0; j < branch.length; j++) {
        let result = traverse(branch[j].nodes, filter);
        if (result !== undefined) {
            return result;
        }
    }

    return undefined; // no match found

};
module.exports = withProps(({ nodes = {}, editNode }) => ({
    selectedNode: editNode && traverse(nodes, { id: editNode })
}));
