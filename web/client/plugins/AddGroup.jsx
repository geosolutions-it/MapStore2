/*
* Copyright 2019, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import get from 'lodash/get';
import Portal from '../components/misc/Portal';
import ResizableModal from '../components/misc/ResizableModal';
import Message from '../components/I18N/Message';
import { FormControl, FormGroup } from 'react-bootstrap';
import { setControlProperties } from '../actions/controls';
import { addGroup } from '../actions/layers';
import { createPlugin } from '../utils/PluginsUtils';
import FlexBox from '../components/layout/FlexBox';
import Button from '../components/layout/Button';

function AddGroup({
    enabled,
    parent,
    onClose,
    onAdd
}) {

    const [groupName, setGroupName] = useState('');

    useEffect(() => {
        setGroupName('');
    }, [enabled]);

    const isValid = (name) => {
        return name !== '';
    };

    const changeName = (el) => {
        setGroupName(el.target.value);
    };

    return (
        <Portal>
            <ResizableModal
                enableFooter={false}
                size="xs"
                clickOutEnabled={false}
                showClose={false}
                title={<Message msgId="toc.addGroup" />}
                show={enabled}
                fitContent>
                <div id="mapstore-add-toc-group">
                    <FormGroup>
                        <label htmlFor="groupName"><Message msgId="addgroup.groupName"/></label>
                        <FormControl name="groupName" onChange={changeName} value={groupName}/>
                    </FormGroup>
                </div>
                <FlexBox style={{padding: 8}} centerChildrenVertically  gap="sm">
                    <FlexBox.Fill/>
                    <Button
                        onClick={onClose}><Message msgId="cancel"/>
                    </Button>
                    <Button
                        disabled= {!isValid(groupName)}
                        variant="success"
                        onClick={() => {
                            onAdd(groupName, parent);
                            onClose();
                        }}>
                        <Message msgId="addgroup.addbtn" />
                    </Button>
                </FlexBox>
            </ResizableModal>
        </Portal>
    );
}

AddGroup.propTypes = {
    enabled: PropTypes.bool,
    parent: PropTypes.string,
    onClose: PropTypes.func,
    onAdd: PropTypes.func
};

AddGroup.defaultProps = {
    enabled: false,
    parent: null,
    onClose: () => {},
    onAdd: () => {}
};

const selector = (state) => ({
    enabled: get(state, "controls.addgroup.enabled", false),
    parent: get(state, "controls.addgroup.parent", null)
});

const AddGroupPlugin = connect(selector, {
    onClose: setControlProperties.bind(null, "addgroup", "enabled", false, "parent", null),
    onAdd: addGroup
})(AddGroup);

const AddGroupButton = connect(selector, {
    onClick: setControlProperties.bind(null, 'addgroup', 'enabled', true, 'parent')
})(({
    onClick,
    status,
    itemComponent,
    selectedNodes,
    statusTypes,
    rootGroupId,
    defaultGroupId,
    nodeTypes,
    config,
    ...props
}) => {

    const ItemComponent = itemComponent;

    // deprecated TOC configuration
    if (config.activateAddGroupButton === false) {
        return null;
    }

    if ([statusTypes.DESELECT, statusTypes.GROUP].includes(status)) {
        const parseParent = (value) => {
            return value === rootGroupId ? undefined : value;
        };
        const node = selectedNodes?.[0];
        const group = node?.type === nodeTypes.GROUP
            ? node?.id
            : node?.parentId;
        const parsedGroup = parseParent(group);
        const value = parsedGroup
            ? parsedGroup
            : config.singleDefaultGroup
                ? defaultGroupId
                : undefined;
        return (
            <ItemComponent
                {...props}
                glyph="add-folder"
                labelId={node?.type === nodeTypes.GROUP ? 'toc.addSubGroup' : 'toc.addGroup'}
                tooltipId={node?.type === nodeTypes.GROUP ? 'toc.addSubGroup' : 'toc.addGroup'}
                onClick={() => onClick(value)}
            />
        );
    }
    return null;
});

/**
 * Adds to the {@link #plugins.TOC|TOC} plugin a button for creating new layer groups.
 * @name AddGroup
 * @class
 * @memberof plugins
 * @requires plugins.TOC
 */
export default createPlugin('AddGroup', {
    component: AddGroupPlugin,
    containers: {
        TOC: [{
            name: "AddGroup",
            target: 'toolbar',
            Component: AddGroupButton,
            position: 3
        }, {
            name: "AddGroup",
            target: 'context-menu',
            Component: AddGroupButton,
            position: 3
        }]
    }
});
