const React = require('react');
const {compose, branch, withState} = require('recompose');
const {isArray} = require('lodash');

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
            const newNodes = updateNodes([{id: 'root', nodes}], dndState)[0].nodes;
            return (
                <Component {...props} nodes={newParentNodeId === parentNodeId &&
                    !illegalDrop ? newNodes : changeNode(newNodes, draggedNode.id, {hide: true})}/>
            );
        }
    )
);

module.exports = dndTree;
