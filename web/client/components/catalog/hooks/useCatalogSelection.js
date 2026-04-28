/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';


export const useCatalogSelection = (records = [], selectionConfig = {}) => {
    const {
        selectedService = null,
        services = {},
        active = true
    } = typeof selectionConfig === 'string'
        ? { selectedService: selectionConfig }
        : (selectionConfig || {});

    const [selected, setSelected] = useState([]);
    const previousServiceRef = useRef(selectedService);
    const selectedServiceConfig = selectedService ? services?.[selectedService] : null;
    const hasServiceConfigs = Object.keys(services || {}).length > 0;

    const onRecordSelected = useCallback((record, checked) => {
        setSelected(prev => {
            if (checked) {
                return [...prev, record];
            }
            return prev.filter(layer => layer.identifier !== record.identifier);
        });
    }, []);

    useEffect(() => {
        const isServiceSwitched = previousServiceRef.current !== selectedService;
        const isSelectedServiceMissing = hasServiceConfigs && !!selectedService && !selectedServiceConfig;
        const isCatalogClosed = active === false;
        const isSelectionContextInvalid = !selectedService;

        if (
            isCatalogClosed
            || isSelectionContextInvalid
            || isServiceSwitched
            || isSelectedServiceMissing
        ) {
            setSelected([]);
        }

        previousServiceRef.current = selectedService;
    }, [active, selectedService, selectedServiceConfig, hasServiceConfigs]);

    const isAllSelected = useMemo(() => {
        if (!records?.length) return false;
        const selectedIds = new Set(selected.map(layer => layer.identifier));
        return records.every(r => selectedIds.has(r.identifier));
    }, [records, selected]);

    const isIndeterminate = useMemo(() => {
        return selected.length > 0 && !isAllSelected;
    }, [selected.length, isAllSelected]);

    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            const currentPageIds = new Set(records.map(r => r.identifier));
            setSelected(prev => {
                const newSelection = prev.filter(layer => !currentPageIds.has(layer.identifier));
                return [...newSelection, ...records];
            });
        } else {
            const currentPageIds = new Set(records.map(r => r.identifier));
            setSelected(prev => prev.filter(layer => !currentPageIds.has(layer.identifier)));
        }
    }, [records]);

    const clearSelection = useCallback(() => {
        setSelected([]);

    }, []);

    return {
        selected,
        isAllSelected,
        isIndeterminate,
        onRecordSelected,
        handleSelectAll,
        clearSelection
    };
};
