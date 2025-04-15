/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect, useRef } from 'react';
import Message from '../../../components/I18N/Message';
import { FormControl as FormControlRB, Nav, NavItem } from 'react-bootstrap';
import Popover from '../../../components/styleeditor/Popover';
import Button from '../../../components/layout/Button';
import PermissionsAddEntriesPanel from './PermissionsAddEntriesPanel';
import PermissionsRow from './PermissionsRow';
import Icon from './Icon';
import localizedProps from '../../../components/misc/enhancers/localizedProps';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Spinner from '../../../components/layout/Spinner';
import ALink from './ALink';

const FormControl = localizedProps('placeholder')(FormControlRB);

function Permissions({
    editing,
    compactPermissions = {},
    onChange = () => {},
    entriesTabs = [],
    loading,
    permissionOptions,
    permissionsToLists = (value) => value,
    listsToPermissions = (value) => value,
    showGroupsPermissions = true
}) {

    const { entries = [], groups = [] } = permissionsToLists(compactPermissions);
    const [activeTab, setActiveTab] = useState(entriesTabs?.[0]?.id || '');
    const [permissionsEntires, setPermissionsEntires] = useState(entries);
    const [permissionsGroups, setPermissionsGroups] = useState(groups);

    const [order, setOrder] = useState([]);
    const [filter, setFilter] = useState('');

    function handleChange(newValues) {
        onChange(listsToPermissions({
            entries: permissionsEntires,
            groups: permissionsGroups,
            ...newValues
        }));
    }

    function handleUpdateGroup(groupId, properties) {
        const newGroups = permissionsGroups.map(group => {
            if (group.id === groupId) {
                return {
                    ...group,
                    ...properties
                };
            }
            return group;
        });
        setPermissionsGroups(newGroups);
        handleChange({ groups: newGroups });
    }

    function handleAddNewEntry(newEntry) {
        const newEntries = [
            ...permissionsEntires,
            {
                ...newEntry,
                permissions: 'view'
            }
        ];
        setPermissionsEntires(newEntries);
        handleChange({ entries: newEntries });
    }

    function handleRemoveEntry(newEntry) {
        const newEntries = permissionsEntires.filter(entry => entry.id !== newEntry.id);
        setPermissionsEntires(newEntries);
        handleChange({ entries: newEntries });
    }

    function handleUpdateEntry(entryId, properties, noCallback) {
        const newEntries = permissionsEntires.map(entry => {
            if (entry.id === entryId) {
                return {
                    ...entry,
                    ...properties
                };
            }
            return entry;
        });
        setPermissionsEntires(newEntries);
        if (!noCallback) {
            handleChange({ entries: newEntries });
        }
    }

    function sortEntries(key) {
        const direction = !order[1];
        setOrder([key, direction]);
        function sortByKey(a, b) {
            const aProperty = (a[key] || '').toLowerCase();
            const bProperty = (b[key] || '').toLowerCase();
            return direction
                ? (aProperty > bProperty ? 1 : -1)
                : (aProperty > bProperty ? -1 : 1);
        }
        setPermissionsEntires(
            [...permissionsEntires]
                .sort(sortByKey)
        );
        setPermissionsGroups(
            [...permissionsGroups]
                .sort(sortByKey)
        );
    }

    useEffect(() => {
        sortEntries(order[1] || 'name');
    }, []);

    const filteredEntries = permissionsEntires
        .filter((entry) => !filter
            || (entry?.name?.toLowerCase()?.includes(filter?.toLowerCase())
            || entry?.permissions?.toLowerCase()?.includes(filter?.toLowerCase())));

    const isMounted = useRef();
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const hasFiltrablePermissions = !!permissionsEntires.filter((item) => item.permissions !== 'owner' && !item.is_superuser)?.length;

    return (
        <div className="ms-permissions _relative _padding-tb-sm">
            {showGroupsPermissions ? <div className="ms-secondary-colors _padding-lr-sm">
                <FlexBox component="ul" column gap="sm" classNames={['_padding-tb-sm']} >
                    {permissionsEntires
                        .filter((item) => item.permissions === 'owner' && !item.is_superuser)
                        .map((item, idx) => {
                            return (
                                <li key={`owner-${idx}`}>
                                    <FlexBox centerChildrenVertically gap="sm" >
                                        <FlexBox.Fill>
                                            <Text><Message msgId="resourcesCatalog.ownerPermission" />:</Text>
                                        </FlexBox.Fill>
                                        <div className="ms-permissions-column">
                                            <FlexBox classNames={['ms-tag', 'ms-main-colors', '_padding-lr-sm']} inline gap="xs" centerChildrenVertically>
                                                <Text>
                                                    {item.avatar
                                                        ? <img src={item.avatar}/>
                                                        : <Icon glyph={item.type} />}
                                                </Text>
                                                <ALink
                                                    href={item.link}>
                                                    {item.name}
                                                </ALink>
                                            </FlexBox>
                                        </div>
                                    </FlexBox>
                                </li>);
                        })}
                    {permissionsGroups
                        .map((group, idx) => {
                            return (
                                <li key={`groups-${idx}`}>
                                    <PermissionsRow
                                        key={group.id}
                                        {...group}
                                        hideIcon
                                        onChange={editing ? handleUpdateGroup.bind(null, group.id) : null}
                                        name={<strong>{<Message msgId={`resourcesCatalog.${group.name}`} />}</strong>}
                                        options={permissionOptions?.[group.name] || permissionOptions?.default}
                                    />
                                </li>
                            );
                        })}
                </FlexBox>
            </div> : null}
            <div className="_padding-tb-sm">
                <FlexBox gap="sm">
                    {!hasFiltrablePermissions && !editing ? null : <FlexBox.Fill flexBox gap="sm">
                        <FormControl
                            disabled={!hasFiltrablePermissions}
                            placeholder="resourcesCatalog.filterByNameOrPermissions"
                            value={filter}
                            onChange={event => setFilter(event.target.value)}
                        />
                        {filter && <Button onClick={() => setFilter('')}>
                            <Icon glyph="times"/>
                        </Button>}
                    </FlexBox.Fill>}
                    {editing ? <Popover
                        placement="bottom"
                        content={
                            <FlexBox classNames={['shadow-md', 'ms-main-colors', '_relative']} column style={{ width: 300, height: 300 }}>
                                <Nav bsStyle="tabs" activeKey={activeTab}>
                                    {entriesTabs.map((tab) => {
                                        return (
                                            <NavItem
                                                key={tab.id}
                                                eventKey={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                            >
                                                <Message msgId={tab.labelId} />
                                            </NavItem>
                                        );
                                    })}
                                </Nav>
                                <FlexBox.Fill classNames={['_fill', '_relative']}>
                                    {entriesTabs
                                        .filter(tab => tab.id === activeTab)
                                        .map(tab => {
                                            return (
                                                <PermissionsAddEntriesPanel
                                                    key={tab.id}
                                                    request={(params) => tab.request({
                                                        ...params,
                                                        entries: permissionsEntires,
                                                        groups: permissionsGroups
                                                    })}
                                                    onAdd={handleAddNewEntry}
                                                    onRemove={handleRemoveEntry}
                                                    responseToEntries={(response) =>
                                                        tab.responseToEntries({ response, entries: permissionsEntires })
                                                    }
                                                />
                                            );
                                        })}
                                </FlexBox.Fill>
                            </FlexBox>
                        }>
                        <Button variant={'primary'} size="sm">
                            <Icon glyph="plus" />{' '}<Message msgId="resourcesCatalog.addPermissionsEntry"/>
                        </Button>
                    </Popover> : null}
                </FlexBox>
                {hasFiltrablePermissions ? <FlexBox centerChildrenVertically gap="sm" classNames={['_row', '_padding-tb-sm']}>
                    <FlexBox.Fill>
                        <Button borderTransparent onClick={sortEntries.bind(null, 'name')}>
                            <Message msgId="resourcesCatalog.permissionsName"/>
                            {order[0] === 'name' && <>{' '}<Icon glyph={order[1] ? 'chevron-up' : 'chevron-down'} /></>}
                        </Button>
                    </FlexBox.Fill>
                    <div className="ms-permissions-column">
                        <Button borderTransparent onClick={sortEntries.bind(null, 'permissions')}>
                            <Message msgId="resourcesCatalog.permissions"/>
                            {order[0] === 'permissions' && <>{' '}<Icon glyph={order[1] ? 'chevron-up' : 'chevron-down'} /></>}
                        </Button>
                    </div>
                </FlexBox> : null}
            </div>
            <FlexBox component="ul" column gap="sm" classNames={['_padding-tb-sm']}>
                {filteredEntries
                    .filter((item) => item.permissions !== 'owner' && !item.is_superuser)
                    .map((entry, idx) => {
                        return (
                            <li
                                key={entry.id + '-' + idx}>
                                <PermissionsRow
                                    {...entry}
                                    onChange={editing ? handleUpdateEntry.bind(null, entry.id) : null}
                                    options={permissionOptions?.default}
                                >
                                    {entry.permissions !== 'owner' && editing ?
                                        <>
                                            <Button onClick={handleRemoveEntry.bind(null, entry)}>
                                                <Icon glyph="trash" />
                                            </Button>
                                        </>
                                        : null}
                                </PermissionsRow>
                            </li>
                        );
                    })}
            </FlexBox>
            {(filteredEntries.length === 0 && filter) ?
                <Text textAlign="center">
                    <Message msgId="resourcesCatalog.permissionsEntriesNoResults" />
                </Text>
                : null}
            {loading ? (
                <FlexBox centerChildren classNames={['_overlay', '_absolute', '_fill', '_corner-tl']}>
                    <Text fontSize="xxl">
                        <Spinner />
                    </Text>
                </FlexBox>
            ) : null}
        </div>
    );
}

export default Permissions;
