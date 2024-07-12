/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getConfigProp } from '../../../utils/ConfigUtils';
import isFunction from 'lodash/isFunction';
import TableOfContentItemButton from './TableOfContentItemButton';
import { NodeTypes, ROOT_GROUP_ID, DEFAULT_GROUP_ID } from '../../../utils/LayersUtils';
import { StatusTypes } from '../utils/TOCUtils';

/**
 * This component renders a context menu
 * @prop {array} items list of items to display in the menu, expected structure [ { name, Component }, ... ]
 * @prop {object} value selected node, expected structure { id, type, node }
 * @prop {function} onClick triggered on click event
 * @prop {function} onClose triggered on close event, eg. clicking outside the menu
 * @prop {boolean} show if true show the menu
 * @prop {array} position position of the menu in pixels [left, top]
 * @prop {function} containerNode this function must return a valid dom node used by this component as target for the portal
 * @prop {object} nodeTypes constant values for node types
 * @prop {string} rootGroupId constant value for root group id
 * @prop {string} defaultGroupId constant value for default group id
 * @prop {object} statusTypes constant values for selection status types
 * @prop {object} config custom configuration to pass to the toc items
 */
function ContextMenu({
    items = [],
    value,
    onClick = () => {},
    onClose = () => {},
    show,
    position,
    containerNode: containerNodeProp = () => document.querySelector('.' + (getConfigProp('themePrefix') || 'ms2') + " > div") || document.body,
    statusTypes = StatusTypes,
    nodeTypes = NodeTypes,
    rootGroupId = ROOT_GROUP_ID,
    defaultGroupId = DEFAULT_GROUP_ID,
    config
}) {

    const containerNode = isFunction(containerNodeProp) ? containerNodeProp() : containerNodeProp;
    const ref = useRef();
    const [style, setStyle] = useState({});

    useEffect(() => {
        function handlePointerDownOut(event) {
            const nodeContains = ref?.current?.contains;
            if (nodeContains && !ref.current.contains(event.target)) {
                onClose();
            }
        }
        window.addEventListener('pointerdown', handlePointerDownOut);
        return () => {
            window.removeEventListener('pointerdown', handlePointerDownOut);
        };
    }, [ ref ]);

    useLayoutEffect(() => {
        if (position) {
            const [left, top] = position;
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const { height, width } = ref?.current?.getBoundingClientRect();
            const translateY = (top + height) > windowHeight ? '-100%' : '0';
            const translateX = (left + width) > windowWidth ? '-100%' : '0';
            setStyle({
                transform: `translate(${translateX}, ${translateY})`,
                top,
                left
            });
        }
    }, [position]);

    function getSelectedNodesStatus() {
        const type = value?.type;
        if (type === nodeTypes.LAYER) {
            return statusTypes.LAYER;
        }
        if (type === nodeTypes.GROUP) {
            return statusTypes.GROUP;
        }
        return null;
    }

    const status = getSelectedNodesStatus();

    const componentProps = {
        selectedNodes: [value],
        status,
        statusTypes,
        nodeTypes,
        rootGroupId,
        defaultGroupId,
        config,
        itemComponent: TableOfContentItemButton
    };

    return createPortal(
        <div
            ref={ref}
            className="ms-context-menu"
            style={{
                ...style,
                position: 'fixed',
                // using display none to allow
                // portal components inside buttons
                display: show ? 'flex' : 'none',
                flexDirection: 'column',
                // we need an high number for map editor inside modal (eg. geostory map editor)
                zIndex: 5000
            }}
            onClick={onClick}
        >
            {items.filter(({ selector = () => true }) => selector(componentProps)).map(({ name, Component }) => {
                return (
                    <Component
                        key={name}
                        {...componentProps}
                        contextMenu
                    />);
            })}
        </div>,
        containerNode
    );
}

export default ContextMenu;
