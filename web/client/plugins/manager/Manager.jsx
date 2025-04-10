/*
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';

import PropTypes from 'prop-types';
import { itemSelected } from '../../actions/manager';
import { Tabs, Tab } from 'react-bootstrap';
import { connect } from 'react-redux';
import { Message } from '../../components/I18N/I18N';
import usePluginItems from '../../hooks/usePluginItems';

function Manager({ items, selectedTool, onItemSelected }, context) {
    const { loadedPlugins } = context;
    const configuredItems = usePluginItems({ items, loadedPlugins }, []);

    return (
        <Tabs
            activeKey={selectedTool}
            onSelect={(name) => {
                onItemSelected(name);
                context.router.history.push("/manager/" + name);
            }}
            style={{
                maxWidth: 1440,
                position: 'relative',
                margin: '1rem auto'
            }}
        >
            {configuredItems.map(({ name, Component }) =>
                (<Tab
                    eventKey={name}
                    key={name}
                    title={<Message msgId={`manager.${name}Tab`} />}
                >
                    <Component active={name === selectedTool} />
                </Tab>))}
        </Tabs>
    );
}

Manager.contextTypes = {
    router: PropTypes.object,
    loadedPlugins: PropTypes.object
};

/**
 * Base container for Manager plugins like {@link #plugins.UserManager|UserManager} or
 * {@link #plugins.GroupManager|GroupManager}
 * usually rendered in {@link #pages.Manager|Manager Page}.
 * @name Manager
 * @class
 * @memberof plugins
 */
export default {
    ManagerPlugin: connect((state, ownProps) => ({
        selectedTool: ownProps.tool
    }),
    {
        onItemSelected: itemSelected
    }, (stateProps, dispatchProps, ownProps)=>{
        return {
            ...stateProps,
            ...dispatchProps,
            ...ownProps
        };
    })(Manager)
};
