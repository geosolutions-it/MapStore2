const React = require('react');
const {compose, branch, withState} = require('recompose');
const isArray = require('lodash/isArray');
const flatten = require('lodash/flatten');

const changeNode = (nodes, id, objToMerge) => {
    const targetIndex = nodes.findIndex(node => node.id === id);
    if (targetIndex !== -1) {
        let newNodes = nodes.slice();
        if (objToMerge) {
            newNodes[targetIndex] = {...newNodes[targetIndex], ...objToMerge};
        } else {
            newNodes.splice(targetIndex, 1);
        }
        return newNodes;
    }
    return nodes.map(node => ({...node, nodes: node.nodes && changeNode(node.nodes, id, objToMerge)}));
};

const updateNodes = (nodes, dndState) => {
    const {node: draggedNode, sortIndex, parentNodeId, newParentNodeId, illegalDrop} = dndState;

    if (!nodes || !draggedNode) {
        return nodes;
    }

    return nodes.map(node => {
        if (node.nodes && node.id === newParentNodeId) {
            let newNodes = newParentNodeId === parentNodeId ? changeNode(node.nodes, draggedNode.id, null) : node.nodes.slice();
            newNodes.splice(sortIndex, 0, {...draggedNode, ...(newParentNodeId === parentNodeId ?
                {} :
                {id: draggedNode.id + '__placeholder', placeholder: true, hide: !!illegalDrop})});
            return {...node, nodes: newNodes};
        }
        return {...node, nodes: updateNodes(node.nodes, dndState)};
    });
};

const insertDummies = (node, dndState) => {
    const {node: draggedNode, newParentNodeId, parentNodeId} = dndState;
    // use flatten instead of .flat() because it's not supported on edge
    return {...node, nodes: flatten(node.nodes.map((curNode, ix) => {
        if (curNode.nodes && !curNode.placeholder && !curNode.hide && !(draggedNode && curNode.id === draggedNode.id)) {
            const newCurNode = insertDummies(curNode, dndState);
            return [newCurNode].concat(node.nodes[ix + 1] &&
                (node.nodes[ix + 1].placeholder ||
                    (draggedNode && node.id === newParentNodeId && newParentNodeId === parentNodeId && node.nodes[ix + 1].id === draggedNode.id)) ?
                [] :
                [{id: curNode.id + '__dummy', dummy: true}]);
        }
        return [curNode];
    }))};
};

/**
* TOC list dnd enhancer. Manages dnd state, i.e. modifies incoming props.nodes according to the current dnd state
* (basically just determines how and where to insert a placeholder node)
* @type {function}
* @name dndTreeRoot
* @memberof components.TOC.enhancers
*/
const dndTree = branch(
    ({nodes}) => isArray(nodes),
    compose(
        withState('dndState', 'setDndState', {
            node: null,
            parentNodeId: '',
            newParentNodeId: '',
            sortIndex: 0,
            illegalDrop: null
        }),
        Component => ({dndState, nodes, ...props}) => {
            const {node: draggedNode, parentNodeId, newParentNodeId, illegalDrop} = dndState;
            const newRoot = updateNodes([{id: 'root', nodes}], dndState)[0];
            const hiddenNodes = newParentNodeId === parentNodeId && !illegalDrop ?
                newRoot.nodes :
                changeNode(newRoot.nodes, draggedNode.id, {hide: true});
            const rootWithDummies = insertDummies({id: 'root', nodes: hiddenNodes}, dndState);
            return (
                <Component {...props} nodes={rootWithDummies.nodes}/>
            );
        }
    )
);

module.exports = dndTree;
