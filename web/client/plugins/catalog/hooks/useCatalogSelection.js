/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';


export const useCatalogSelection = (records = [], selectedService = null) => {
    const [selectedLayers, setSelectedLayers] = useState([]);
    const previousServiceRef = useRef(selectedService);

    useEffect(() => {
        if (selectedService && previousServiceRef.current && previousServiceRef.current !== selectedService) {
            setSelectedLayers([]);
        }
        previousServiceRef.current = selectedService;
    }, [selectedService]);

    const isAllSelected = useMemo(() => {
        return records?.length > 0 && records.every(r =>
            selectedLayers.some(layer => layer.identifier === r.identifier)
        );
    }, [records, selectedLayers]);

    const isIndeterminate = useMemo(() => {
        return selectedLayers.length > 0 && !isAllSelected;
    }, [selectedLayers.length, isAllSelected]);

    const handleToggleLayer = useCallback((record, checked) => {
        setSelectedLayers(prev => {
            if (checked) {
                return [...prev, record];
            }
            return prev.filter(layer => layer.identifier !== record.identifier);
        });
    }, []);

    const handleSelectAll = useCallback((checked) => {
        if (checked) {
            const currentPageIds = new Set(records.map(r => r.identifier));
            setSelectedLayers(prev => {
                const newSelection = prev.filter(layer => !currentPageIds.has(layer.identifier));
                return [...newSelection, ...records];
            });
        } else {
            const currentPageIds = new Set(records.map(r => r.identifier));
            setSelectedLayers(prev => prev.filter(layer => !currentPageIds.has(layer.identifier)));
        }
    }, [records]);

    const clearSelection = useCallback(() => {
        setSelectedLayers([]);
    }, []);

    return {
        selectedLayers,
        isAllSelected,
        isIndeterminate,
        handleToggleLayer,
        handleSelectAll,
        clearSelection
    };
};
