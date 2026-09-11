/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useState } from 'react';
import moment from 'moment';
import castArray from 'lodash/castArray';
import isObject from 'lodash/isObject';
import isPlainObject from 'lodash/isPlainObject';
import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import { Glyphicon } from 'react-bootstrap';

import Message from '../../../components/I18N/Message';
import Button from '../../../components/layout/Button';
import Spinner from '../../../components/layout/Spinner';
import ResourceStatus from './ResourceStatus';
import ResourceCardActionButtons from './ResourceCardActionButtons';
import ALink from './ALink';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import tooltip from '../../../components/misc/enhancers/tooltip';
import HtmlRenderer from '../../../components/misc/HtmlRenderer';
import { getTagColorVariables } from '../../../utils/ResourcesFiltersUtils';
import { replaceResourcePaths, getResourceInfo, getResourceStatus } from '../../../utils/ResourcesUtils';
import { CARD_LAYOUT_TYPES } from '../../../plugins/ResourcesCatalog/constants';
const ButtonWithTooltip = tooltip(Button);

const ResourceCardButton = ({
    glyph,
    iconType,
    labelId,
    onClick,
    square,
    variant,
    borderTransparent,
    loading,
    ...props
}) => {
    function handleOnClick(event) {
        event.stopPropagation();
        if (onClick) {
            onClick(event);
        }
    }
    return (
        <ButtonWithTooltip
            variant={variant}
            square={square}
            borderTransparent={borderTransparent}
            {...props}
            tooltipId={square && labelId ? labelId : null}
            onClick={handleOnClick}
        >
            {!loading && glyph ? <><Glyphicon glyph={glyph}/></> : null}
            {!loading && glyph && labelId ? ' ' : null}
            {!loading && labelId && !square ? <Message msgId={labelId} /> : null}
            {loading ? <Spinner /> : null}
        </ButtonWithTooltip>
    );
};

// tooltip-enhanced component
const FlexBoxWithTooltip = tooltip(FlexBox);

const ResourceCardWrapper = ({
    children,
    viewerUrl,
    readOnly,
    resource,
    active,
    interactive,
    columns,
    metadata,
    layoutCardsStyle,
    query,
    target,
    ...props
}) => {
    const showViewerLink = !!(!readOnly && viewerUrl);
    const status = getResourceStatus(resource);

    const hasCardTooltip = !!status.cardTooltipId;
    const CardWrapper = hasCardTooltip ? FlexBoxWithTooltip : FlexBox;
    const tooltipProps = hasCardTooltip ? {
        tooltipId: status.cardTooltipId
    } : {};

    // Use cardClassNames from status or fallback to empty array
    const cardClassNames = status.cardClassNames || [];

    return (
        <CardWrapper
            column
            classNames={[
                '_relative',
                '_interactive',
                ...(active ? ['_active'] : []),
                ...cardClassNames
            ]}
            {...tooltipProps}
            {...props}
        >
            {showViewerLink ? (
                <a
                    className="_absolute _fill"
                    href={viewerUrl}
                    {...target && {target}}
                />
            ) : null}
            {children}
        </CardWrapper>
    );
};

const ResourceCardMetadataValue = tooltip(({
    value,
    entry = {},
    readOnly,
    formatHref = () => '#',
    query = {},
    resource,
    target,
    renderIcon = false,
    ...props
}) => {

    const getFilterActiveClassName = (filter, val) => {
        const filters = castArray(query[filter] || []);
        return filters.includes(val) ? ' active' : '';
    };

    const getProperties = () => {
        if (isObject(value)) {
            const itemValue = entry.itemValue ? value[entry.itemValue] : value.value;
            const itemLabel = entry.itemLabel ? value[entry.itemLabel] : null;
            return {
                value: itemValue !== undefined ? itemValue : value,
                label: itemLabel || itemValue || '',
                color: value[entry.itemColor],
                selected: !!value?.[entry.itemSelected]
            };
        }
        return {
            value,
            label: value
        };
    };

    const properties = getProperties();

    if (entry.type === 'html' && properties.value) {
        return (
            <HtmlRenderer
                {...props}
                html={properties.value}
                style={{}}
            />
        );
    }

    if (entry.onClick) {
        return (
            <Button
                {...props}
                className={`ms-tag ms-resource-card-tag-button${properties.selected ? ' selected' : ''}`}
                style={getTagColorVariables(properties.color)}
                title={typeof properties.label === 'string' ? properties.label : undefined}
                onClick={(event) => {
                    event.stopPropagation();
                    entry.onClick(properties.value, event);
                }}
            >
                {properties.label}
            </Button>
        );
    }

    const href = entry.href ||
        (entry.hrefPath && resource && get(resource, entry.hrefPath)) ||
        (entry.filter && formatHref({
            query: {
                [entry.filter]: properties.value
            }
        }));

    const renderContent = () => {
        let valueNode = null;
        if (entry.type === 'date' && entry.format && properties.value) {
            valueNode = moment(properties.value).format(entry.format);
        } else if (properties.value !== undefined) {
            valueNode = properties.label;
        } else if (!entry.path && entry.labelId) {
            valueNode = <Message msgId={entry.labelId} />;
        } else if (entry.label !== undefined) {
            valueNode = entry.label;
        } else if (properties.label !== undefined) {
            valueNode = properties.label;
        }
        const iconNode = renderIcon && entry.icon ? <><Glyphicon {...entry.icon} />{valueNode ? ' ' : null}</> : null;
        const imageNode = renderIcon && entry.image?.value
            ? <><img className="ms-resource-icon-logo" src={entry.image.value} />{valueNode ? ' ' : null}</> : null;
        return (
            <>
                {imageNode}
                {iconNode}
                {valueNode}
            </>
        );
    };

    return (
        <ALink
            {...props}
            className={`ms-${entry.type || 'string'}${getFilterActiveClassName(entry.filter, properties.value)}`}
            style={getTagColorVariables(properties.color)}
            fallbackComponent={entry.type === 'tag' ? 'span' : (entry.type === 'link' || entry.type === 'text' ? 'span' : undefined)}
            readOnly={readOnly}
            href={href}
            target={entry.target || target}
        >
            {renderContent()}
        </ALink>
    );
});

