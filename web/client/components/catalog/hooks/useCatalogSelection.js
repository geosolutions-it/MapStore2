/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';


export const useCatalogSelection = (records = [], selectedService = null) => {
    const [selected, setSelected] = useState([]);
    const previousServiceRef = useRef(selectedService);

    const onRecordSelected = useCallback((record, checked) => {
        setSelected(prev => {
            if (checked) {
                return [...prev, record];
            }
            return prev.filter(layer => layer.identifier !== record.identifier);
        });
    }, []);

    useEffect(() => {
        if (selectedService && previousServiceRef.current && previousServiceRef.current !== selectedService) {
            setSelected([]);
        }
        previousServiceRef.current = selectedService;
    }, [selectedService]);

    const isAllSelected = useMemo(() => {
        return records?.length > 0 && records.every(r =>
            selected.some(layer => layer.identifier === r.identifier)
        );
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
