/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { memo } from 'react';
import PropTypes from 'prop-types';
import isEqual from 'lodash/isEqual';
import isEmpty from 'lodash/isEmpty';
import omit from 'lodash/omit';
import { Glyphicon } from 'react-bootstrap';

import Button from '../../../components/layout/Button';
import Message from '../../../components/I18N/Message';
import FilterItems from './FilterItems';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';

/**
 * FilterForm component allows to configure a list of field that can be used to apply filter on the page
 * @name FiltersForm
 * @memberof components
 * @prop {string} id the thumbnail is scaled based on the following configuration
 */
function FiltersForm({
    id,
    style,
    styleContainerForm,
    query,
    fields,
    onChange,
    onClose,
    onClear,
    extentProps,
    timeDebounce,
    filters,
    setFilters
}) {

    const handleFieldChange = (newParam) => {
        onChange(newParam);
    };

    return (
        <div
            className="ms-filters-form"
            style={styleContainerForm}
        >
            <FlexBox classNames={['ms-main-colors', '_padding-md', '_sticky', '_corner-tl']} centerChildrenVertically gap="sm">
                <FlexBox.Fill>
                    <Text ellipsis fontSize="md">
                        <Message msgId="resourcesCatalog.filters" />
                    </Text>
                </FlexBox.Fill>
                <Button
                    size="sm"
                    variant="default"
                    onClick={onClear}
                    disabled={isEmpty(omit(query, ['d', 'page', 'sort']))}
                >
                    <Message msgId="resourcesCatalog.clearFilters"/>
                </Button>
                <Button
                    variant="default"
                    onClick={() => onClose()}
                    square
                    borderTransparent
                >
                    <Glyphicon glyph="1-close" />
                </Button>
            </FlexBox>
            <FlexBox
                component="form"
                column
                gap="sm"
                style={style}
                classNames={['_padding-lr-md']}
            >
                <FilterItems
                    id={id}
                    items={fields}
                    values={query}
                    extentProps={{ ...extentProps, timeDebounce }}
                    onChange={handleFieldChange}
                    filters={filters}
                    setFilters={setFilters}
                    root
                />
            </FlexBox>
        </div>
    );
}

FiltersForm.defaultProps = {
    id: PropTypes.string,
    style: PropTypes.object,
    styleContainerForm: PropTypes.object,
    query: PropTypes.object,
    fields: PropTypes.array,
    onChange: PropTypes.func,
    onClose: PropTypes.func,
    onClear: PropTypes.func,
    extentProps: PropTypes.object,
    submitOnChangeField: PropTypes.bool,
    timeDebounce: PropTypes.number,
    formParams: PropTypes.object

};

FiltersForm.defaultProps = {
    query: {},
    fields: [],
    onChange: () => {},
    onClose: () => {},
    onClear: () => {},
    submitOnChangeField: true,
    timeDebounce: 500,
    formParams: {}
};

const arePropsEqual = (prevProps, nextProps) => {
    return isEqual(prevProps.query, nextProps.query)
        && isEqual(prevProps.fields, nextProps.fields)
        && isEqual(prevProps.filters, nextProps.filters);
};


export default memo(FiltersForm, arePropsEqual);
