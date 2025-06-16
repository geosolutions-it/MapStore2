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
import { getResourceStatus } from '../../../utils/ResourcesUtils';

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
        formatHref,
        hideThumbnail,
        target
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
                            items: statusItems
                        } = getResourceStatus(resource);
                        // enable allowedOptions (menu cards)
                        const allowedOptions =  !isProcessing ? cardOptions : [];
                        return (
                            <li
                                key={`${idx}:${resource?.id}`}
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
                                    statusItems={statusItems}
                                    formatHref={formatHref}
                                    onClick={onSelect}
                                    query={query}
                                    columns={columns}
                                    metadata={metadata}
                                    hideThumbnail={hideThumbnail}
                                    target={target}
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
    getMessageId: () => undefined
};

export default ResourcesContainer;
