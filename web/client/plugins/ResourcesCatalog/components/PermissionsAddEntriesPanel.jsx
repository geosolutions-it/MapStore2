/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Message from '../../../components/I18N/Message';
import Button from '../../../components/layout/Button';
import Icon from './Icon';
import useInfiniteScroll from '../hooks/useInfiniteScroll';
import PermissionsRow from './PermissionsRow';
import Spinner from '../../../components/layout/Spinner';
import InputControl from './InputControl';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';

function PermissionsAddEntriesPanel({
    request,
    responseToEntries,
    onAdd,
    onRemove,
    defaultPermission,
    pageSize,
    placeholderId
}) {

    const scrollContainer = useRef();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [isNextPageAvailable, setIsNextPageAvailable] = useState(false);
    const [q, setQ] = useState('');
    const isMounted = useRef();

    useInfiniteScroll({
        scrollContainer: scrollContainer.current,
        shouldScroll: () => !loading && isNextPageAvailable,
        onLoad: () => {
            setPage(page + 1);
        }
    });

    const updateRequest = useRef();
    updateRequest.current = (options) => {
        if (!loading && request) {
            setLoading(true);
            request({
                q,
                page: options.page,
                pageSize
            })
                .then((response) => {
                    if (isMounted.current) {
                        const newEntries = responseToEntries(response);
                        setIsNextPageAvailable(response.isNextPageAvailable);
                        setEntries(options.page === 1 ? newEntries : [...entries, ...newEntries]);
                        setLoading(false);
                    }
                })
                .catch(() => {
                    if (isMounted.current) {
                        setLoading(false);
                    }
                });
        }
    };

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (page > 1) {
            updateRequest.current({ page });
        }
    }, [page]);

    useEffect(() => {
        setPage(1);
        updateRequest.current({ page: 1 });
    }, [q]);

    function updateEntries(newEntry) {
        setEntries(entries.map(entry => entry.id === newEntry.id ? newEntry : entry));
    }
    function handleAdd(entry) {
        const newEntry = {
            ...entry,
            permissions: defaultPermission
        };
        onAdd(newEntry);
        updateEntries(newEntry);
    }
    function handleRemove(entry) {
        const { permissions, ...newEntry } = entry;
        onRemove(newEntry);
        updateEntries(newEntry);
    }

    return (
        <FlexBox.Fill
            flexBox
            column
            classNames={['ms-permissions-add-entries-panel', '_absolute', '_fill']}
        >
            <FlexBox centerChildrenVertically gap="sm" classNames={['_padding-sm']}>
                <InputControl
                    placeholder={placeholderId}
                    value={q}
                    debounceTime={300}
                    onChange={(value) => setQ(value)}
                />
                {(q && !loading) && <Button onClick={() => setQ('')}>
                    <Icon glyph="times"/>
                </Button>}
                {loading && <Spinner />}
            </FlexBox>
            <FlexBox.Fill
                flexBox
                component="ul"
                column
                gap="xs"
                classNames={['_padding-sm', '_relative', '_overflow-auto']}
                ref={scrollContainer}>
                {entries.map((entry, idx) => {
                    return (
                        <li
                            key={entry.id + '-' + idx}
                        >
                            <PermissionsRow
                                {...entry}
                                hideOptions
                            >
                                {entry.permissions
                                    ? <Button
                                        onClick={() => handleRemove(entry)}
                                    >
                                        <Icon glyph="trash" />
                                    </Button>
                                    : <Button
                                        onClick={() => handleAdd(entry)}
                                    >
                                        <Icon glyph="plus" />
                                    </Button>
                                }
                            </PermissionsRow>
                        </li>
                    );
                })}
                {(entries.length === 0 && !loading) &&
                    <Text textAlign="center">
                        <Message msgId="resourcesCatalog.permissionsEntriesNoResults" />
                    </Text>
                }
            </FlexBox.Fill>
        </FlexBox.Fill>
    );
}

PermissionsAddEntriesPanel.propTypes = {
    request: PropTypes.func,
    responseToEntries: PropTypes.func,
    onAdd: PropTypes.func,
    onRemove: PropTypes.func,
    defaultPermission: PropTypes.string,
    pageSize: PropTypes.number,
    placeholderId: PropTypes.string
};

PermissionsAddEntriesPanel.defaultProps = {
    defaultPermission: 'view',
    pageSize: 20,
    onAdd: () => {},
    onRemove: () => {},
    responseToEntries: res => res.resources,
    placeholderId: 'resourcesCatalog.filterBy'
};

export default PermissionsAddEntriesPanel;
