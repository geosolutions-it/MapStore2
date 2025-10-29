/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Glyphicon } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';

function PermissionsRow({
    type,
    name,
    description,
    options,
    hideOptions,
    hideIcon,
    permissions,
    avatar,
    children,
    clearable,
    onChange
}) {

    const valueOption = options.find(option => option.value === permissions);

    const valueNode = onChange
        ? (
            <Select
                clearable={clearable}
                disabled={options?.length < 2}
                options={options.map(({ value, labelId, label }) => ({ value, label: label ? <span>{label}</span> : <Message msgId={labelId} />}))}
                value={permissions}
                onChange={(option) => onChange({ permissions: option?.value || '' })}
            />
        ) : (<Text>{valueOption?.labelId ? <Message msgId={valueOption?.labelId} /> : null}</Text>);

    return (
        <FlexBox className="ms-permissions-row" centerChildrenVertically gap="sm">
            <FlexBox.Fill flexBox gap="sm" centerChildrenVertically>
                {(!hideIcon && (type || avatar)) && <Text component={FlexBox} centerChildren className="ms-permission-icon">
                    {avatar
                        ? <img src={avatar}/>
                        : <Glyphicon glyph={type === "ip" ? "globe" : type} />}
                </Text>}
                <FlexBox column className="ms-permission-name-container">
                    <Text className="ms-permission-name">{name}</Text>
                    {description && type === 'ip' && (
                        <Text className="ms-permission-description">
                            {description}
                        </Text>
                    )}
                </FlexBox>
            </FlexBox.Fill>
            <FlexBox gap="sm">
                {children}
            </FlexBox>
            {!hideOptions ? <div className="ms-permissions-column">
                {valueNode}
            </div> : null}
        </FlexBox>
    );
}

PermissionsRow.propTypes = {
    options: PropTypes.array,
    clearable: PropTypes.bool,
    onChange: PropTypes.func
};

PermissionsRow.defaultProps = {
    options: [
        {
            value: 'view',
            labelId: 'resourcesCatalog.viewPermission'
        },
        {
            value: 'download',
            labelId: 'resourcesCatalog.downloadPermission'
        },
        {
            value: 'edit',
            labelId: 'resourcesCatalog.editPermission'
        },
        {
            value: 'manage',
            labelId: 'resourcesCatalog.managePermission'
        }
    ],
    clearable: false,
    onChange: () => { }
};

export default PermissionsRow;
