import React, { useEffect, useState, useRef } from "react";
import { Glyphicon } from "react-bootstrap";
import Message from "../../components/I18N/Message";

// Helper to find a node by id in the tree
function findNodeById(tree, id) {
    for (let node of tree) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
}

// Handle checked states of children and parents
function updateCheckedStatus(data, updatedId, newChecked) {
    // Helper function to propagate changes up to parents
    function updateParents(nodeId) {
        const parentNode = findNodeById(data, nodeId);
        if (!parentNode) return;

        const childStates = parentNode.children.map((child) => ({
            checked: child.checked,
            indeterminate: child.indeterminate || false
        }));

        const allChildrenChecked = childStates.every((state) => state.checked);
        const someChildrenChecked = childStates.some(
            (state) => state.checked || state.indeterminate
        );

        parentNode.checked = allChildrenChecked;
        parentNode.indeterminate = !allChildrenChecked && someChildrenChecked;

        updateParents(parentNode.parentId); // Recurse upward by parentId
    }

    // Helper function to propagate changes down to children
    // eslint-disable-next-line no-shadow
    function updateChildren(node, newChecked) {
        if (node.children) {
            node.children.forEach((child) => {
                child.checked = newChecked; // Set each child's checked status
                child.indeterminate = false; // Reset indeterminate state for all children
                updateChildren(child, newChecked); // Recurse down to children
            });
        }
    }

    // Helper function to process each node
    function processNode(node, parentId) {
        // Attach reference to parentId for upward flow
        node.parentId = parentId;

        if (node.id === updatedId) {
            // Update this node's checked status
            node.checked = newChecked;

            // Update children
            updateChildren(node, newChecked);

            // Update ancestors (parents, grandparents)
            updateParents(parentId);
        } else if (node.children) {
            // Recursively process children
            node.children.forEach((child) => processNode(child, node.id));
        }

        // If this node has children, calculate its indeterminate state
        if (node.children) {
            const childStates = node.children.map((child) => ({
                checked: child.checked,
                indeterminate: child.indeterminate || false
            }));

            const allChildrenChecked = childStates.every((state) => state.checked);
            const someChildrenChecked = childStates.some(
                (state) => state.checked || state.indeterminate
            );

            node.checked = allChildrenChecked;
            node.indeterminate = !allChildrenChecked && someChildrenChecked;
        }
    }

    // Process the root-level nodes
    data.forEach((node) => processNode(node, null));
    return data;
}

const TreeNode = ({ node, onToggle, onCheck }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const inputRef = useRef(null);

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        onToggle(node);
    };

    const handleCheck = (event) => {
        onCheck(node, event.target.checked);
    };

    // Since indeterminate is not a React state property, handle it through ref
    useEffect(() => {
        if (node.indeterminate) {
            inputRef.current.indeterminate = true;
        } else {
            inputRef.current.indeterminate = false;
        }
    }, [node.indeterminate]);

    return (
        <div style={{ marginLeft: node?.children ? 5 : 20, borderTop: node?.children ? "0.5px solid #0000002b" : null, padding: node?.children ? '2px' : '0px' }}>
            <div id={`node-${node.id}`}>
                {node.children && (
                    <Glyphicon
                        onClick={handleToggle}
                        glyph={isExpanded ? "chevron-down" : "chevron-right"}
                    />
                )}
                <input
                    id={`node-checkbox-${node.id}`}
                    ref={inputRef}
                    type="checkbox"
                    style={{ marginRight: 3 }}
                    checked={node.checked || false}
                    onChange={handleCheck}
                />
                <Message msgId={`userSession.sessionLabels.${node.id}`} />
            </div>
            {isExpanded && node.children && (
                <div>
                    {node.children.map((childNode) => (
                        <TreeNode
                            key={childNode.id}
                            node={childNode}
                            onToggle={onToggle}
                            onCheck={onCheck}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Tree = ({ data = [], onTreeUpdate = () => {} }) => {
    const [treeData, setTreeData] = useState(data);

    const handleToggle = (node) => {
        const updateTree = (nodes) =>
            nodes.map((n) => {
                if (n.id === node.id) {
                    n.isExpanded = !n.isExpanded;
                }
                if (n.children) {
                    n.children = updateTree(n.children);
                }
                return n;
            });
        setTreeData(updateTree(treeData));
    };

    const handleCheck = (node, isChecked) => {
        const updateTree = (nodes) =>
            nodes.map((n) => {
                if (n.id === node.id) {
                    n.checked = isChecked;
                }
                if (n.children) {
                    n.children = updateTree(n.children);
                }
                return n;
            });
        const nodeToUpdate = updateTree(treeData);
        // updateCheckedStatus is used to update children's and parent's checked, indeterminate state if needed
        setTreeData(updateCheckedStatus(nodeToUpdate, node.id, isChecked));
    };

    // If treeData is changed in any way, pass treeData to parent using onTreeUpdate
    useEffect(() => {
        onTreeUpdate(treeData);
    }, [treeData]);

    return (
        <div>
            {treeData.map((node) => (
                <TreeNode
                    key={node.id}
                    node={node}
                    onToggle={handleToggle}
                    onCheck={handleCheck}
                    treeData={treeData}
                />
            ))}
        </div>
    );
};

export default Tree;
