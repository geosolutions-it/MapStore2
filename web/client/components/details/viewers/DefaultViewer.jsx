/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Spinner from 'react-spinkit';
import LocaleUtils from '../../../utils/LocaleUtils';

import {NO_DETAILS_AVAILABLE} from '../../../actions/maps';

const DefaultViewer = ({detailsText = ""}, context) => detailsText ? <div className="ms-details-preview" dangerouslySetInnerHTML={{__html:
    detailsText === NO_DETAILS_AVAILABLE
        ? LocaleUtils.getMessageById(context.messages, "maps.feedback.noDetailsAvailable")
        : detailsText
}}/> : <Spinner spinnerName="circle" noFadeIn overrideSpinnerClassName="spinner"/>;
DefaultViewer.contextTypes = {messages: PropTypes.object};

export default DefaultViewer;
