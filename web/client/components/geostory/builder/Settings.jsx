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
/*
const nodes = [{
    value: 'Abstract',
    label: 'Abstract'
}, {
    value: 'Paragraph Section',
    label: 'Paragraph Section'
}, {
    value: 'Immersive Section 1',
    label: 'Immersive Section 1',
    children: [
        { value: 'Immersive Content 1', label: 'Immersive Content' },
        { value: 'Immersive Content 2', label: 'Immersive Content' }
    ]
}, {
    value: 'Title Section',
    label: 'Title Section'
}, {
    value: 'Immersive Section 2',
    label: 'Immersive Section 2',
    children: [
        { value: 'Immersive Content 3', label: 'Immersive Content' },
        { value: 'Immersive Content 4', label: 'Immersive Content' },
        { value: 'Immersive Content 5', label: 'Immersive Content' },
        { value: 'Immersive Content 6', label: 'Immersive Content' },
        { value: 'Immersive Content 7', label: 'Immersive Content' }
    ]
}];*/

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
    onChangeCheckedSettingsItems = () => {},
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
            <FormControl
                disabled={!settings.isTitleEnabled}
                value={storyTitle}
                onChange={evt => setStoryTitle(evt.target.value) }
                onBlur={evt => onUpdateSettings("storyTitle", evt.target.value) }
                placeholder={"title"} // TODO I18N
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
                message={<Message msgId="backgroundDialog.thumbnailMessage"/>}
                suggestion=""
                thumbnailErrors={settings.thumbnailErrors}
                map={{
                    newThumbnail: settings.thumbnail && settings.thumbnail.data || settings.thumbnail.url || "NODATA"
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
            {
                /* settings.isNavbarEnabled && items.map(({id, title, type}) => {
                    if (type === SectionTypes.IMMERSIVE) {
                        return (<div className="ms-geostory-settings-immersive-section">{title}</div>);
                    }
                    return (<Checkbox
                        onChange={() => onChangeCheckedSettingsItems(id)}
                        checked={settings.visibleItems && settings.visibleItems[id]}
                    >
                        {title}
                    </Checkbox>);
                }) */
            }
            <CheckboxTree
                showNodeIcon={false}
                nativeCheckboxes
                nodes={items}
                checked={settings.checked || []}
                expanded={expanded}
                onCheck={checkedVal => onChangeCheckedSettingsItems(checkedVal)}
                onExpand={expandVal => setExpanded(expandVal)}
            />
        </FormGroup>
    </Form>);
}
);
