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

function ContextMenu({
    items,
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
                zIndex: 10
            }}
            onClick={onClick}
        >
            {items.map(({ name, Component }) => {
                return (
                    <Component
                        key={name}
                        selectedNodes={[value]}
                        contextMenu
                        itemComponent={TableOfContentItemButton}
                        status={status}
                        statusTypes={statusTypes}
                        nodeTypes={nodeTypes}
                        rootGroupId={rootGroupId}
                        defaultGroupId={defaultGroupId}
                        config={config}
                    />);
            })}
        </div>,
        containerNode
    );
}

export default ContextMenu;
