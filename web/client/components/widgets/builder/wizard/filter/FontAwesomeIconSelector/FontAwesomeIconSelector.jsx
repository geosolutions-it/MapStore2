/*
 * Copyright 2025, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState, useEffect } from 'react';
import { FormGroup, InputGroup } from 'react-bootstrap';
import { ControlledPopover } from '../../../../../styleeditor/Popover';
import tooltip from '../../../../../misc/enhancers/tooltip';
import ButtonRB from '../../../../../misc/Button';
import MarkerUtils from '../../../../../../utils/MarkerUtils';
import DebouncedFormControl from '../../../../../misc/DebouncedFormControl';
import { loadFontAwesome } from '../../../../../../utils/FontUtils';
import './FontAwesomeIconSelector.less';

const fsIcons = Object.keys(MarkerUtils.getGlyphs('fontawesome'));

const Button = tooltip(ButtonRB);

/**
 * Component for selecting Font Awesome icons
 * @memberof components.widgets.builder.wizard.filter
 * @name FontAwesomeIconSelector
 * @prop {string} value selected icon name
 * @prop {function} onChange returns the updated icon name
 */
function FontAwesomeIconSelector({
    value,
    onChange = () => {}
}) {
    const [filter, setFilter] = useState('');
    const [open, setOpen] = useState(false);
    const filteredIcons = fsIcons.filter(iconName =>
        iconName.toLowerCase().includes((filter || '').toLowerCase())
    );

    useEffect(() => {
        loadFontAwesome();
    }, []);

    function handleOnChange(iconName) {
        onChange(iconName);
        setOpen(false);
    }

    return (
        <ControlledPopover
            placement="bottom"
            open={open}
            onOpen={setOpen}
            content={
                <div className="ms-mark-list ms-filter-icon-list" style={{ height: 256 }}>
                    <div
                        style={{
                            position: 'sticky',
                            top: 0,
                            zIndex: 10,
                            background: 'var(--ms-main-bg, #ffffff)'
                        }}
                    >
                        <FormGroup style={{ margin: '0.5em 0' }}>
                            <InputGroup style={{ width: '100%', padding: '0 0.5em' }}>
                                <DebouncedFormControl
                                    type={'text'}
                                    value={filter}
                                    placeholder="Search icons..."
                                    style={{ zIndex: 0 }}
                                    onChange={eventValue => setFilter(eventValue)}
                                />
                            </InputGroup>
                        </FormGroup>
                    </div>
                    <ul>
                        {filteredIcons.map((iconName) => {
                            return (
                                <li
                                    key={iconName}>
                                    <Button
                                        tooltip={iconName}
                                        className="ms-mark-preview"
                                        active={iconName === value}
                                        onClick={() => handleOnChange(iconName)}
                                    >
                                        <i className={`fa fa-${iconName}`}/>
                                    </Button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            }>
            <Button className="ms-filter-icon-preview">
                {value ? (
                    <i className={`fa fa-${value}`}/>
                ) : (
                    <span style={{ fontSize: '12px', color: '#999' }}>Select icon...</span>
                )}
            </Button>
        </ControlledPopover>
    );
}

export default FontAwesomeIconSelector;

