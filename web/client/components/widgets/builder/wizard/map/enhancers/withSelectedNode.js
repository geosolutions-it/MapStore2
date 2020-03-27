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
const traverse = (branch = [], filter, fn) => {
    for (let i in branch) {
        if (branch[i] !== null && typeof(branch[i]) === "object") {
            if (isMatch(branch[i], filter)) {
                fn.apply(this, [branch[i]]);
            }
            traverse(branch[i], filter, fn);
        }
    }
};
module.exports = withProps(({ nodes = {}, editNode }) => {
    let selectedNode = {};
    editNode && traverse(nodes, { id: editNode }, (resultNode)=>{
        selectedNode = resultNode;
    });
    return { selectedNode };
});
