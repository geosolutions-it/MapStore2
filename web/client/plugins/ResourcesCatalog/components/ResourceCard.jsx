/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { forwardRef, useState } from 'react';
import Message from '../../../components/I18N/Message';
import Icon from './Icon';
import Button from '../../../components/layout/Button';
import Spinner from '../../../components/layout/Spinner';
import ResourceStatus from './ResourceStatus';
import ResourceCardActionButtons from './ResourceCardActionButtons';
import ALink from './ALink';
import moment from 'moment';
import castArray from 'lodash/castArray';
import { isObject, get } from 'lodash';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import tooltip from '../../../components/misc/enhancers/tooltip';
import { getTagColorVariables } from '../utils/ResourcesFiltersUtils';
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
            {!loading && glyph ? <><Icon type={iconType} glyph={glyph}/></> : null}
            {!loading && glyph && labelId ? ' ' : null}
            {!loading && labelId && !square ? <Message msgId={labelId} /> : null}
            {loading ? <Spinner /> : null}
        </ButtonWithTooltip>
    );
};

const ResourceCardWrapper = ({
    children,
    viewerUrl,
    readOnly,
    resource,
    active,
    interactive,
    ...props
}) => {
    const showViewerLink = !!(!readOnly && viewerUrl);
    return (
        <FlexBox
            column
            classNames={[
                '_relative',
                '_interactive',
                ...(active ? ['_active'] : [])
            ]}
            {...props}
        >
            {showViewerLink ? (
                <a
                    className="_absolute _fill"
                    href={viewerUrl}
                />
            ) : null}
            {children}
        </FlexBox>
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
            {entry.icon ? <><Icon {...entry.icon}/>{' '}</> : null}
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
                <Icon {...icon} />
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
    downloading,
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
    getResourceId
}) => {

    const headerEntry = metadata.find(entry => entry.target === 'header');
    const footerEntry = metadata.find(entry => entry.target === 'footer');

    return (
        <FlexBox.Fill className="ms-resource-card-body" flexBox column>
            <ResourceCardImage
                className="ms-resource-card-img ms-image-colors"
                src={thumbnailUrl}
                icon={icon}
            />
            <FlexBox.Fill
                flexBox
                column
                gap="sm"
                classNames={['_padding-sm']}
            >
                <FlexBox className="ms-resource-card-body-header" gap="sm" centerChildrenVertically>
                    <FlexBox.Fill flexBox>
                        <Text fontSize="md" ellipsis>
                            {(icon && !loading && !downloading) && (
                                <><Icon {...icon} />{' '}</>
                            )}
                            {headerEntry?.path ? <ResourceCardMetadataValue
                                entry={headerEntry}
                                value={get(resource, headerEntry.path)}
                                formatHref={formatHref}
                                readOnly={readOnly}
                                query={query}
                            /> : null}
                        </Text>
                    </FlexBox.Fill>
                    <ResourceStatus statusItems={statusItems} />
                </FlexBox>
                {metadata.filter(entry => !['header', 'footer'].includes(entry.target)).map((entry) => {
                    const value = get(resource, entry.path);
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
                            value={get(resource, footerEntry.path)}
                            formatHref={formatHref}
                            readOnly={readOnly}
                            query={query}
                        /> : null}
                    </FlexBox.Fill>
                    <FlexBox classNames={['_relative']} gap="xs">
                        {buttons.map(({ Component, name }) => {
                            return (
                                <Component
                                    key={name}
                                    resource={resource}
                                    viewerUrl={viewerUrl}
                                    component={ResourceCardButton}
                                    readOnly={readOnly}
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
                        getResourceId={getResourceId}
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
    downloading,
    metadata,
    resource,
    formatHref,
    readOnly,
    query,
    viewerUrl,
    options: optionsProp,
    buttons,
    columns,
    getResourceId
}) => {
    const options = [
        ...(buttons || []),
        ...(optionsProp || [])
    ];
    return (
        <FlexBox className="ms-resource-card-body" centerChildrenVertically>
            <div className="ms-resource-card-limit">
                {(icon && !loading && !downloading) && (
                    <Icon {...icon} />
                )}
                {(loading || downloading) && <Spinner />}
            </div>
            <FlexBox.Fill flexBox centerChildrenVertically>
                {metadata.map((entry) => {
                    const value = get(resource, entry.path);
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
                            getResourceId={getResourceId}
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
    downloading,
    statusItems,
    buttons = [],
    component,
    query,
    metadata = [],
    columns = [],
    getResourceTypesInfo = () => ({}),
    formatHref,
    getResourceId
}, ref) => {

    const resource = data;
    const {
        icon,
        viewerUrl,
        thumbnailUrl
    } = getResourceTypesInfo(resource) || {};

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
            className={`ms-resource-card ms-resource-card-type-${layoutCardsStyle} ms-main-colors${className ? ` ${className}` : ''}`}
        >
            {CardBody ? <CardBody
                icon={icon}
                loading={loading}
                downloading={downloading}
                metadata={metadata}
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
                getResourceId={getResourceId}
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
