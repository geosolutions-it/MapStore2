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
import Thumbnail from '../../maps/forms/Thumbnail';
import {withState, compose} from 'recompose';

const updateTitle = compose(
    withState("storyTitle", "setStoryTitle", ({settings}) => settings.storyTitle)
);
/**
 * Shows list of settings for the story
 */
export default updateTitle(({
    storyTitle,
    items,
    settings,
    onToggleSettings = () => {},
    onChangeTitle = () => {},
    onUpdateThumbnail = () => {},
    onErrorsThumbnail = () => {},
    onToggleVisibilityItem = () => {},
    setStoryTitle = () => {}
}) => (
    <Form className="ms-geostory-settings">
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
                onBlur={evt => onChangeTitle(evt.target.value) }
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
            <Thumbnail
                className="ms-geostory-settings-logo"
                withLabel={false}
                onUpdate={(data, url) => onUpdateThumbnail({data, url})}
                onError={(errors) => onErrorsThumbnail(errors)}
                message={<Message msgId="backgroundDialog.thumbnailMessage"/>}
                suggestion=""
                map={{
                    newThumbnail: settings.thumbnail && settings.thumbnail.url || "NODATA"
                }}
            />
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
                settings.isNavbarEnabled && items.map(({id, title, type}) => {
                    if (type === SectionTypes.IMMERSIVE) {
                        return (<div className="ms-geostory-settings-immersive-section">{title}</div>);
                    }
                    return (<Checkbox
                        onChange={() => onToggleVisibilityItem(id)}
                        checked={settings.visibleItems && settings.visibleItems[id]}
                    >
                        {title}
                    </Checkbox>);
                })
            }
        </FormGroup>
    </Form>
));
