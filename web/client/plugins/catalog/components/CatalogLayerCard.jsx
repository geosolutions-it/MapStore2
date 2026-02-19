/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, {useRef, useState } from 'react';
import { Glyphicon, Checkbox, SplitButton, MenuItem } from 'react-bootstrap';
import Button from '../../../components/layout/Button';
import ResourceCard from '../../ResourcesCatalog/components/ResourceCard';
import { isObject, isEmpty, trim, head } from 'lodash';
import Message from '../../../components/I18N/Message';
import SharingLinks from '../../../components/catalog/SharingLinks';
import { addLayerToMap } from '../../../utils/GeonodeUtils';
import { getRecordLinks } from '../../../utils/CatalogUtils';
import { getMessageById } from '../../../utils/LocaleUtils';
import { parseCustomTemplate } from '../../../utils/TemplateUtils';


const checkboxStyle = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    zIndex: 10,
    borderRadius: '4px',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};

const CatalogLayerCard = ({
    crs,
    clearModal,
    layers,
    modalParams,
    onAddBackgroundProperties,
    onAddBackground,
    source,
    onLayerAdd,
    onPropertiesChange,
    zoomToLayer,
    hideThumbnail,
    hideIdentifier,
    hideExpand,
    onError,
    catalogURL,
    catalogType,
    service,
    selectedService,
    showTemplate = false,
    metadataTemplate,
    record,
    authkeyParamNames,
    showGetCapLinks = true,
    addAuthentication,
    onCopy = () => { },
    buttonSize = 'small',
    currentLocale,
    defaultFormat,
    layerBaseConfig,
    messages,
    isChecked,
    onToggle,
    isPanel,
    readOnly
}) => {
    const record_ = record?.record || record;
    const [loading, setLoading] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const popoverContainerRef = useRef(null);

    const templateContent = () => {
        if (!showTemplate || !metadataTemplate) {
            return null;
        }
        const notAvailable = getMessageById(messages, "catalog.notAvailable");
        const parsedTemplate = parseCustomTemplate(
            metadataTemplate,
            record_.metadata,
            (attribute) => `${trim(attribute.substring(2, attribute.length - 1))} ${notAvailable}`
        );
        return parsedTemplate;
    }

    const getTitle = (title) => {
        return isObject(title) ? title[currentLocale] || title.default : title || '';
    };

    const onAddToMap = (data, serviceType = data.serviceType) => {
        setLoading(true);
        return addLayerToMap({
            record: { ...data, serviceType },
            service,
            defaultFormat,
            layerBaseConfig,
            authkeyParamNames,
            catalogType,
            crs,
            selectedService,
            onError,
            onLayerAdd,
            source,
            onAddBackground,
            onAddBackgroundProperties,
            zoomToLayer
        }).finally(() => {
            setLoading(false);
        });
    };

    const links = showGetCapLinks ? getRecordLinks(record_) : [];
    const showServices = !isEmpty(record_?.additionalOGCServices);
    const background = record_ && record_.background;
    const disabled = background && head((layers || []).filter(layer => layer.id === background.name ||
        layer.type === background.type && layer.source === background.source && layer.name === background.name));

    const buttons = [{
        Component: (props) => (
            showServices ?
                <div
                    className="catalog-split-button"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <SplitButton
                        title={<Glyphicon glyph="plus" />}
                        pullRight
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToMap(record_);
                        }}
                    >
                        <MenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToMap(record_);
                            }}
                        >
                            <Message msgId="catalog.additionalOGCServices.wms" />
                        </MenuItem>
                        {Object.keys(record_?.additionalOGCServices || {}).map((serviceType) => (
                            <MenuItem
                                key={serviceType}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToMap(record_?.additionalOGCServices?.[serviceType], serviceType);
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
                            onAddToMap(record_);
                        }
                    }}
                >
                    {loading ? <Glyphicon glyph="refresh" /> : <Glyphicon glyph="plus" />}
                </Button>

        ),
        name: 'addToMap',
        target: 'card-buttons'
    },
    ...(links.length > 0
        ? [{
            Component: () => (
                <SharingLinks
                    key="sharing-links"
                    popoverContainer={popoverContainerRef.current}
                    links={links}
                    onCopy={onCopy}
                    buttonSize={buttonSize}
                    addAuthentication={addAuthentication}
                />
            ),
            name: 'sharingLinks',
            target: 'card-buttons'
        }]
        : [])];

    const options = [
        {
            Component: () => (
                <li
                    className='_padding-lr-md _padding-tb-sm'
                    onClick={(e) => {
                        e.stopPropagation()
                        setShowFullContent(!showFullContent);
                    }}
                >
                    {showFullContent ? 'Hide Full Content' : 'Show Full Content'}
                </li>
            ),
            name: 'toggleDetails',
            target: 'card-options'
        }];


    return (
        <li
            key={`${record_?.identifier}`}
            ref={popoverContainerRef}
            aria-disabled={!!disabled}
            style={{
                minWidth: isPanel ? '100%' : 'calc(25% - 0.75rem)',
                maxWidth: isPanel ? '100%' : 'calc(25% - 0.75rem)',
                width: isPanel ? '100%' : 'calc(25% - 0.75rem)',
                position: 'relative',
                flexShrink: 0,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
        >
            <div
                style={{
                    ...checkboxStyle,
                    ...(hideThumbnail ? {
                        top: '8px',
                        left: '8px',
                    } : {})
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {!disabled && (<Checkbox
                    checked={isChecked}
                    onChange={(event) => {
                        event.stopPropagation();
                        onToggle(record, event.target.checked);
                    }}
                />)}

            </div>
            <ResourceCard
                data={{
                    ...record_,
                    '@extras': {
                        info: {
                            thumbnailUrl: record_?.thumbnail_url || record_?.thumbnail,
                            icon: { glyph: 'dataset' },
                            title: getTitle(record_?.title),
                            // creator: record_.metadata?.creator || record_?.creator || 'Unknown',
                            description: record_?.description,
                            metadataTemplate: templateContent(),
                            missingReference: record_?.isValid ? null : getMessageById(messages, "catalog.missingReference")
                        }
                    },
                }}
                options={options}
                buttons={buttons}
                readOnly={readOnly}
                hideThumbnail={hideThumbnail}
                onClick={() => {
                    if (!disabled) {
                        onToggle(record, !isChecked);
                    }
                }}
                layoutCardsStyle="grid"
                inline={isPanel ? true : false}
                metadata={[
                    { path: '@extras.info.title', target: 'header', showFullContent: showFullContent },
                    !hideIdentifier && { path: 'identifier', target: 'body', showFullContent: showFullContent },
                    //  must be red and italic and for geonode record we need to add the isValid property in the record to show the missing reference error
                    !record_?.isValid && {
                        path: '@extras.info.missingReference',
                        target: 'body',
                        showFullContent: true,
                    },
                    { path: '@extras.info.metadataTemplate', target: 'body', ellipsis: false, showFullContent: showFullContent, type: 'html' },
                    { path: '@extras.info.description', target: 'body', ellipsis: false, showFullContent: showFullContent },
                    { path: 'tags', itemColor: 'color', itemValue: 'name', showFullContent: false, type: 'tag', target: 'footer' }
                ]}
            />
            {loading && (
                <div className="ms-resource-card-loading" />
            )}
        </li>
    );
};

export default CatalogLayerCard;
