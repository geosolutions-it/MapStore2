/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import  isEmpty from 'lodash/isEmpty';
import PropTypes from "prop-types";

import { Message } from "../../../components/I18N/I18N";

import Spinner from "../../../components/layout/Spinner";
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import useIsMounted from "../../../hooks/useIsMounted";


const Title = ({
    loading,
    children
}) => {

    return (
        <Text strong >
            {children}
            {loading  ? <>{' '}<Spinner/></> : null}
        </Text>
    );
};

const FilterGroup = ({
    items: itemsProp,
    loadItems,
    title,
    titleId,
    query,
    content,
    loadingItemsMsgId,
    noItemsMsgId,
    root
}) => {
    const isMounted = useIsMounted();

    const [groupItems, setGroupItems] = useState(itemsProp);
    const [loading, setLoading] = useState(false);

    const shouldRequestItems = loadItems && typeof loadItems === 'function';

    useEffect(() => {
        if (shouldRequestItems) {
            if (!loading) {
                setLoading(true);
                loadItems({ page_size: 999999 })
                    .then((response) =>{
                        isMounted(() => setGroupItems(response.items));
                    })
                    .finally(()=> isMounted(() => setLoading(false)));
            }
        }
    }, [JSON.stringify(query), shouldRequestItems]);

    // avoid to use groupItems when not async to get the latest updated items
    const items = shouldRequestItems ? groupItems : itemsProp;

    return (
        <FlexBox classNames={['ms-filter-group']} column gap="sm">
            <Title
                loading={loading}
            >
                {titleId ? <Message msgId={titleId}/> : title}
            </Title>
            <FlexBox column gap="sm" classNames={root ? ['_padding-l-sm'] : []}>
                {loading ?
                    <Message msgId={loadingItemsMsgId}/>
                    : !isEmpty(items) ? content(items)
                        : !loading ? <Message msgId={noItemsMsgId}/> : null
                }
            </FlexBox>
        </FlexBox>
    );
};


FilterGroup.propTypes = {
    title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
    titleId: PropTypes.string,
    noItemsMsgId: PropTypes.string,
    content: PropTypes.func,
    loadItems: PropTypes.func,
    items: PropTypes.array,
    query: PropTypes.object
};

FilterGroup.defaultProps = {
    title: null,
    content: () => null,
    noItemsMsgId: "resourcesCatalog.emptyFilterItems",
    loadingItemsMsgId: "resourcesCatalog.loadingItems"
};
export default FilterGroup;
