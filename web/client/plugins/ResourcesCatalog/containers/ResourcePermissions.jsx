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
import castArray from 'lodash/castArray';
import { Glyphicon } from 'react-bootstrap';

import Permissions from '../components/Permissions';
import GeoStoreDAO from '../../../api/GeoStoreDAO';
import { userSelector } from '../../../selectors/security';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Message from '../../../components/I18N/Message';
import useIsMounted from '../../../hooks/useIsMounted';
import Spinner from '../../../components/layout/Spinner';
import useIPRanges from '../hooks/useIPRanges';

function ResourcePermissions({
    editing,
    resource,
    onChange
}) {

    const [loading, setLoading] = useState(false);
    const init = useRef(false);
    const isMounted = useIsMounted();

    const { request: ipRequest } = useIPRanges();

    useEffect(() => {
        if (resource?.permissions === undefined && !init.current) {
            init.current = true;
            setLoading(true);
            GeoStoreDAO.getResourcePermissions(resource.id, {}, true)
                .then((permissions) => isMounted(() => {
                    onChange({
                        permissions
                    }, true);
                }))
                .finally(() => isMounted(() => {
                    // include a delay to visualize the spinner
                    setTimeout(() => setLoading(false), 500);
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
        if (entry?.ipRanges && entry.ipRanges !== '') {
            const ipRange = entry.ipRanges.ipRange;
            return {
                type: 'ip',
                id: ipRange.id,
                name: ipRange.cidr,
                description: ipRange.description || '',
                permissions: entry?.canWrite ? 'edit' : 'view'
            };
        }
        return {
            type: 'user',
            id: entry?.user?.id,
            name: entry?.user?.name,
            permissions: 'owner',
            originalEntry: entry
        };
    });

    const groupsOrIpPermissions = resource?.permissions?.some(entry => !!entry.group || !!entry.ipRanges);

    if (!editing && !groupsOrIpPermissions) {
        return (
            <FlexBox classNames={["ms-details-message", '_padding-tb-lg']} centerChildren>
                <div>
                    <Text fontSize="xxl" textAlign="center">
                        {loading ? <Spinner /> : <Glyphicon glyph="lock" /> }
                    </Text>
                    <Text fontSize="lg" textAlign="center">
                        <Message msgId="resourcesCatalog.noPermissionsAvailable" />
                    </Text>
                </div>
            </FlexBox>
        );
    }

    if (loading) {
        return (
            <FlexBox classNames={["ms-details-message", '_padding-tb-lg']} centerChildren>
                <div>
                    <Text fontSize="xxl" textAlign="center">
                        <Spinner />
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
                const userPermissions = (entries || []).filter((entry) => entry.type === 'user').map(entry => entry.originalEntry);

                const ipPermissions = entries.filter((entry) => entry.type === 'ip').map((entry) => ({
                    canRead: ['view', 'edit'].includes(entry.permissions),
                    canWrite: ['edit'].includes(entry.permissions),
                    ipRanges: {
                        ipRange: {
                            id: entry.id,
                            cidr: entry.name,
                            description: entry.description
                        }
                    }
                }));

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
                        ...ipPermissions,
                        ...userPermissions
                    ]
                });
            }}
            permissionOptions={{
                'entry.name.everyone': [
                    {
                        value: 'view',
                        labelId: 'resourcesCatalog.viewPermission'
                    }
                ],
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
                    request: ({ q, page: pageParam, pageSize }) => {
                        const page = pageParam - 1;
                        return GeoStoreDAO.getGroups(q ? `*${q}*` : '*', {
                            params: {
                                start: parseFloat(page) * pageSize,
                                limit: pageSize,
                                all: true
                            }
                        })
                            .then((response) => {
                                const groups = castArray(response?.ExtGroupList?.Group).map((item) => {
                                    return {
                                        ...item,
                                        filterValue: item.groupName,
                                        value: item.groupName,
                                        label: `${item.groupName}`
                                    };
                                });
                                const totalCount = response?.ExtGroupList?.GroupCount;
                                return {
                                    groups,
                                    isNextPageAvailable: (page + 1) < (totalCount / pageSize)
                                };
                            });
                    },
                    responseToEntries: ({ response, entries }) => {
                        return response.groups.map((group) => {
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
                },
                {
                    id: 'ip',
                    labelId: 'resourcesCatalog.ip',
                    request: ipRequest,
                    responseToEntries: ({ response, entries }) => {
                        return response.ips.map((ip) => {
                            const permissions = (entries || []).find(entry => entry.id === ip.id)?.permissions;
                            return {
                                type: 'ip',
                                id: ip.id,
                                name: ip.cidr,
                                description: ip.description,
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
