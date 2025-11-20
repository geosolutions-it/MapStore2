/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import { Button } from 'react-bootstrap';
import Message from '../../I18N/Message';
import InputControl from '../../../plugins/ResourcesCatalog/components/InputControl';

/**
 * New IP button component for toolbar
 */
export function NewIP({ onNewIP }) {
    return (
        <Button onClick={onNewIP} bsSize="sm" bsStyle="success">
            <Message msgId="ipManager.newIP" />
        </Button>
    );
}

/**
 * Edit IP button component for card actions
 */
export function EditIP({ component, onEdit, resource: ip }) {
    const Component = component;
    return (
        <Component
            onClick={() => onEdit(ip)}
            glyph="wrench"
            labelId="ipManager.editTooltip"
            square
        />
    );
}

/**
 * Delete IP button component for card actions
 */
export function DeleteIP({ component, onDelete, resource: ip }) {
    const Component = component;
    return (
        <Component
            onClick={() => onDelete(ip)}
            glyph="trash"
            labelId="ipManager.deleteTooltip"
            square
            bsStyle="danger"
        />
    );
}

/**
 * IP Filter search component for toolbar
 */
export function IPFilter({ onSearch, query }) {
    const handleFieldChange = (params) => {
        onSearch({ params: { q: params } });
    };
    return (
        <InputControl
            placeholder="ipManager.search"
            style={{ maxWidth: 200 }}
            value={query.q || ''}
            debounceTime={300}
            onChange={handleFieldChange}
        />
    );
}

