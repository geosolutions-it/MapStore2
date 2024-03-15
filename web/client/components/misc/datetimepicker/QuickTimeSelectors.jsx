/*
 * Copyright 2024, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from "react";
import PropTypes from 'prop-types';
import isEmpty from "lodash/isEmpty";

import Button from "../Button";
import {
    getDateFromTemplate,
    parseDateTimeTemplate
} from "../../../utils/TimeUtils";
import Message from "../../I18N/Message";
import moment from "moment";
import { DATE_TYPE } from "../../../utils/FeatureGridUtils";
import { getMessageById } from '../../../utils/LocaleUtils';

/**
 * QuickTimeSelector component
 */
const QuickTimeSelectors = ({
    quickDateTimeSelectors = [],
    type,
    onChangeDate = () => {},
    onChangeTime = () => {},
    onMouseDown = () => {}
}, { messages }) => {
    if (isEmpty(quickDateTimeSelectors)) {
        return null;
    }

    const onClickSelector = (val) => {
        const values = val?.split("/");
        if (!isEmpty(values)) {
            let startDate;
            values.forEach((value, index) => {
                const rangeType = index === 0 ? "start" : "end";
                let date = getDateFromTemplate(value, rangeType);
                if (index === 0) {
                    startDate = date;
                } else {
                    // reset date to current date when end date is invalid
                    date = date > startDate ? date : new Date();
                }
                const _type = values.length === 2 ? rangeType : type;
                setTimeout(() => onChangeDate(date, _type));
                if (type === DATE_TYPE.DATE_TIME) {
                    setTimeout(() => onChangeTime(date, _type));
                }
            });
        }
    };

    const getLocalizedMsgParam = (value) => {
        const [start, endDate] = value?.split("/") ?? [];
        const { placeholderKey, durationExp } =
                    parseDateTimeTemplate(endDate ? endDate : start);
        return {
            n: String(moment
                .duration(durationExp)
                .asDays()),
            todayNow: getMessageById(
                messages,
                `queryform.attributefilter.datefield.quickSelectors.${placeholderKey}`
            )?.toLowerCase()
        };
    };

    return (
        <div className="quick-time-selector">
            {quickDateTimeSelectors.map((selector) => {
                const labelId = selector.labelId;
                return (
                    <Button
                        className="selector-btn"
                        style={{ borderRadius: 10 }}
                        onMouseDown={onMouseDown}
                        onClick={() => onClickSelector(selector.value)}
                    >
                        {labelId ? (
                            <Message
                                msgId={labelId}
                                msgParams={{
                                    ...getLocalizedMsgParam(selector.value)
                                }}
                            />
                        ) : (
                            selector.label
                        )}
                    </Button>
                );
            })}
        </div>
    );
};

QuickTimeSelectors.contextTypes = {
    messages: PropTypes.object
};

export default QuickTimeSelectors;
