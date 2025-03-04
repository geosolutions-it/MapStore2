/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import castArray from 'lodash/castArray';
import isEmpty from 'lodash/isEmpty';
import moment from 'moment';
import { Checkbox } from 'react-bootstrap';

import Button from '../../../components/layout/Button';
import Tabs from './Tabs';
import Message from '../../../components/I18N/Message';
import SelectInfiniteScroll from './SelectInfiniteScroll';
import ALink from './ALink';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import InputControl from './InputControl';
import { getTagColorVariables } from '../utils/ResourcesFiltersUtils';

const replaceTemplateString = (properties, str) => {
    return Object.keys(properties).reduce((updatedStr, key) => {
        const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
        return updatedStr.replace(regex, properties[key]);
    }, str);
};

const getDateRangeValue = (startValue, endValue, format) => {
    if (startValue && endValue) {
        return `${moment(startValue).format(format)} - ${moment(endValue).format(format)}`;
    }
    return moment(startValue ? startValue : endValue).format(format);
};
const isEmptyValue = (value) => {
    if (Array.isArray(value)) {
        return isEmpty(value);
    }
    if (typeof value === 'object') {
        return isEmpty(value) || (isEmpty(value.start) && isEmpty(value.end));
    }
    return value === 'None' || !value;
};
const isStyleLabel = (style) => style === "label";
const isFieldLabelOnly = ({style, value}) => isEmptyValue(value) && isStyleLabel(style);

const DetailInfoFieldLabel = ({ field }) => {
    const label = field.labelId ? <Message msgId={field.labelId} /> : field.label;
    return isStyleLabel(field.style) && field.href
        ? (<a href={field.href} target={field.target}>{label}</a>)
        : label;
};

function DetailsInfoField({ field, children, className }) {
    const values = castArray(field.value);
    const isLinkLabel = isFieldLabelOnly(field);
    return (
        <FlexBox gap="sm" classNames={['_padding-b-xs', '_row']} className={className}>
            <Text className={isLinkLabel ? '' : '_label'} fontSize="sm"><DetailInfoFieldLabel field={field} /></Text>
            {!isLinkLabel ? <FlexBox.Fill>
                <Text fontSize="sm">{children(values)}</Text>
            </FlexBox.Fill> : null}
        </FlexBox>
    );
}

function DetailsHTML({ value, placeholder }) {
    const [expand, setExpand] = useState(false);
    if (placeholder) {
        const Component = expand ? 'div' : FlexBox;
        return (
            <Component display={expand ? undefined : 'flex'} className="_relative" >
                {expand
                    ? <div dangerouslySetInnerHTML={{ __html: value }} />
                    : <FlexBox.Fill flexBox centerChildrenVertically ><Text ellipsis >{placeholder}</Text></FlexBox.Fill>}
                <Button size="sm" onClick={() => setExpand(!expand)}>
                    <Message msgId={expand ? 'resourcesCatalog.readLess' : 'resourcesCatalog.readMore'} />
                </Button>
            </Component>);
    }
    return (
        <div dangerouslySetInnerHTML={{ __html: value }} />
    );
}


function DetailsInfoFieldEditing({ field, onChange }) {
    if (field.type === 'text') {
        return (
            <DetailsInfoField field={field}>
                {(values) => values.map((value, idx) => (
                    <InputControl
                        key={idx}
                        value={value}
                        debounceTime={300}
                        onChange={(val) => onChange({ [field.path]: val })}
                    />
                ))}
            </DetailsInfoField>
        );
    }
    if (field.type === 'boolean') {
        return (
            <FlexBox gap="sm" classNames={['_padding-b-xs', '_row']}>
                <Text fontSize="sm">
                    <Checkbox checked={field.value} onChange={(event) => onChange({ [field.path]: event.target.checked })}>
                        <DetailInfoFieldLabel field={field} />
                    </Checkbox>
                </Text>
            </FlexBox>
        );
    }
    if (field.type === 'tag' && field.loadItems) {
        return (
            <DetailsInfoField field={field}>
                {() => <SelectInfiniteScroll
                    value={(field.value || []).map((value) => {
                        return {
                            item: value,
                            className: 'ms-tag',
                            style: getTagColorVariables(value[field.itemColor]),
                            value: value[field.itemValue || 'value'],
                            label: value[field.itemLabel || 'value']
                        };
                    })}
                    multi
                    placeholder={field.placeholderId}
                    onChange={(selected) => {
                        onChange({ [field.path]: selected.map(({ item }) => item )});
                    }}
                    loadOptions={({ q, config, ...params }) => field.loadItems({
                        config,
                        params: {
                            ...params,
                            ...(q && { q }),
                            page: params.page - 1
                        }
                    })
                        .then((response) => {
                            return {
                                ...response,
                                results: response.items.map((item) => ({
                                    selectOption: {
                                        item,
                                        className: 'ms-tag',
                                        style: getTagColorVariables(item[field.itemColor]),
                                        value: item[field.itemValue || 'value'],
                                        label: item[field.itemLabel || 'value']
                                    }
                                }))
                            };
                        })}
                />}
            </DetailsInfoField>
        );
    }
    return null;
}

