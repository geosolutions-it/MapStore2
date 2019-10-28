/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import {Form, FormControl, FormGroup, Checkbox, ControlLabel} from 'react-bootstrap';
import Message from '../../I18N/Message';
import { SectionTypes } from './../../../utils/GeoStoryUtils';
import SwitchButton from '../../misc/switch/SwitchButton';
import Logo from './Logo';

/**
 * Shows list of settings for the story
 */
export default ({
    items,
    onToggleSettings = () => {},
    settings = {
        isLogoEnabled: true,
        isNavbarEnabled: false,
        isTitleEnabled: false
    }
}) => (
    <Form className="ms-geostory-settings">
        <FormGroup>
            <ControlLabel><Message msgId="Title"/></ControlLabel>
            <SwitchButton
                onChange={onToggleSettings("isTitleEnabled")}
                className="ms-geostory-settings-switch"

                checked={settings.isTitleEnabled}
            />
            <FormControl
                disabled={!settings.isTitleEnabled}
                placeholder={"title"}
            />
        </FormGroup>
        <FormGroup>
            <ControlLabel><Message msgId="Logo"/></ControlLabel>
            <SwitchButton
                onChange={onToggleSettings("isLogoEnabled")}
                className="ms-geostory-settings-switch"
                checked={settings.isLogoEnabled}
            />
            <Logo
                className="ms-geostory-settings-logo"
                src="https://demo.geo-solutions.it/mockups/mapstore2/geostory/assets/img/stsci-h-p1821a-m-1699x2000.jpg"
            />
        </FormGroup>
        <FormGroup>
            <ControlLabel><Message msgId="Navbar"/></ControlLabel>
            <SwitchButton
                onChange={onToggleSettings("isNavbarEnabled")}
                className="ms-geostory-settings-switch"
                checked={settings.isNavbarEnabled}
            />
        </FormGroup>
        <FormGroup>
            {
                settings.isNavbarEnabled && items.map(({title, type}) => {
                    if (type === SectionTypes.IMMERSIVE) {
                        return (<div className="ms-geostory-settings-immersive-section">{title}</div>);
                    }
                    return (<Checkbox
                        onChange={() => {}}
                        checked>
                        {title}
                    </Checkbox>);
                })
            }
        </FormGroup>
    </Form>
);
