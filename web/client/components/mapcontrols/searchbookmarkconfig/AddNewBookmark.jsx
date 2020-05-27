import React from 'react';
import PropTypes from 'prop-types';
import {Button, Col, ControlLabel, FormControl as FC, FormGroup, Glyphicon, OverlayTrigger, Tooltip} from "react-bootstrap";
import Message from "../../I18N/Message";
import {inRange} from 'lodash';
import localizedProps from '../../misc/enhancers/localizedProps';
const FormControl = localizedProps('placeholder')(FC);

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

    console.log("AddNewBookmark", props);

    const onChange = (event) => {
        const {value, name} = event.target;
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
            let inValid = null;
            if (['north', 'south'].includes(name)) {
                inValid = bboxAttributes[name] && !inRange(bboxAttributes[name], -90, 91) && "error";
            } else {
                inValid = bboxAttributes[name] && !inRange(bboxAttributes[name], -180, 181) && "error";
            }
            return inValid;
        }
        return null;
    };

    const toggleLayerVisibility = () =>{
        onPropertyChange("bookmark", {...bookmark, layerVisibilityReload: !layerVisibilityReload});
    };

    return (
        <div>
            <Col>
                <FormGroup validationState={validateFunc("title")}>
                    <ControlLabel><Message msgId="search.b_title" /></ControlLabel>
                    <FormControl
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
            <div style={{display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'}}>

                <div style={{width: "100%", padding: 4, maxWidth: 200}}>
                    <FormGroup validationState={validateFunc("north")}>
                        <span><Message msgId={"search.b_bbox_north"}/></span>
                        <FormControl placeholder="search.b_bbox_north_placeholder" min={-90} max={90} name={"north"} type="number" onChange={onChange} value={bboxAttributes.north || ""}/>
                    </FormGroup>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap"}}>
                    <div style={{flex: "1 1 0%", padding: 4, maxWidth: 200, minWidth: 200}}>
                        <FormGroup validationState={validateFunc("west")}>
                            <span><Message msgId={"search.b_bbox_west"}/></span>
                            <FormControl placeholder="search.b_bbox_west_placeholder" min={-180} max={180} name={"west"} type="number" onChange={onChange} value={bboxAttributes.west || ""}/>
                        </FormGroup>
                    </div>
                    <div style={{flex: "1 1 0%", padding: 4, maxWidth: 200, minWidth: 200}}>
                        <FormGroup validationState={validateFunc("east")}>
                            <span><Message msgId={"search.b_bbox_east"}/></span>
                            <FormControl placeholder="search.b_bbox_east_placeholder" min={-180} max={180} name={"east"} type="number" onChange={onChange} value={bboxAttributes.east || ""}/>
                        </FormGroup>
                    </div>
                </div>
                <div style={{width: "100%", padding: 4, maxWidth: 200}}>
                    <FormGroup validationState={validateFunc("south")}>
                        <span><Message msgId={"search.b_bbox_south"}/></span>
                        <FormControl placeholder="search.b_bbox_south_placeholder" min={-90} max={90} name={"south"} type="number" onChange={onChange} value={bboxAttributes.south || ""}/>
                    </FormGroup>
                </div>

            </div>
        </div>
    );
};

export default {Element: AddNewBookmark, validate};
