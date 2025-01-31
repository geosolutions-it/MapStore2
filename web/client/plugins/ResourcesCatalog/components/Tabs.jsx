/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import isNil from 'lodash/isNil';
import { Tabs as RTabs, Tab } from 'react-bootstrap';
import useLocalStorage from '../hooks/useLocalStorage';

/**
 * Tabs component
 * @param {array} tabs list of components
 * @param {string} identifier unique key (mandatory when persisting selection i.e `persistSelection: true`)
 * @param {string} selectedTabId contains the selected tab key (controlled)
 * (Note: `selectedTabId` works in tandem with `eventKey` on Tab). Hence it is mandatory to supply `eventKey` on Tab component
 * @param {function} onSelect custom function to select the tab key (controlled)
 * @param {string} className custom class name
 * @param {boolean} persistSelection flag determines the persisting of the tab selection. By default the selection is not persisted
 */
const Tabs = ({
    tabs = [],
    identifier,
    selectedTabId,
    onSelect,
    className,
    persistSelection
}) => {
    const [eventKeys, setEventKeys] = useLocalStorage('tabSelected', {});
    const persist = persistSelection && identifier;
    const [activeKey, setActiveKey] = useState(null);

    useEffect(() => {
        const selectedKey = !isNil(selectedTabId)
            ? selectedTabId
            : persist ? (eventKeys[identifier] ?? 0) : 0;
        setActiveKey(selectedKey);
    }, [selectedTabId, persist, eventKeys, identifier]);

    const onSelectTab = (key) => {
        if (!persist) {
            setActiveKey(key);
        } else {
            const updatedEventKeys = {
                ...eventKeys,
                [identifier]: key
            };
            setEventKeys(updatedEventKeys);
        }
    };
    return (
        <RTabs
            bsStyle="pills"
            className={className}
            animation={false}
            key={identifier}
            activeKey={activeKey}
            onSelect={onSelect ? onSelect : onSelectTab}
        >
            {tabs.map((tab, index)=> {
                const eventKey = !isNil(tab.eventKey) ? tab.eventKey : index;
                const component = activeKey === eventKey ? tab.component : null;
                return (
                    <Tab key={`tab-${index}`} eventKey={eventKey} title={tab.title}>
                        {component}
                    </Tab>);
            })}
        </RTabs>
    );
};

Tabs.propTypes = {
    className: PropTypes.string,
    tabs: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
        component: PropTypes.node,
        eventKey: PropTypes.string
    })),
    identifier: PropTypes.string,
    selectedTabId: PropTypes.string,
    onSelect: PropTypes.func
};

Tabs.defaultProps = {
    tabs: [],
    className: "ms-tabs tabs-underline",
    persistSelection: false
};

export default Tabs;
