/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import Permissions from '../components/Permissions';
import GeoStoreDAO from '../../../api/GeoStoreDAO';
import { userSelector } from '../../../selectors/security';
import FlexBox from '../components/FlexBox';
import Text from '../components/Text';
import Icon from '../components/Icon';
import Message from '../../../components/I18N/Message';
import useIsMounted from '../hooks/useIsMounted';
import Spinner from '../components/Spinner';

function ResourcePermissions({
    editing,
    user,
    resource,
    onChange
}) {

    const [availableGroups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const init = useRef(false);
    const isMounted = useIsMounted();

    useEffect(() => {
        GeoStoreDAO.getAvailableGroups(user)
            .then((response) => isMounted(() => {
                setGroups(response);
            }));
    }, [user]);

    useEffect(() => {
        if (resource?.permissions === undefined && !init.current) {
            init.current = true;
            setLoading(true);
            GeoStoreDAO.getResourcePermissions(resource.id, {}, true)
                .then((permissions) => isMounted(() => {
                    onChange({
                        permissions
                    });
                }))
                .finally(() => isMounted(() => {
                    setLoading(false);
                }));
        }
    }, [resource?.permissions]);

    const permissionEntries = resource?.permissions?.map((entry) => {
        if (entry?.group) {
            return {
                type: 'group',
                id: entry?.group?.id,
                name: entry?.group?.groupName,
                permissions: entry?.canWrite ? 'edit' : 'view'
            };
        }
        return {
            type: 'user',
            id: entry?.user?.id,
            name: entry?.user?.name,
            permissions: 'owner'
        };
    });

    const groupsPermissions = resource?.permissions?.some(entry => !!entry.group);

    if (!editing && !groupsPermissions) {
        return (
            <FlexBox classNames={["ms-details-message", '_padding-tb-lg']} centerChildren>
                <div>
                    <Text fontSize="xxl" textAlign="center">
                        {loading ? <Spinner /> : <Icon glyph="lock" /> }
                    </Text>
                    <Text fontSize="lg" textAlign="center">
                        <Message msgId="resourcesCatalog.noPermissionsAvailable" />
                    </Text>
                </div>
            </FlexBox>
        );
    }

    return (
        <Permissions
            editing={editing}
            compactPermissions={{
                entries: permissionEntries
            }}
            onChange={({ entries }) => {
                const userPermissions = (resource?.permissions || []).filter((entry) => !entry.group);
                onChange({
                    'permissions': [
                        ...entries.filter((entry) => entry.type === 'group').map((entry) => {
                            return {
                                canRead: ['view', 'edit'].includes(entry.permissions),
                                canWrite: ['edit'].includes(entry.permissions),
                                group: {
                                    id: entry.id,
                                    groupName: entry.name
                                }
                            };
                        }),
                        ...userPermissions
                    ]
                });
            }}
            permissionOptions={{
                'default': [
                    {
                        value: 'view',
                        labelId: 'resourcesCatalog.viewPermission'
                    },
                    {
                        value: 'edit',
                        labelId: 'resourcesCatalog.editPermission'
                    }
                ]
            }}
            entriesTabs={[
                {
                    id: 'group',
                    labelId: 'resourcesCatalog.groups',
                    request: ({ q }) => {
                        return Promise.resolve(availableGroups.filter(group => (group?.groupName || '').toLowerCase().includes(q.toLowerCase())));
                    },
                    responseToEntries: ({ response, entries }) => {
                        return response.map((group) => {
                            const permissions = (entries || []).find(entry => entry.id === group.id)?.permissions;
                            return {
                                type: 'group',
                                id: group.id,
                                name: group.groupName,
                                permissions,
                                parsed: true
                            };
                        });
                    }
                }
            ]}
        />
    );
}

const ConnectedResourcePermissions = connect(
    createStructuredSelector({
        user: userSelector
    })
)(ResourcePermissions);

export default ConnectedResourcePermissions;
