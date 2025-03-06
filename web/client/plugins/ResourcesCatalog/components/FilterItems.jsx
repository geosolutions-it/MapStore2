/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import castArray from 'lodash/castArray';
import isNil from 'lodash/isNil';
import omit from 'lodash/omit';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import { FormGroup, Checkbox } from 'react-bootstrap';
import ReactSelect from 'react-select';
import localizedProps from '../../../components/misc/enhancers/localizedProps';
import { getMessageById } from '../../../utils/LocaleUtils';
import FilterByExtent from './FilterByExtent';
import FilterDateRange from './FilterDateRange';
import Icon from './Icon';

import FilterAccordion from "./FilterAccordion";
import Tabs from "./Tabs";
import SelectInfiniteScroll from './SelectInfiniteScroll';
import FilterGroup from './FilterGroup';

import { getFilterByField as defaultGetFilterByField, getTagColorVariables } from '../utils/ResourcesFiltersUtils';
import InputControl from './InputControl';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';

const SelectSync = localizedProps('placeholder')(ReactSelect);

function Label({item} = {}, { messages }) {
    return (
        <FlexBox gap="sm">
            <FlexBox.Fill>
                <Text>
                    {item.icon ? <Icon glyph={item.icon}/> : item.image ? <img src={item.image}/> : null}
                    {item.labelId ? getMessageById(messages, item.labelId) : item.label}
                </Text>
            </FlexBox.Fill>
            {!isNil(item.count) ? <span className="facet-count">{`(${item.count})`}</span> : null}
        </FlexBox>
    );
}
Label.contextTypes = {
    messages: PropTypes.object
};

function Facet({
    item,
    active,
    onChange
}) {
    const filterValue = item.filterValue || item.id;
    return (
        <div className={`ms-filter-facet _padding-r-sm${active ? ' _padding-l-sm' : undefined}${active ? ' ms-selected-colors' : ''}`} onClick={onChange}>
            <input
                type="checkbox"
                id={filterValue}
                name={filterValue}
                checked={!!active}
                onKeyDown={(event) => event.key === 'Enter' ? onChange() : null}
                style={{ display: 'block', width: 0, height: 0, overflow: 'hidden', opacity: 0, padding: 0, margin: 0 }}
            />
            <Label item={item}/>
        </div>
    );
}

