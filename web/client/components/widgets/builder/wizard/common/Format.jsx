/*
 * Copyright 2023, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import { InputGroup, ControlLabel, FormGroup } from 'react-bootstrap';
import PropTypes from 'prop-types';

import Message from '../../../../I18N/Message';
import HTML from '../../../../I18N/HTML';
import DisposablePopover from '../../../../misc/popover/DisposablePopover';
import DebouncedFormControl from '../../../../misc/DebouncedFormControl';

const Format = ({
    data,
    onChange = () => {},
    prefix = "yAxisOpts",
    formGroupClassName = 'form-group-flex',
    inputMaxWidth = 125
}) => {

    return (
        <>
            <FormGroup className={formGroupClassName}>
                <ControlLabel>
                    <Message msgId="widgets.advanced.prefix" />
                </ControlLabel>
                <InputGroup style={{ maxWidth: inputMaxWidth }}>
                    <DebouncedFormControl placeholder="e.g.: ~" value={data?.[prefix]?.tickPrefix} type="text" onChange={value => onChange(prefix + ".tickPrefix", value)} />
                </InputGroup>
            </FormGroup>
            <FormGroup className={formGroupClassName}>
                <ControlLabel>
                    <Message msgId="widgets.advanced.format" />{' '}
                    <DisposablePopover placement="top" title={<Message msgId="widgets.advanced.examples"/>} text={<HTML msgId="widgets.advanced.formatExamples" />} />
                </ControlLabel>
                <InputGroup style={{ maxWidth: inputMaxWidth }}>
                    <DebouncedFormControl placeholder="e.g.: .2s" value={data?.[prefix]?.format} type="text" onChange={value => onChange(prefix + ".format", value)} />
                </InputGroup>
            </FormGroup>
            <FormGroup className={formGroupClassName}>
                <ControlLabel><Message msgId="widgets.advanced.suffix" /></ControlLabel>
                <InputGroup style={{ maxWidth: inputMaxWidth }}>
                    <DebouncedFormControl placeholder="e.g.: W" value={data?.[prefix]?.tickSuffix || data?.options?.seriesOptions?.[0].uom} type="text" onChange={value => onChange(prefix + ".tickSuffix", value)} />
                </InputGroup>
            </FormGroup>
        </>);
};
Format.propTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    prefix: PropTypes.string
};

export default Format;
