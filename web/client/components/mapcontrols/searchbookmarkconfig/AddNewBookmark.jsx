/*
 * Copyright 2020, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/

import React from 'react';
import PropTypes from 'prop-types';
import {Button, Col, ControlLabel, FormControl as FC, FormGroup, Glyphicon, OverlayTrigger, Tooltip} from "react-bootstrap";
import Message from "../../I18N/Message";
import {inRange} from 'lodash';
import * as NumberFormControl from '../../I18N/IntlNumberFormControl';

import localizedProps from '../../misc/enhancers/localizedProps';
const FormControl = localizedProps('placeholder')(FC);
const IntlNumberFormControl = localizedProps('placeholder')(NumberFormControl);


const validate = (bookmark = {}) =>{
    const {options = {}, title = ''} = bookmark;
    const {south, north, west, east} = options;
    const yValid = inRange(south, -90, 91) && inRange(north, -90, 91);
    const xValid = inRange(west, -180, 181) && inRange(east, -180, 181);
    const titleValid = !!title.trim().length;
    return xValid && yValid && titleValid;
};

const AddNewBookmark = (props) => {
    const {onPropertyChange, bookmark = {}, bbox: currentBBox} = props;
    const {options: bboxAttributes = {}, title, layerVisibilityReload = false} = bookmark;

    const onChange = (value, name) => {
        const options = {...bookmark.options,  [name]: parseFloat(value)};
        onPropertyChange("bookmark", {...bookmark, options});
    };

    const setTitle = (value) => {
        onPropertyChange("bookmark", {...bookmark, title: value});
    };

    const applyCurrentBBox = () =>{
        const [minX, minY, maxX, maxY] = currentBBox;
        const bboxProperties = {
            west: parseFloat(minX) || 0,
            south: parseFloat(minY) || 0,
            east: parseFloat(maxX) || 0,
            north: parseFloat(maxY) || 0
        };

        const options = {...bookmark.options, ...bboxProperties};
        onPropertyChange("bookmark", {...bookmark, options});
    };

    const validateFunc = (name) =>{
        if (bboxAttributes[name]) {
            if (['north', 'south'].includes(name)) {
                return bboxAttributes[name] && !inRange(bboxAttributes[name], -90, 91) ? "error" : null;
            }
            return bboxAttributes[name] && !inRange(bboxAttributes[name], -180, 181) ? "error" : null;
        }
        return null;
    };

    const toggleLayerVisibility = () =>{
        onPropertyChange("bookmark", {...bookmark, layerVisibilityReload: !layerVisibilityReload});
    };

    return (
        <div id={"add-new-bookmark"}>
            <Col>
                <FormGroup validationState={validateFunc("title")}>
                    <ControlLabel><Message msgId="search.b_title" /></ControlLabel>
                    <FormControl
                        className={"bookmark-title"}
                        value={title}
                        name="title"
                        type="text"
                        placeholder={"search.b_title"}
                        onChange={({target}) => setTitle(target.value)}
                        onBlur={({target})=> setTitle(target.value.trim())}
                    />
                </FormGroup>
            </Col>
            <Col>
                <FormGroup style={{display: "flex", justifyContent: "space-between"}}>
                    <ControlLabel><Message msgId="search.b_bbox" /></ControlLabel>
                    <div id="bookmark-tools">
                        <OverlayTrigger
                            key="toggleLayer"
                            placement="top"
                            overlay={
                                <Tooltip id="search-bookmark-layer"><Message msgId={"search.b_layer_tooltip"}/></Tooltip>
                            }>
                            <Button key="toggleLayer" bsStyle="primary" className="square-button-md btn btn-default no-border" onClick={toggleLayerVisibility}>
                                <Glyphicon glyph={layerVisibilityReload ? "eye-open" : "eye-close"} />
                            </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                            key="getBBox"
                            placement="top"
                            overlay={
                                <Tooltip id="search-bookmark-bbox"><Message msgId={"search.b_bbox_tooltip"}/></Tooltip>
                            }>
                            <Button key="getBBox" bsStyle="primary" className="square-button-md btn btn-default no-border" onClick={applyCurrentBBox}>
                                <Glyphicon glyph="fit-cover" />
                            </Button>
                        </OverlayTrigger>
                    </div>
                </FormGroup>
            </Col>
            <div className={"bbox-field-group"}>

                <div className={"field-top-bottom"}>
                    <FormGroup validationState={validateFunc("north")}>
                        <ControlLabel><Message msgId={"search.b_bbox_north"}/></ControlLabel>
                        <IntlNumberFormControl
                            placeholder="search.b_bbox_north_placeholder"
                            min={-90} max={90}
                            name={"north"}
                            type="number"
                            onChange={(v)=>onChange(v, 'north')}
                            value={bboxAttributes.north}
                        />
                    </FormGroup>
                </div>
                <div className={"field-center-group"}>
                    <div className={"field-left-right"}>
                        <FormGroup validationState={validateFunc("west")}>
                            <ControlLabel><Message msgId={"search.b_bbox_west"}/></ControlLabel>
                            <IntlNumberFormControl
                                placeholder="search.b_bbox_west_placeholder"
                                min={-180} max={180}
                                name={"west"}
                                type="number"
                                onChange={(v)=>onChange(v, 'west')}
                                value={bboxAttributes.west}
                            />
                        </FormGroup>
                    </div>
                    <div className={"field-left-right"}>
                        <FormGroup validationState={validateFunc("east")}>
                            <ControlLabel><Message msgId={"search.b_bbox_east"}/></ControlLabel>
                            <IntlNumberFormControl
                                placeholder="search.b_bbox_east_placeholder"
                                min={-180} max={180}
                                name={"east"}
                                type="number"
                                onChange={(v)=>onChange(v, 'east')}
                                value={bboxAttributes.east}
                            />
                        </FormGroup>
                    </div>
                </div>
                <div className={"field-top-bottom"}>
                    <FormGroup validationState={validateFunc("south")}>
                        <ControlLabel><Message msgId={"search.b_bbox_south"}/></ControlLabel>
                        <IntlNumberFormControl
                            placeholder="search.b_bbox_south_placeholder"
                            min={-90} max={90}
                            name={"south"}
                            type="number"
                            onChange={(v)=>onChange(v, 'south')}
                            value={bboxAttributes.south}
                        />
                    </FormGroup>
                </div>

            </div>
        </div>
    );
};

AddNewBookmark.propTypes = {
    onPropertyChange: PropTypes.func,
    bookmark: PropTypes.object,
    bbox: PropTypes.array
};

export default {Element: AddNewBookmark, validate};