const getSeparatorString = (separator) => {
    if (isNil(separator)) return ' ';
    if (separator === '') return '';
    return separator.endsWith(' ') ? separator : `${separator} `;
};

const isValueEmpty = (val) => {
    if (val === undefined || val === null) return true;
    if (typeof val === 'string') return !val.trim();
    if (Array.isArray(val)) return !val.length || val.every(isValueEmpty);
    if (isPlainObject(val)) return isEmpty(val);
    return false;
};

const ResourceCardMetadataEntry = ({
    entry = {},
    value,
    formatHref,
    readOnly,
    query,
    column,
    resource,
    target,
    showNoData = false,
    ...props
}) => {
    // Use a plain div for html entries so block-level markup is legal;
    // Text renders a <span> which cannot host block-level HTML.
    const isHtml = entry.type === 'html';
    const Wrapper = isHtml ? 'div' : Text;
    const wrapperProps = isHtml ? {} : { fontSize: 'sm', ellipsis: !entry.showFullContent };

    const renderEntryContent = () => {
        const metadataValueProps = { resource, formatHref, readOnly, query, target };
        const renderNoData = () => showNoData && entry.noDataLabelId ? <Message msgId={entry.noDataLabelId} /> : null;
        const renderValue = (valueToRender, valueEntry = entry, extraProps = {}) => (
            <ResourceCardMetadataValue
                entry={valueEntry}
                value={valueToRender}
                tooltipId={valueEntry.tooltipId}
                {...metadataValueProps}
                {...extraProps}
            />
        );

        // When the root element has no path, items is treated as a list of elements to render
        if (Array.isArray(entry.items) && !entry.path) {
            const pathItems = entry.items.filter(item => item.path);

            if (pathItems.length && pathItems.every(item => isValueEmpty(resource ? get(resource, item.path) : item.value))) {
                return null;
            }

            return entry.items.map((item, idx) => {
                const itemValue = item.path && resource ? get(resource, item.path) : item.value;
                const separator = idx > 0 ? getSeparatorString(item.separator || entry.separator) : null;

                return (
                    <React.Fragment key={item.path || idx}>
                        {separator}
                        {renderValue(itemValue, item, {resource, renderIcon: true})}
                    </React.Fragment>
                );
            });
        }

        // When path is present (or type: array) and items is present,
        // items is treated as the template structure for each object in the array
        if (Array.isArray(entry.items) && (entry.path || entry.type === 'array')) {
            const rawArray = value !== undefined ? value : (entry.path && resource ? get(resource, entry.path) : undefined);

            if (isValueEmpty(rawArray)) return renderNoData();

            return castArray(rawArray).map((elementObj, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && getSeparatorString(entry.separator)}
                    {entry.items.map((item, itemIdx) => {
                        const itemValue = item.path && isObject(elementObj)
                            ? get(elementObj, item.path)
                            : (item.value !== undefined ? item.value : elementObj);

                        return (
                            <React.Fragment key={item.path || itemIdx}>
                                {itemIdx > 0 && getSeparatorString(item.separator)}
                                {renderValue(itemValue, item, { resource: elementObj, renderIcon: true})}
                            </React.Fragment>
                        );
                    })}
                </React.Fragment>
            ));
        }

        // When items is not present, array elements are treated as primitive values
        if (Array.isArray(value) || (entry.type === 'array' && value !== undefined)) {
            if (isValueEmpty(value)) return renderNoData();

            return castArray(value).map((itemValue, idx) => (
                <React.Fragment key={idx}>
                    {idx > 0 && getSeparatorString(entry.separator)}
                    {renderValue(itemValue)}
                </React.Fragment>
            ));
        }

        if (entry.path) {
            if (isValueEmpty(value)) return renderNoData();
            return renderValue(value);
        }

        if (entry.labelId || entry.label || entry.icon || entry.href || entry.hrefPath) {
            return renderValue(value);
        }

        return renderNoData();
    };

    const content = renderEntryContent();
    const hasIcon = !isHtml && (entry.image?.value || entry.icon);
    if (!content && !hasIcon && !column?.width) {
        return null;
    }

    return (
        <Wrapper
            key={entry.path}
            style={column?.width ? { width: `${column.width}%` } : {}}
            {...wrapperProps}
            {...props}
        >
            {!isHtml && (entry.image?.value
                ? <><img className="ms-resource-icon-logo" src={entry.image.value} />{' '}</>
                : entry.icon
                    ? <><Glyphicon {...entry.icon}/>{' '}</>
                    : null)}
            {content}
        </Wrapper>
    );
};