function DetailsInfoFields({ fields, formatHref, editing, onChange, query = {}, enableFilters }) {
    return (<FlexBox
        gap="xs"
        column
        classNames={[
            'ms-details-info-fields',
            '_relative',
            '_padding-tb-md'
        ]}
    >
        {fields.map((field, filedIndex) => {

            if (editing && field.editable) {
                return <DetailsInfoFieldEditing key={filedIndex} field={field} onChange={onChange} />;
            }

            if (field.type === 'link') {
                return (
                    <DetailsInfoField key={filedIndex} field={field}>
                        {(values) => values.map((value, idx) => {
                            return field.href
                                ? <a key={idx} href={field.href}>{value}</a>
                                : <a key={idx} href={value.href}>{value.value}</a>;
                        })}
                    </DetailsInfoField>
                );
            }
            if (field.type === 'query') {
                return (
                    <DetailsInfoField key={filedIndex} field={field}>
                        {(values) => values.map((value, idx) => (
                            <ALink key={idx} href={enableFilters ? formatHref({
                                query: field.queryTemplate
                                    ? Object.keys(field.queryTemplate)
                                        .reduce((acc, key) => ({
                                            ...acc,
                                            [key]: replaceTemplateString(value, field.queryTemplate[key])
                                        }), {})
                                    : field.query,
                                pathname: field.pathname
                            }) : undefined}>{field.valueKey ? value[field.valueKey] : value}</ALink>
                        ))}
                    </DetailsInfoField>
                );
            }
            if (field.type === 'date') {
                return (
                    <DetailsInfoField key={filedIndex} field={field}>
                        {(values) => values.map((value, idx) => (
                            <span key={idx}>{(value?.start || value?.end) ? getDateRangeValue(value.start, value.end, field.format || 'MMMM Do YYYY') : moment(value).format(field.format || 'MMMM Do YYYY')}</span>
                        ))}
                    </DetailsInfoField>
                );
            }
            if (field.type === 'html') {
                return (
                    <DetailsInfoField key={filedIndex} field={field}>
                        {(values) => values.map((value, idx) => (
                            <DetailsHTML key={idx} value={value} placeholder={field.placeholder} />
                        ))}
                    </DetailsInfoField>
                );
            }
            if (field.type === 'text') {
                return (
                    <DetailsInfoField key={filedIndex} field={field}>
                        {(values) => values.map((value, idx) => (
                            <span key={idx}>{value}</span>
                        ))}
                    </DetailsInfoField>
                );
            }
            if (field.type === 'tag') {
                return (
                    <DetailsInfoField key={filedIndex} field={field}>
                        {(values) => values.map((value, idx) => (
                            <ALink
                                key={idx}
                                fallbackComponent="span"
                                className={`ms-tag${castArray(query[field.filter] || []).includes(value[field.itemValue || 'value']) ? ' active' : ''}`}
                                style={getTagColorVariables(value[field.itemColor])}
                                href={enableFilters && field.filter ? formatHref({
                                    query: {
                                        [field.filter]: value[field.itemValue || 'value']
                                    }
                                }) : undefined}
                            >
                                {value[field.itemValue || 'value']}
                            </ALink>
                        ))}
                    </DetailsInfoField>
                );
            }
            if (field.type === 'boolean') {
                return (
                    <FlexBox gap="sm" classNames={['_padding-b-xs', '_row']}>
                        <Text fontSize="sm">
                            <Checkbox checked={field.value} disabled>
                                <DetailInfoFieldLabel field={field} />
                            </Checkbox>
                        </Text>
                    </FlexBox>
                );
            }
            return null;
        })}
    </FlexBox>);
}

const defaultTabComponents = {
    'tab': DetailsInfoFields
};

const parseTabItems = (items) => {
    return (items || []).filter(({value, style, type }) => {
        return type === 'boolean' || !(isEmptyValue(value) && !isStyleLabel(style));
    });
};
const isDefaultTabType = (type) => type === 'tab';

function DetailsInfo({
    tabs = [],
    tabComponents: tabComponentsProp,
    className,
    ...props
}) {

    const tabComponents = {
        ...tabComponentsProp,
        ...defaultTabComponents
    };

    const filteredTabs = tabs
        .filter((tab) => !tab?.disableIf)
        .map((tab) =>
            ({
                ...tab,
                items: isDefaultTabType(tab.type) && !props.editing ? parseTabItems(tab?.items) : tab?.items,
                Component: tabComponents[tab.type] || tabComponents.tab
            }))
        .filter(tab => !isEmpty(tab?.items));
    const [selectedTabId, onSelect] = useState(filteredTabs?.[0]?.id);
    return (
        <Tabs
            className={`ms-details-info tabs-underline${className ? ` ${className}` : ''}`}
            selectedTabId={selectedTabId}
            onSelect={onSelect}
            tabs={filteredTabs.map(({Component, ...tab} = {}) => ({
                title: <DetailInfoFieldLabel field={tab} />,
                eventKey: tab?.id,
                component: <Component fields={tab?.items} {...props} />
            }))}
        />
    );
}

export default DetailsInfo;
