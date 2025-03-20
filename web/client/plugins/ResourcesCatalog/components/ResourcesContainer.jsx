/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import HTML from '../../../components/I18N/HTML';
import ResourceCard from './ResourceCard';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';
import Spinner from '../../../components/layout/Spinner';

const ResourcesContainer = (props) => {
    const {
        resources,
        isCardActive,
        containerStyle,
        header,
        cardOptions,
        children,
        footer,
        cardLayoutStyle,
        loading,
        getMainMessageId = () => '',
        onSelect,
        theme = 'main',
        cardButtons,
        cardComponent,
        query,
        columns,
        metadata,
        getResourceStatus,
        formatHref,
        getResourceTypesInfo,
        getResourceId
    } = props;
    const messageId = getMainMessageId(props);
    return (
        <div
            className={`ms-resources-container${theme ? ` ms-${theme}-colors` : ''} _padding-lr-md`}>
            <div
                className="_relative _margin-auto"
                style={containerStyle}>
                {header}
                {children}
                <FlexBox
                    component="ul"
                    column={cardLayoutStyle === 'list'}
                    wrap={cardLayoutStyle !== 'list'}
                    gap={cardLayoutStyle === 'list' ? 'md' : 'lg'}
                    className={`ms-resources-container-${cardLayoutStyle}`}
                    classNames={['_relative', '_padding-tb-lg']}
                >
                    {resources.map((resource, idx) => {
                        const {
                            isProcessing,
                            isDownloading,
                            items: statusItems
                        } = getResourceStatus(resource);
                        // enable allowedOptions (menu cards)
                        const allowedOptions =  !isProcessing ? cardOptions : [];
                        return (
                            <li
                                key={`${idx}:${getResourceId(resource)}`}
                            >
                                <ResourceCard
                                    component={cardComponent}
                                    active={isCardActive(resource)}
                                    data={resource}
                                    options={allowedOptions}
                                    buttons={cardButtons}
                                    layoutCardsStyle={cardLayoutStyle}
                                    loading={isProcessing}
                                    readOnly={isProcessing}
                                    downloading={isDownloading}
                                    statusItems={statusItems}
                                    getResourceStatus={getResourceStatus}
                                    formatHref={formatHref}
                                    getResourceTypesInfo={getResourceTypesInfo}
                                    getResourceId={getResourceId}
                                    onClick={onSelect}
                                    query={query}
                                    columns={columns}
                                    metadata={metadata}
                                />
                            </li>
                        );
                    })}
                    {messageId ? <Text textAlign="center" classNames={['_margin-auto', '_padding-lr-sm']}>
                        <h1><HTML msgId={`${messageId}Title`}/></h1>
                        <p>
                            <HTML msgId={`${messageId}Content`}/>
                        </p>
                    </Text> : null}
                    {loading ? <FlexBox
                        centerChildren
                        classNames={[
                            resources.length ? '_absolute' : '_relative',
                            '_fill',
                            '_padding-lr-sm',
                            '_overlay',
                            '_corner-tl'
                        ]}
                    >
                        <Text fontSize="xxl">
                            <Spinner />
                        </Text>
                    </FlexBox> : null}
                </FlexBox>
                {footer}
            </div>
        </div>
    );
};

ResourcesContainer.defaultProps = {
    resources: [],
    loading: false,
    formatHref: () => '#',
    isCardActive: () => false,
    getMessageId: () => undefined,
    getResourceStatus: () => ({})
};

export default ResourcesContainer;