const ResourceCardImage = ({
    icon,
    src,
    className
}) => {
    const [imgError, setImgError] = useState(false);
    return (imgError || !src) ? (
        <FlexBox
            className={className}
            centerChildren
            classNames={['pointer_events_none']}
        >
            <Text fontSize="xxl">
                <Glyphicon {...icon} />
            </Text>
        </FlexBox>
    ) : (
        <img
            className={className}
            src={src}
            onError={() => setImgError(true)}
        />
    );
};

const ResourceCardBody = ({
    icon,
    loading,
    metadata,
    resource,
    formatHref,
    readOnly,
    query,
    viewerUrl,
    buttons,
    statusItems,
    options,
    thumbnailUrl,
    hideThumbnail,
    layoutCardsStyle,
    target
}) => {

    const headerEntry = metadata.find(entry => entry?.target === 'header');
    const footerEntry = metadata.find(entry => entry?.target === 'footer');
    const isThumbnailHidden = isObject(hideThumbnail) ? !!hideThumbnail[layoutCardsStyle] : !!hideThumbnail;
    const HeaderComponent = headerEntry?.items ? ResourceCardMetadataEntry : ResourceCardMetadataValue;

    return (
        <>
            {!isThumbnailHidden ? <ResourceCardImage
                className="ms-resource-card-img ms-image-colors"
                src={thumbnailUrl}
                icon={icon}
            /> : null}
            <FlexBox.Fill
                flexBox
                column
                gap="sm"
                classNames={['_padding-sm']}
            >
                <FlexBox className="ms-resource-card-body-header" gap="sm" centerChildrenVertically>
                    <FlexBox.Fill flexBox>
                        <Text fontSize="md" ellipsis={!headerEntry?.showFullContent}>
                            {((icon || headerEntry?.icon) && !loading) && (
                                <><Glyphicon {...(icon || headerEntry?.icon)} />{' '}</>
                            )}
                            {(loading) && <><Spinner />{' '}</>}
                            {headerEntry && (
                                <HeaderComponent
                                    entry={headerEntry}
                                    value={headerEntry.value}
                                    formatHref={formatHref}
                                    readOnly={readOnly}
                                    query={query}
                                    resource={resource}
                                    target={target}
                                />
                            )}
                        </Text>
                    </FlexBox.Fill>
                    <ResourceStatus statusItems={statusItems} />
                </FlexBox>
                {metadata.filter(entry => entry && !['header', 'footer'].includes(entry.target)).map((entry, idx) => {
                    const value = entry.value;
                    // description can span multiple lines in list view but not in card view.
                    const isDescription = entry.target === 'description' && layoutCardsStyle === CARD_LAYOUT_TYPES.LIST;
                    const className = isDescription ? 'ms-resource-card-description' : '';

                    return (
                        <ResourceCardMetadataEntry
                            key={entry.path || idx}
                            entry={entry}
                            value={value}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
                            resource={resource}
                            target={target}
                            className={className}
                        />
                    );
                })}
                <FlexBox className="ms-resource-card-body-footer" gap="sm" centerChildrenVertically>
                    <FlexBox.Fill flexBox>
                        {footerEntry ? <ResourceCardMetadataEntry
                            entry={footerEntry}
                            value={footerEntry.value}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
                            resource={resource}
                            target={target}
                        /> : null}
                    </FlexBox.Fill>
                    <FlexBox className="ms-resource-card-buttons" classNames={['_relative']} gap="xs">
                        {buttons.map(({ Component, name }) => {
                            return (
                                <Component
                                    key={name}
                                    resource={resource}
                                    viewerUrl={viewerUrl}
                                    component={ResourceCardButton}
                                    readOnly={readOnly}
                                    target={target}
                                />
                            );
                        })}
                    </FlexBox>
                </FlexBox>
            </FlexBox.Fill>
            {!readOnly && options?.length > 0
                ? (
                    <ResourceCardActionButtons
                        resource={resource}
                        viewerUrl={viewerUrl}
                        options={options}
                        readOnly={readOnly}
                        target={target}
                        className="_absolute _margin-sm _corner-tr"
                    />
                )
                : null}
        </>
    );
};

