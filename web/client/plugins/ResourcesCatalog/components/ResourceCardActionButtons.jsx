/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import Icon from './Icon';
import { Dropdown, MenuItem } from 'react-bootstrap';
import Message from '../../../components/I18N/Message';

const ActionMenuItem = ({
    glyph,
    iconType,
    children,
    labelId,
    ...props
}) => {
    return (
        <MenuItem {...props}>
            {glyph ? <><Icon type={iconType} glyph={glyph}/>{' '}</> : null}
            {labelId ? <Message msgId={labelId} /> : null}
        </MenuItem>
    );
};

function ResourceCardActionButtons({
    options,
    viewerUrl,
    resource,
    className,
    getResourceId = () => '',
    ...props
}) {

    const containerNode = useRef();
    const dropdownClassName = 'ms-card-dropdown';
    const dropdownNode = containerNode?.current?.querySelector(`.${dropdownClassName}`);
    const isDropdownEmpty = (dropdownNode?.children?.length || 0) === 0;

    return (
        <div
            {...props}
            ref={containerNode}
            className={`ms-resource-card-action-buttons${className ? ` ${className}` : ''}`}
            onClick={event => event.stopPropagation()}
            style={isDropdownEmpty ? { display: 'none' } : {}}
        >
            <Dropdown
                pullRight
                id={`ms-resource-card-action-buttons-${getResourceId(resource)}`}
            >
                <Dropdown.Toggle
                    variant="default"
                    size="xs"
                    noCaret
                    className="_border-transparent"
                >
                    <Icon glyph="ellipsis-v" />
                </Dropdown.Toggle>
                <Dropdown.Menu className={dropdownClassName}>
                    {options.map((option) => {
                        if (option.Component) {
                            const { Component } = option;
                            return <Component key={option.name} resource={resource} viewerUrl={viewerUrl} renderType="menuItem" component={ActionMenuItem}/>;
                        }
                        return null;
                    })}
                </Dropdown.Menu>
            </Dropdown>
        </div>
    );
}

ResourceCardActionButtons.propTypes = {
    options: PropTypes.array,
    resource: PropTypes.object
};

ResourceCardActionButtons.defaultProps = {
    options: [],
    resource: {}
};

export default ResourceCardActionButtons;
