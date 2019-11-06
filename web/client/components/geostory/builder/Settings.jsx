/*
 * Copyright 2019, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React from 'react';
import {Form, FormControl, FormGroup, /* Checkbox, */ControlLabel} from 'react-bootstrap';
import Message from '../../I18N/Message';
import SwitchButton from '../../misc/switch/SwitchButton';
import Thumbnail from '../../maps/forms/Thumbnail';
import {withState, compose} from 'recompose';
import CheckboxTree from 'react-checkbox-tree';
import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import localizedProps from '../../misc/enhancers/localizedProps';

const InputLocalized = localizedProps("placeholder")(FormControl);

const updateTitle = compose(
    withState("storyTitle", "setStoryTitle", ({settings}) => settings.storyTitle),
    withState("expanded", "setExpanded", ({settings}) => settings.expanded || [])
);
/**
 * Shows list of settings for the story
 */
export default updateTitle(({
    expanded = [],
    storyTitle,
    items = [],
    settings,
    onToggleSettings = () => {},
    onUpdateSettings = () => {},
    setExpanded = () => {},
    setStoryTitle = () => {}
}) => {
    return (<Form className="ms-geostory-settings">
        <div className="text-center"><h4>Story Settings</h4></div>
        <FormGroup>
            <ControlLabel><Message msgId="Title"/></ControlLabel>
            <SwitchButton
                onChange={() => onToggleSettings("isTitleEnabled")}
                className="ms-geostory-settings-switch"
                checked={settings.isTitleEnabled}
            />
            <InputLocalized
                disabled={!settings.isTitleEnabled}
                value={storyTitle}
                onChange={evt => setStoryTitle(evt.target.value) }
                onBlur={evt => onUpdateSettings("storyTitle", evt.target.value) }
                placeholder="geostory.builder.settings.titlePlaceholder"
            />
        </FormGroup>
        <FormGroup>
            <ControlLabel><Message msgId="Logo"/></ControlLabel>
            <SwitchButton
                onChange={() => onToggleSettings("isLogoEnabled")}
                className="ms-geostory-settings-switch"
                checked={settings.isLogoEnabled}
            />
            {   settings.isLogoEnabled && (<Thumbnail
                className="ms-geostory-settings-logo"
                withLabel={false}
                onUpdate={(data, url) => onUpdateSettings("thumbnail", {data, url})}
                onError={(errors) => onUpdateSettings("thumbnailErrors", errors)}
                message={<Message msgId="geostory.builder.settings.logoPlaceholder"/>}
                suggestion=""
                thumbnailErrors={settings.thumbnailErrors}
                map={{
                    newThumbnail: settings.thumbnail && (settings.thumbnail.data || settings.thumbnail.url) || "NODATA"
                }}
            />)
            }
        </FormGroup>
        <FormGroup>
            <ControlLabel><Message msgId="Navbar"/></ControlLabel>
            <SwitchButton
                onChange={() => onToggleSettings("isNavbarEnabled")}
                className="ms-geostory-settings-switch"
                checked={settings.isNavbarEnabled}
            />
        </FormGroup>
        <FormGroup>
            <CheckboxTree
                showNodeIcon={false}
                nativeCheckboxes
                nodes={items}
                checked={settings.checked || []}
                expanded={expanded}
                onCheck={checkedVal => onUpdateSettings("checked", checkedVal)}
                onExpand={expandVal => setExpanded(expandVal)}
            />
        </FormGroup>
    </Form>);
}
);
