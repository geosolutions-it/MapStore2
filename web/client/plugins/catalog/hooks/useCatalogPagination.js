/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { useMemo } from 'react';

export const useCatalogPagination = (result, pageSize = 12, startPosition = 1) => {
    const start = useMemo(() => {
        return startPosition || result?.start || 1;
    }, [startPosition, result]);

    const currentPage = useMemo(() => {
        return Math.floor((start - 1) / pageSize) + 1;
    }, [start, pageSize]);

    const total = useMemo(() => {
        return result?.numberOfRecordsMatched || result?.numberOfRecordsReturned || 0;
    }, [result]);

    const totalPages = useMemo(() => {
        return Math.ceil(total / pageSize);
    }, [total, pageSize]);

    return {
        currentPage,
        totalPages,
        total,
        startIndex: start
    };
};
