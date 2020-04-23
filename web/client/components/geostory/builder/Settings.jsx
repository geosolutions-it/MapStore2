/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import {Form, FormControl, FormGroup, ControlLabel, Alert} from 'react-bootstrap';
import Message from '../../I18N/Message';
import SwitchButton from '../../misc/switch/SwitchButton';
import Thumbnail from '../../misc/Thumbnail';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import localizedProps from '../../misc/enhancers/localizedProps';
import CustomThemePicker from '../common/CustomThemePicker';
const InputLocalized = localizedProps("placeholder")(FormControl);

/**
 * Shows list of settings for the story
 */
export default ({
    items = [],
    settings,
    onToggleSettings = () => {},
    onUpdateSettings = () => {}
}) => {

    const [storyTitle, setStoryTitle] = useState(settings.storyTitle);
    const [expanded, setExpanded] = useState(settings.expanded || []);

    return (<Form className="ms-geostory-settings">
        <div className="text-center">
            <h4><Message msgId="geostory.builder.settings.headerTitle"/></h4>
        </div>
        <FormGroup>
            <div style={{ marginBottom: "10px"}}>
                <ControlLabel><Message msgId="geostory.builder.settings.title"/></ControlLabel>
                <SwitchButton
                    onChange={() => onToggleSettings("isTitleEnabled")}
                    className="ms-geostory-settings-switch"
                    checked={settings.isTitleEnabled}
                />
            </div>
            <InputLocalized
                disabled={!settings.isTitleEnabled}
                value={storyTitle}
                onChange={evt => setStoryTitle(evt.target.value) }
                onBlur={evt => onUpdateSettings("storyTitle", evt.target.value) }
                placeholder="geostory.builder.settings.titlePlaceholder"
                style = {{ marginTop: "10px"}}
            />
        </FormGroup>
        <FormGroup>
            <div style={{ marginBottom: "10px"}}>
                <ControlLabel><Message msgId="geostory.builder.settings.theme"/></ControlLabel>
            </div>
            <CustomThemePicker
                themeStyle={settings?.theme?.general}
                placement="right"
                disableBackgroundAlpha
                disableShadow
                onChange={(general) => onUpdateSettings("theme", { ...settings?.theme, general })}/>
        </FormGroup>
        <FormGroup>
            <div style={{ marginBottom: "10px"}}>
                <ControlLabel><Message msgId="geostory.builder.settings.logo"/></ControlLabel>
                <SwitchButton
                    onChange={() => onToggleSettings("isLogoEnabled")}
                    className="ms-geostory-settings-switch"
                    checked={settings.isLogoEnabled}
                />
            </div>
            {settings.isLogoEnabled && (
                <>
                <Thumbnail
                    thumbnail={settings?.thumbnail?.data || settings?.thumbnail?.url}
                    onUpdate={(data, files) => {
                        onUpdateSettings("thumbnail", { data, url: files?.[0]?.preview });
                        onUpdateSettings("thumbnailErrors", undefined);
                    }}
                    onRemove={() => {
                        onUpdateSettings("thumbnail", undefined);
                        onUpdateSettings("thumbnailErrors", undefined);
                    }}
                    onError={(errors) => onUpdateSettings("thumbnailErrors", errors)}
                    message={<Message msgId="geostory.builder.settings.logoPlaceholder"/>}
                    thumbnailOptions={{
                        width: 300,
                        height: 150,
                        type: 'image/png',
                        contain: true
                    }}
                />
                {settings.thumbnailErrors && settings.thumbnailErrors.length > 0 &&
                    <Alert bsStyle="danger" className="text-center">
                        <div><Message msgId="map.error"/></div>
                        {settings.thumbnailErrors.indexOf('FORMAT') !== -1 && <div><Message msgId="map.errorFormat" /></div>}
                        {settings.thumbnailErrors.indexOf('SIZE') !== -1 && <div><Message msgId="map.errorSize" /></div>}
                    </Alert>}
                </>)
            }
        </FormGroup>
        <FormGroup>
            <div style={{ marginBottom: "10px"}}>
                <ControlLabel><Message msgId="geostory.builder.settings.navbar"/></ControlLabel>
                <SwitchButton
                    onChange={() => onToggleSettings("isNavbarEnabled")}
                    className="ms-geostory-settings-switch"
                    checked={settings.isNavbarEnabled}
                />
            </div>
            {   settings.isNavbarEnabled && (<CheckboxTree
                showNodeIcon={false}
                nativeCheckboxes
                nodes={items}
                checked={settings.checked || []}
                expanded={expanded}
                onCheck={checkedVal => onUpdateSettings("checked", checkedVal)}
                onExpand={expandVal => setExpanded(expandVal)}
            />)}
        </FormGroup>
    </Form>);
};