function ExtentFilterWithDebounce({
    id,
    labelId,
    query,
    timeDebounce,
    layers,
    vectorLayerStyle,
    onChange
}) {
    const extentChange = debounce((extent) => {
        onChange({ extent });
    }, timeDebounce);
    return (
        <FilterByExtent
            id={id}
            labelId={labelId}
            extent={query.extent}
            layers={layers}
            vectorLayerStyle={vectorLayerStyle}
            onChange={(({ extent }) =>{
                extentChange(extent);
            })}
        />
    );
}
function FilterItem({
    id,
    values,
    onChange,
    extentProps,
    timeDebounce,
    field,
    root
}, { messages }) {

    // remove global search parameters
    // to avoid conflict with filed search
    const additionalParams = omit(values, ['q', 'page', 'pageSize']);

    if (field.type === 'search') {
        return (
            <InputControl
                placeholder="resourcesCatalog.search"
                value={values.q || ''}
                debounceTime={300}
                onChange={(q) => onChange({ q })}
            />
        );
    }
    if (field.type === 'extent') {
        return (
            <ExtentFilterWithDebounce
                labelId={field.labelId}
                id={field.uuid}
                query={values}
                timeDebounce={timeDebounce}
                layers={field?.layers || extentProps?.layers}
                vectorLayerStyle={field?.vectorStyle || extentProps?.style}
                onChange={onChange}
            />
        );
    }
    if (field.type === 'date-range') {
        return (
            <FilterDateRange
                query={values}
                labelId={field.labelId}
                filterKey={field.filterKey}
                onChange={onChange}
            />
        );
    }
    if (field.type === 'select' && field.loadItems) {

        const filterKey = field.key;
        const isFacet = field.style === 'facet';
        const filterValues = castArray(values[filterKey] || []);
        const getFilterByField = field?.getFilterByField || defaultGetFilterByField;
        const currentValues = filterValues.filter(v => getFilterByField(field, v));
        const otherValues = filterValues.filter(v => !getFilterByField(field, v));
        const getLabelValue = field.getLabelValue
            ? field.getLabelValue
            : (item) => `${item.labelId ? getMessageById(messages, item.labelId) : item.label || ''}${item.count !== undefined ? `(${item.count})` : ''}`;
        return (
            <FormGroup
                controlId={field.id}
            >
                <label>{field.labelId ? getMessageById(messages, field.labelId) : field.label}</label>
                <SelectInfiniteScroll
                    value={currentValues.map((value) => {
                        const selectedFilter = getFilterByField(field, value);
                        return {
                            value,
                            label: selectedFilter ? getLabelValue(selectedFilter) : value,
                            ...(selectedFilter?.color && {
                                className: 'ms-tag',
                                style: getTagColorVariables(selectedFilter.color)
                            })
                        };
                    })}
                    multi
                    placeholder={field.placeholderId}
                    onChange={(selected) => {
                        let _selected = selected.map(({ value }) => value);
                        _selected = isFacet ? _selected.concat(otherValues) : _selected;
                        onChange({
                            [filterKey]: _selected
                        });
                    }}
                    loadOptions={({ q, config, ...params }) => field.loadItems({
                        config,
                        params: {
                            ...params,
                            ...additionalParams, // filter queries
                            ...(q && { q }),
                            page: params.page - 1
                        }
                    })
                        .then((response) => {
                            return {
                                ...response,
                                results: response.items.map((item) => ({
                                    ...item,
                                    selectOption: {
                                        value: item.filterValue,
                                        label: getLabelValue(item),
                                        ...(item?.color && {
                                            className: 'ms-tag',
                                            style: getTagColorVariables(item.color)
                                        })
                                    }
                                }))
                            };
                        })}
                />
            </FormGroup>
        );
    }
    if (field.type === 'select') {
        const {
            id: formId,
            labelId,
            label,
            placeholderId,
            description,
            options: optionsField
        } = field;
        const key = `${id}-${formId}`;
        const filterKey = `filter{${formId}.in}`;

        const currentValues = values[filterKey] || [];
        const options = (optionsField || [])?.map(option => ({ value: option, label: option }));
        const getFilterLabelById = (value) => options.find(option => option.value === value)?.label;
        return (
            <FormGroup
                controlId={key}
            >
                <label><strong>{labelId ? getMessageById(messages, labelId) : label}</strong></label>
                <SelectSync
                    value={currentValues.map((value) => ({ value, label: getFilterLabelById(value) || value }))}
                    multi
                    placeholder={placeholderId}
                    onChange={(selected) => {
                        onChange({
                            [filterKey]: selected.map(({ value }) => value)
                        });
                    }}
                    options={options}
                />
                {description &&
                <div className="text-muted">
                    {description}
                </div>}
            </FormGroup>
        );
    }
    if (field.type === 'group') {
        return (<FilterGroup
            query={values}
            title={field.labelId ? getMessageById(messages, field.labelId) : field.label}
            {...field.loadItems && {loadItems: (params) => field.loadItems({
                params: {
                    ...params,
                    ...additionalParams
                }
            })}}
            items={field.items}
            root={root}
            content={(groupItems) => (
                <FilterItems
                    id={id}
                    items={groupItems}
                    values={values}
                    onChange={onChange}
                />)
            }
        />);
    }
    if (field.type === 'divider') {
        return <div className="_row" />;
    }
    if (field.type === 'link') {
        return <a href={field.href}>{field.labelId && getMessageById(messages, field.labelId) || field.label}</a>;
    }
    if (field.type === 'filter') {
        const filterKey = field.filterKey || "f";
        const customFilters = castArray( values[filterKey] || []);
        const getFilterValue = (item) => item.filterValue || item.id;
        const isFacet = (item) => item.style === 'facet';
        const renderFacet = ({item, active, onChangeFacet, renderChild}) => {
            return (
                <div className="ms-filter-facet-container">
                    <Facet item={item} active={active} onChange={onChangeFacet}/>
                    {item.items && renderChild && <div className="ms-filter-facet-children">{renderChild()}</div>}
                </div>
            );
        };

        const filterChild = () => {
            return field.items && field.items.map((item) => {
                const active = customFilters.find(value => value === getFilterValue(item));
                const onChangeFilter = () => {
                    onChange({
                        f: active
                            ? customFilters.filter(value => value !== getFilterValue(item))
                            : [...customFilters.filter(value => field.id !== value), getFilterValue(item), getFilterValue(field)]
                    });
                };
                return (
                    <FlexBox column gap="sm" key={item.uuid}>
                        {isFacet(item)
                            ? renderFacet({item, active, onChangeFacet: onChangeFilter})
                            : <Checkbox
                                type="checkbox"
                                checked={!!active}
                                value={getFilterValue(item)}
                                onChange={onChangeFilter}
                            >
                                <Label item={item}/>
                            </Checkbox>
                        }
                    </FlexBox>
                );
            } );
        };
        const active = customFilters.find(value => value === getFilterValue(field));
        const parentFilterIds = [
            getFilterValue(field),
            ...(field.items
                ? field.items.map((item) => getFilterValue(item))
                : [])
        ];
        const onChangeFilterParent = () => {
            onChange({
                [filterKey]: active
                    ? customFilters.filter(value => !parentFilterIds.includes(value))
                    : [...customFilters, getFilterValue(field)]
            });
        };
        return isFacet(field)
            ? renderFacet({
                item: field,
                active,
                onChangeFacet: onChangeFilterParent,
                renderChild: filterChild
            }) : (
                <FormGroup controlId={'ms-radio-filter-' + getFilterValue(field)}>
                    <Checkbox
                        type="checkbox"
                        checked={!!active}
                        value={getFilterValue(field)}
                        onChange={onChangeFilterParent}>
                        <Label item={field}/>
                        {filterChild()}
                    </Checkbox>
                </FormGroup>
            );
    }
    if (field.type === 'accordion' && !field.facet && field.id) {
        return (<FilterAccordion
            query={values}
            title={field.labelId ? getMessageById(messages, field.labelId) : field.label}
            identifier={field.id}
            {...field.loadItems && { loadItems: (params) => field.loadItems({
                params: {
                    ...params,
                    ...additionalParams
                }
            })}}
            root={root}
            items={field.items}
            content={(accordionItems) => (
                <FilterItems
                    id={id}
                    items={accordionItems}
                    values={values}
                    onChange={onChange}
                />)
            }
        />);
    }
    if (field.type === 'tabs') {
        const key = `${id}-${field.id}`;
        return (
            <Tabs
                identifier={key}
                persistSelection={field.persistSelection}
                tabs={(field?.items || [])?.map((item) => ({
                    title: item.labelId ? getMessageById(messages, item.labelId) : item.label,
                    component: <FilterItems
                        {...item}
                        extentProps={extentProps}
                        timeDebounce={timeDebounce}
                        items={item.items}
                        values={values}
                        onChange={onChange}
                    />
                }))}
            />
        );
    }
    return null;
}

FilterItem.contextTypes = {
    messages: PropTypes.object
};

function FilterItems({ items, ...props }) {
    return items.map((field, idx) =>
        <FilterItem
            key={field.uuid || `${field.id || ''}-${idx}`}
            {...props}
            field={field}
        />
    );
}

FilterItems.defaultProps = {
    id: PropTypes.string,
    items: PropTypes.array,
    values: PropTypes.object,
    onChange: PropTypes.func
};

FilterItems.defaultProps = {
    items: [],
    values: {},
    onChange: () => {}
};

export default FilterItems;
