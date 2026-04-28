/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useRef, useState } from 'react';
import { Glyphicon, Checkbox, SplitButton, MenuItem } from 'react-bootstrap';
import Button from '../../layout/Button';
import ResourceCard from '../resources/ResourceCard';
import { isObject, isEmpty, trim, castArray } from 'lodash';
import Message from '../../I18N/Message';
import SharingLinks from './SharingLinks';
import { getRecordLinks } from '../../../utils/CatalogUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import { parseCustomTemplate } from '../../../utils/TemplateUtils';
import Spinner from '../../layout/Spinner';
import FlexBox from '../../layout/FlexBox';
import Text from '../../layout/Text';
import { getTagConfig } from '../../../utils/GeoNodeUtils';

const CatalogCard = ({
    hideThumbnail,
    hideIdentifier,
    // hideExpand,
    showTemplate = false,
    metadataTemplate,
    record,
    showGetCapLinks = true,
    addAuthentication,
    onCopy = () => { },
    buttonSize = 'small',
    currentLocale,
    messages,
    isChecked,
    onToggle,
    readOnly,
    loading,
    disabled,
    onAdd,
    onTagClick,
    filters,
    multiSelect,
    loadingRecords,
    includeAddToMap
}) => {
    const [showFullContent, setShowFullContent] = useState(false);
    const [isContentOverflowing, setIsContentOverflowing] = useState(false);
    const popoverContainerRef = useRef(null);

    const cardRef = (el) => {
        popoverContainerRef.current = el;
        if (el && !showFullContent) {
            const hasOverflow = Array.from(el.querySelectorAll('._ellipsis')).some(
                node => node.scrollWidth > node.clientWidth
            );
            setIsContentOverflowing(hasOverflow);
        }
    };

    const templateContent = () => {
        if (!showTemplate || !metadataTemplate) {
            return null;
        }
        const notAvailable = getMessageById(messages, "catalog.notAvailable");
        const parsedTemplate = parseCustomTemplate(
            metadataTemplate,
            record.metadata,
            (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} ${notAvailable}`
        );
        return parsedTemplate;
    };

    const getTitle = (title) => {
        return isObject(title) ? title[currentLocale] || title.default : title || '';
    };

    const onAddToMap = (data, serviceType = data.serviceType) => {
        onAdd({ ...data, serviceType });
    };

    const links = showGetCapLinks ? getRecordLinks(record) : [];
    const showServices = !isEmpty(record?.additionalOGCServices);
    const { filterKey: activeFilterKey, filterProp: activeFilterProp } = getTagConfig(record?.tagFilterType);
    const selectedTagValues = castArray(filters?.[activeFilterKey] || []);
    const tagsWithSelected = (record?.tags || []).map((tag) => ({
        ...tag,
        selected: selectedTagValues.includes(tag?.[activeFilterProp])
    }));

    const buttons = [
        ...(links.length > 0
            ? [{
                Component: () => (
                    <SharingLinks
                        key="sharing-links"
                        links={links}
                        onCopy={onCopy}
                        buttonSize={buttonSize}
                        addAuthentication={addAuthentication}
                    />
                ),
                name: 'sharingLinks',
                target: 'card-buttons'
            }]
            : []),
        ...(includeAddToMap ? [{
            Component: (props) => (
                showServices ?
                    <div
                        className="catalog-split-button"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        <SplitButton
                            pullRight
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToMap(record);
                            }}
                            title={loading ? <Spinner /> : <Glyphicon glyph="plus" />}
                        >
                            <MenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToMap(record);
                                }}
                            >
                                <Message msgId="catalog.additionalOGCServices.wms" />
                            </MenuItem>
                            {Object.keys(record?.additionalOGCServices || {}).map((serviceType) => (
                                <MenuItem
                                    key={serviceType}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAddToMap(record?.additionalOGCServices?.[serviceType], serviceType);
                                    }}
                                >
                                    <Message msgId={`catalog.additionalOGCServices.${serviceType}`} />
                                </MenuItem>
                            ))}
                        </SplitButton>
                    </div>
                    :
                    <Button
                        {...props}
                        className="square-button-md"
                        disabled={loading}
                        onClick={(e) => {
                            if (!disabled) {
                                e.stopPropagation();
                                onAddToMap(record);
                            }
                        }}
                    >
                        {loading ? <Spinner /> : <Glyphicon glyph="plus" />}
                    </Button>

            ),
            name: 'addToMap',
            target: 'card-buttons'
        }] : [])
    ];

    const options = [
        ...(isContentOverflowing || showFullContent ? [{
            Component: ({ component: ItemComponent, onClose }) => (
                <ItemComponent
                    onClick={() => {
                        setShowFullContent(!showFullContent);
                        onClose?.();
                    }}
                    labelId={showFullContent ? "catalog.hideFullContent" : "catalog.showFullContent"}
                />
            ),
            name: 'toggleDetails',
            target: 'card-options'
        }] : [])
    ];
    return (
        <li
            key={`${record?.identifier}`}
            ref={cardRef}
            aria-disabled={!!disabled}
            className={`ms-catalog-card${disabled ? 'disabled' : ''}${hideThumbnail ? ' ms-catalog-card--no-thumbnail' : ''}`}
        >
            {!disabled && multiSelect && !loadingRecords ? <Checkbox
                checked={isChecked}
                onChange={(event) => {
                    event.stopPropagation();
                    onToggle(record, event.target.checked, event);
                }}
            /> : null}
            <ResourceCard
                data={{
                    ...record,
                    tags: tagsWithSelected,
                    '@extras': {
                        info: {
                            thumbnailUrl: record?.thumbnail_url || record?.thumbnail,
                            icon: { glyph: 'dataset' },
                            title: getTitle(record?.title),
                            // creator: record.metadata?.creator || record?.creator || 'Unknown',
                            description: record?.description || record?.raw_abstract,
                            metadataTemplate: templateContent(),
                            missingReference: record?.isValid ? null : getMessageById(messages, "catalog.missingReference")
                        }
                    }
                }}
                options={options}
                buttons={disabled ? [] : buttons}
                readOnly={readOnly}
                hideThumbnail={hideThumbnail}
                onClick={() => {
                    if (!disabled) {
                        onToggle(record, !isChecked);
                    }
                }}
                active={isChecked}
                layoutCardsStyle="grid"
                metadata={[
                    { path: '@extras.info.title', target: 'header', showFullContent: showFullContent },
                    !hideIdentifier && { path: 'identifier', target: 'body', showFullContent: showFullContent },
                    //  must be red and italic and for geonode record we need to add the isValid property in the record to show the missing reference error
                    !record?.isValid && {
                        path: '@extras.info.missingReference',
                        target: 'body',
                        showFullContent: true
                    },
                    { path: '@extras.info.metadataTemplate', target: 'body', ellipsis: false, showFullContent: showFullContent, type: 'html' },
                    { path: '@extras.info.description', target: 'body', ellipsis: false, showFullContent: showFullContent },
                    record?.tags && {
                        path: 'tags',
                        filter: activeFilterKey,
                        itemColor: 'color',
                        itemValue: activeFilterProp,
                        itemSelected: 'selected',
                        clickable: !!onTagClick,
                        onClick: onTagClick
                            ? (tagValue) => onTagClick(tagValue, record)
                            : undefined,
                        showFullContent: true,
                        type: 'tag',
                        target: 'footer'
                    }
                ]}
            />
            {loading ? (
                <FlexBox centerChildren classNames={['_overlay', '_absolute', '_fill', '_corner-tl']}>
                    <Text fontSize="xxl">
                        <Spinner />
                    </Text>
                </FlexBox>
            ) : null}
        </li>
    );
};

export default CatalogCard;
