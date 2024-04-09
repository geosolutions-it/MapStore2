/*
 * Copyright 2017, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef, useEffect, useState } from 'react';
import { Glyphicon, Dropdown } from 'react-bootstrap';
import TableOfContentItemButton from './TableOfContentItemButton';
import { NodeTypes, ROOT_GROUP_ID, DEFAULT_GROUP_ID } from '../../../utils/LayersUtils';
import { StatusTypes } from '../utils/TOCUtils';

/**
 * Toolbar component for the TOC
 * @prop {array} items list of items to display in toolbar, expected structure [ { name, Component }, ... ]
 * @prop {array} selectedNodes list of selected nodes, expected structure [ { id, type, node }, ... ]
 * @prop {object} buttonProps props to apply to all the default button components
 * @prop {object} nodeTypes constant values for node types
 * @prop {string} rootGroupId constant value for root group id
 * @prop {string} defaultGroupId constant value for default group id
 * @prop {object} statusTypes constant values for selection status types
 * @prop {object} config custom configuration to pass to the toc items
 */
function Toolbar({
    items = [],
    settingsItems = [],
    selectedNodes = [],
    buttonProps = {
        className: 'toc-toolbar-button',
        bsStyle: 'primary'
    },
    nodeTypes = NodeTypes,
    rootGroupId = ROOT_GROUP_ID,
    defaultGroupId = DEFAULT_GROUP_ID,
    statusTypes = StatusTypes,
    config = {}
}) {
    const ref = useRef();
    const [breakpointData, setBreakpoint ] = useState();
    const selectedGroups = selectedNodes.filter((node) => node.type === nodeTypes.GROUP).map(({ node }) => node);
    const selectedLayers = selectedNodes.filter((node) => node.type === nodeTypes.LAYER).map(({ node }) => node);
    function getSelectedNodesStatus() {
        if (!selectedNodes?.length) {
            return statusTypes.DESELECT;
        }
        if (selectedNodes?.length === 1) {
            return selectedGroups?.length === 1 ? statusTypes.GROUP : statusTypes.LAYER;
        }
        if (!!selectedGroups?.length && !!selectedLayers?.length) {
            return statusTypes.BOTH;
        }
        return !!selectedGroups?.length ? statusTypes.GROUPS : statusTypes.LAYERS;
    }

    const status = getSelectedNodesStatus();
    const componentProps = {
        buttonProps,
        selectedLayers,
        selectedGroups,
        selectedNodes,
        status,
        statusTypes,
        nodeTypes,
        rootGroupId,
        defaultGroupId,
        itemComponent: TableOfContentItemButton,
        config
    };

    useEffect(() => {
        const observer = new MutationObserver(() => {
            const width = ref.current.clientWidth;
            const scrollWidth = ref.current.scrollWidth;
            const overflow = width < scrollWidth;
            if (overflow) {
                const sumUntilIndex = (arr, index) => arr.filter((val, idx) => idx <= index).reduce((acc, val) => acc + val, 0);
                const newBreakpoint = [...ref.current.children]
                    .map((childNode) => childNode.clientWidth)
                    .map((clientWidth, idx, arr) => [sumUntilIndex(arr, idx - 1), idx, clientWidth])
                    .find(([sumWidth, , clientWidth]) => (sumWidth + clientWidth) > width );
                return setBreakpoint(newBreakpoint);
            }
            return setBreakpoint();
        });
        observer.observe(ref.current, { childList: true, subtree: true });
        return () => {
            observer.disconnect();
        };
    }, []);
    const filteredItems = items
        .filter(({ selector = () => true }) => selector(componentProps)); // pre-filter items that should not show
    const [left, breakpoint] = breakpointData || [];
    return (
        <div className="ms-toc-toolbar-container" style={{ display: 'flex', position: 'relative' }}>
            <div className="ms-toc-toolbar" style={{ overflow: 'hidden', display: 'flex', flex: 1 }}>
                <div className="ms-toc-toolbar-content" ref={ref} style={{ overflow: 'hidden', textWrap: 'nowrap' }}>
                    {filteredItems.map(({ Component, name }, idx) => {
                        return (
                            <div key={name ?? `item-${idx}`} style={{
                                display: 'inline-block',
                                ...(breakpoint && idx >= breakpoint && {
                                    visibility: 'hidden'
                                })
                            }}>
                                <Component
                                    {...componentProps}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="ms-toc-toolbar-dropdown">
                    <Dropdown
                        id="ms-toc-toolbar-dropdown"
                        pullRight
                        style={{
                            position: 'absolute',
                            left,
                            ...(breakpoint === undefined && { visibility: 'hidden' })
                        }}
                    >
                        <Dropdown.Toggle noCaret>
                            <Glyphicon glyph="option-vertical"/>
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            {breakpoint !== undefined && filteredItems
                                .filter((item, idx) => idx >= breakpoint)
                                .map(({ Component, name }, idx) => {
                                    return (
                                        <Component
                                            key={name ?? `item-${idx}`}
                                            {...componentProps}
                                            menuItem
                                        />
                                    );
                                })}
                        </Dropdown.Menu>
                    </Dropdown>
                </div>
            </div>
            {settingsItems?.length ? <Dropdown
                id="ms-toc-toolbar-settings"
                pullRight
            >
                <Dropdown.Toggle noCaret>
                    <Glyphicon glyph="cog"/>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    {settingsItems
                        .map(({ Component, name }, idx) => {
                            return (
                                <Component
                                    key={name ?? `item-${idx}`}
                                    {...componentProps}
                                    menuItem
                                />
                            );
                        })}
                </Dropdown.Menu>
            </Dropdown> : null}
        </div>
    );
}

export default Toolbar;