const ResourceCardTableBody = ({
    icon,
    loading,
    metadata,
    resource,
    formatHref,
    readOnly,
    query,
    viewerUrl,
    options: optionsProp,
    buttons,
    columns,
    target
}) => {
    const options = [
        ...(buttons || []),
        ...(optionsProp || [])
    ];
    return (
        <FlexBox className="ms-resource-card-body" centerChildrenVertically>
            <div className="ms-resource-card-limit">
                {(icon && !loading) && (
                    <Glyphicon {...icon} />
                )}
                {(loading) && <><Spinner />{' '}</>}
            </div>
            <FlexBox.Fill flexBox centerChildrenVertically>
                {metadata.map((entry, idx) => {
                    const value = entry.value;
                    const column = columns.find(col => col.path === entry.path);
                    return (
                        <ResourceCardMetadataEntry
                            key={entry.path || idx}
                            entry={entry}
                            value={value}
                            column={column}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
                            resource={resource}
                            target={target}
                            showNoData
                            classNames={['_padding-sm']}
                        />
                    );
                })}
            </FlexBox.Fill>
            <div className="ms-resource-card-limit">
                {!readOnly && options?.length > 0
                    ? (
                        <ResourceCardActionButtons
                            resource={resource}
                            viewerUrl={viewerUrl}
                            options={options}
                            readOnly={readOnly}
                            target={target}
                        />
                    )
                    : null}
            </div>
        </FlexBox>
    );
};

const ResourceCardGridBody = ({...props}) => {
    return (
        <FlexBox.Fill className="ms-resource-card-body" flexBox column>
            <ResourceCardBody {...props}  />
        </FlexBox.Fill>
    );
};
const ResourceCardListBody = ({...props}) => {
    return (
        <FlexBox.Fill className="ms-resource-card-body" flexBox>
            <ResourceCardBody {...props} />
        </FlexBox.Fill>
    );
};

const cardBody = {
    [CARD_LAYOUT_TYPES.GRID]: ResourceCardGridBody,
    [CARD_LAYOUT_TYPES.TABLE]: ResourceCardTableBody,
    [CARD_LAYOUT_TYPES.LIST]: ResourceCardListBody
};

const ResourceCard = forwardRef(({
    data,
    active,
    options = [],
    layoutCardsStyle,
    readOnly,
    className,
    loading,
    statusItems,
    buttons = [],
    component,
    query = {},
    metadata = [],
    columns = [],
    formatHref,
    onClick,
    hideThumbnail,
    target
}, ref) => {

    const resource = data;
    const {
        icon,
        viewerUrl,
        thumbnailUrl
    } = getResourceInfo(resource);

    const CardComponent = component || ResourceCardWrapper;
    const CardBody = cardBody[layoutCardsStyle];
    return (
        <CardComponent
            ref={ref}
            resource={resource}
            viewerUrl={viewerUrl}
            readOnly={readOnly}
            active={active}
            interactive={!readOnly}
            layoutCardsStyle={layoutCardsStyle}
            className={`ms-resource-card ms-resource-card-type-${layoutCardsStyle} ms-main-colors${className ? ` ${className}` : ''}`}
            onClick={onClick}
            columns={columns}
            metadata={metadata}
            query={query}
            target={target}
        >
            {CardBody ? <CardBody
                icon={icon}
                loading={loading}
                metadata={replaceResourcePaths(metadata, resource)}
                resource={resource}
                formatHref={formatHref}
                readOnly={readOnly}
                query={query}
                viewerUrl={viewerUrl}
                buttons={buttons}
                statusItems={statusItems}
                options={options}
                columns={columns}
                thumbnailUrl={thumbnailUrl}
                hideThumbnail={hideThumbnail}
                layoutCardsStyle={layoutCardsStyle}
                target={target}
            /> : null}
        </CardComponent>
    );
});

ResourceCard.defaultProps = {
    links: [],
    theme: 'light',
    formatHref: () => '#',
    featured: false
};

export default ResourceCard;
