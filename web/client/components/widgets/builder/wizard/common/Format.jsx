/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { Col, FormControl, ControlLabel } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Message from '../../../../I18N/Message';
import HTML from '../../../../I18N/HTML';
import DisposablePopover from '../../../../misc/popover/DisposablePopover';

const Format = ({
    data,
    onChange = () => {},
    prefix = "yAxisOpts"
}) => {

    return (
        <>
            <Col componentClass={ControlLabel} sm={12}>
                <Message msgId="widgets.advanced.format" />
            </Col>
            <Col sm={4}>
                <ControlLabel>
                    <Message msgId="widgets.advanced.prefix" />
                    <FormControl placeholder="e.g.: ~" disabled={data.yAxis === false} value={data?.[prefix]?.tickPrefix} type="text" onChange={e => onChange(prefix + ".tickPrefix", e.target.value)} />
                </ControlLabel>
            </Col>
            <Col sm={4}>
                <ControlLabel>
                    <Message msgId="widgets.advanced.format" />
                </ControlLabel>
                <DisposablePopover placement="top" title={<Message msgId="widgets.advanced.examples"/>} text={<HTML msgId="widgets.advanced.formatExamples" />} />
                <FormControl placeholder="e.g.: .2s" disabled={data.yAxis === false} value={data?.[prefix]?.format} type="text" onChange={e => onChange(prefix + ".format", e.target.value)} />
            </Col>
            <Col sm={4}>
                <ControlLabel><Message msgId="widgets.advanced.suffix" /></ControlLabel>
                <FormControl placeholder="e.g.: W" disabled={data.yAxis === false} value={data?.[prefix]?.tickSuffix || data?.options?.seriesOptions?.[0].uom} type="text" onChange={e => onChange(prefix + ".tickSuffix", e.target.value)} />
            </Col>

        </>);
};
Format.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    prefix: PropTypes.string
};

export default Format;
