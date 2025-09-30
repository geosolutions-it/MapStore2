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
import { isObject } from 'lodash';
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
import { getTagColorVariables } from '../../../utils/ResourcesFiltersUtils';
import { replaceResourcePaths, getResourceInfo, getResourceStatus } from '../../../utils/ResourcesUtils';
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
    entry,
    readOnly,
    formatHref,
    query,
    ...props
}) => {

    const getFilterActiveClassName = (filter, val) => {
        const filters = castArray(query[filter] || []);
        return filters.includes(val) ? ' active' : '';
    };

    const getProperties = () => {
        if (isObject(value)) {
            return {
                value: value[entry.itemValue],
                color: value[entry.itemColor]
            };
        }
        return {
            value
        };
    };

    const properties = getProperties();

    return (
        <ALink
            {...props}
            className={`ms-${entry.type || 'string'}${getFilterActiveClassName(entry.filter, properties.value)}`}
            style={getTagColorVariables(properties.color)}
            fallbackComponent={entry.type === 'tag' ? 'span' : undefined}
            readOnly={readOnly}
            href={entry.filter ? formatHref({
                query: {
                    [entry.filter]: properties.value
                }
            }) : undefined}
        >
            {entry.type === 'date' && entry.format && properties.value
                ? moment(properties.value).format(entry.format)
                : properties.value}
        </ALink>
    );
});

const ResourceCardMetadataEntry = ({
    entry,
    value,
    formatHref,
    readOnly,
    query,
    column,
    ...props
}) => {
    return (
        <Text
            key={entry.path}
            fontSize="sm"
            ellipsis={!entry.showFullContent}
            style={column?.width ? { width: `${column.width}%` } : {}}
            {...props}
        >
            {entry.image?.value
                ? <><img className="ms-resource-icon-logo" src={entry.image.value} />{' '}</>
                : entry.icon
                    ? <><Glyphicon {...entry.icon}/>{' '}</>
                    : null}
            {Array.isArray(value)
                ? value.map((val, idx) => {
                    return (<ResourceCardMetadataValue key={idx} value={val} entry={entry} tooltipId={entry.tooltipId} formatHref={formatHref} readOnly={readOnly} query={query}/>);
                })
                : value !== undefined
                    ? <ResourceCardMetadataValue value={value} entry={entry} tooltipId={entry.tooltipId} formatHref={formatHref} readOnly={readOnly} query={query}/>
                    : entry?.noDataLabelId
                        ? <Message msgId={entry.noDataLabelId} />
                        : null}
        </Text>
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

const ResourceCardGridBody = ({
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
    target
}) => {

    const headerEntry = metadata.find(entry => entry.target === 'header');
    const footerEntry = metadata.find(entry => entry.target === 'footer');
    return (
        <FlexBox.Fill className="ms-resource-card-body" flexBox column>
            {!hideThumbnail ? <ResourceCardImage
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
                        <Text fontSize="md" ellipsis={!headerEntry.showFullContent}>
                            {((icon || headerEntry?.icon) && !loading) && (
                                <><Glyphicon {...(icon || headerEntry?.icon)} />{' '}</>
                            )}
                            {(loading) && <><Spinner />{' '}</>}
                            {headerEntry?.path ? <ResourceCardMetadataValue
                                entry={headerEntry}
                                value={headerEntry.value}
                                formatHref={formatHref}
                                readOnly={readOnly}
                                query={query}
                            /> : null}
                        </Text>
                    </FlexBox.Fill>
                    <ResourceStatus statusItems={statusItems} />
                </FlexBox>
                {metadata.filter(entry => !['header', 'footer'].includes(entry.target)).map((entry) => {
                    const value = entry.value;
                    if (!value) {
                        return null;
                    }
                    return (
                        <ResourceCardMetadataEntry
                            key={entry.path}
                            entry={entry}
                            value={value}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
                        />
                    );
                })}
                <FlexBox className="ms-resource-card-body-footer" gap="sm" centerChildrenVertically>
                    <FlexBox.Fill flexBox>
                        {footerEntry?.path ? <ResourceCardMetadataEntry
                            entry={footerEntry}
                            value={footerEntry.value}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
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
        </FlexBox.Fill>
    );
};

const ResourceCardListBody = ({
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
                {metadata.map((entry) => {
                    const value = entry.value;
                    const column = columns.find(col => col.path === entry.path);
                    return (
                        <ResourceCardMetadataEntry
                            key={entry.path}
                            entry={entry}
                            value={value}
                            column={column}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
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

const cardBody = {
    grid: ResourceCardGridBody,
    list: ResourceCardListBody
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
