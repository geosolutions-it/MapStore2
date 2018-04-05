/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */


/* Breadth First Search function
     * id is the source vertex
     * allPairs is the input array, which contains length 2 arrays
     * visited is a dictionary for keeping track of whether a node is visited
     */
const bfs = (id, allPairs, visited) => {
    const q = [];
    const curr = [];
    let i;
    let v = id;
    let pair;
    q.push(v);
    while (q.length > 0) {
        v = q.shift();
        if (!visited[v]) {
            visited[v] = true;
            curr.push(v);
            // go through the input array to find vertices that are
            // directly adjacent to the current vertex, and put them
            // onto the queue
            for (i = 0; i < allPairs.length; i += 1) {
                pair = allPairs[i];
                if (pair[0] === v && !visited[pair[1]]) {
                    q.push(pair[1]);
                } else if (pair[1] === v && !visited[pair[0]]) {
                    q.push(pair[0]);
                }
            }
        }
    }
    // return everything in the current "group"
    return curr;
};
const findGroups = (pairs) => {
    let visited = {};
    let groups = [];
    for (let i = 0, length = pairs.length; i < length; i += 1) {
        let currentPair = pairs[i];
        let u = currentPair[0];
        let v = currentPair[1];
        let src = null;
        if (!visited[u]) {
            src = u;
        } else if (!visited[v]) {
            src = v;
        }
        if (src) {
            // there is an unvisited vertex in this pair.
            // perform a breadth first search, and push the resulting
            // group onto the list of all groups
            groups.push(bfs(src, pairs, visited));
        }
    }
    return groups;
};

/**
 * Utility functions for graphs
 * @name GraphUtils
 * @memberof utils
 */
module.exports = {
    bfs,
    findGroups
};
