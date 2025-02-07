/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useEffect, useState } from 'react';
import { Pagination } from 'react-bootstrap';
import Icon from './Icon';

function PaginationCustom({
    activePage,
    items,
    onSelect
}) {
    const [page, setPage] = useState(activePage);
    function handleSelect(value) {
        setPage(value);
        onSelect(value);
    }
    useEffect(() => {
        if (activePage !== page) {
            setPage(activePage);
        }
    }, [activePage]);
    return (
        <Pagination
            className="custom"
            prev={<Icon glyph="angle-left" />}
            next={<Icon glyph="angle-right" />}
            ellipsis
            boundaryLinks
            items={items}
            maxButtons={3}
            activePage={page}
            onSelect={handleSelect}
        />
    );
}

export default PaginationCustom;
