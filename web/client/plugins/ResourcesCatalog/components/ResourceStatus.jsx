/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import Message from '../../../components/I18N/Message';
import PropTypes from 'prop-types';
import IconComponent from './Icon';
import tooltip from '../../../components/misc/enhancers/tooltip';
import FlexBox from '../../../components/layout/FlexBox';
import Text from '../../../components/layout/Text';

const Icon = ({ glyph, type, ...props }) => {
    return (<div {...props}><IconComponent type={type} glyph={glyph} /></div> );
};

const IconWithTooltip = tooltip(Icon);

const ResourceStatus = ({ statusItems = [] }) => {

    if (!statusItems?.length) {
        return null;
    }
    return (
        <FlexBox gap="sm" centerChildrenVertically classNames={["ms-resource-status", '_relative']}>
            {statusItems.map((item, idx) => {
                if (item.type === 'text') {
                    return (
                        <Text key={idx} classNames={['_padding-lr-xs']} fontSize="sm" className={item.variant ? `ms-${item.variant}-colors` : ''} >
                            <Message msgId={item.labelId} />
                        </Text>
                    );
                }
                if (item.type === 'icon') {
                    return (
                        <Text key={idx} fontSize="sm" className={item.variant ? `ms-${item.variant}-text` : ''} >
                            <IconWithTooltip
                                glyph={item.glyph}
                                type={item.iconType}
                                tooltip={item.tooltip}
                                tooltipParams={item.tooltipParams}
                                tooltipId={item.tooltipId}
                            />
                        </Text>
                    );
                }
                return null;
            })}
        </FlexBox>
    );
};

ResourceStatus.propTypes = {
    statusItems: PropTypes.array
};

ResourceStatus.defaultProps = {
    statusItems: []
};


export default ResourceStatus;
