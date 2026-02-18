/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import FlexBox from '../../../components/layout/FlexBox';

const CatalogPagination = ({
    totalPages,
    currentPage,
    onPageChange,
    PaginationComponent=() => <></>
}) => {
    return (
        <FlexBox 
            style={{ zIndex: 1000 }} 
            classNames={['ms-main-colors', '_padding-tb-sm', 'ms-main-bg']} 
            centerChildren
        >
            <PaginationComponent 
                items={totalPages} 
                activePage={currentPage} 
                onSelect={onPageChange} 
            />
        </FlexBox>
    );
};

export default CatalogPagination;
