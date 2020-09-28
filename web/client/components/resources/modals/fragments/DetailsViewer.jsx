/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import Spinner from 'react-spinkit';
import { isNil } from 'lodash';

import Message from '../../../I18N/Message';

export default ({
    className,
    textContainerClassName,
    loading = false,
    detailsText
}) => (
    <div className={className}>
        {loading ?
            <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner" /> :
            isNil(detailsText) ?
                <div className={textContainerClassName}><Message msgId="maps.feedback.noDetailsAvailable" /></div> :
                <div className={textContainerClassName} dangerouslySetInnerHTML={{ __html: detailsText || '' }} />
        }
    </div>
);
