/*
 * Copyright 2022, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import {FormControl, FormGroup, Col, ControlLabel, Glyphicon, Button} from "react-bootstrap";
import {debounce, size, map, omit, toInteger} from "lodash";
import Message from "../../../I18N/Message";
import InfoPopover from "../../../widgets/widget/InfoPopover";
import React, {useState, useCallback, useEffect} from "react";
import tooltip from "../../../misc/enhancers/tooltip";

/**
 * @name WMSDomainAliases - component that renders domain aliases management form
 * @param {function} onChangeServiceProperty - callback to update service property
 * @param {object} service - WMS service being edited
 * @returns {JSX.Element}
 */
export default ({
    onChangeServiceProperty = () => {},
    service
}) => {
    const TooltipButton = tooltip(Button);
    const [aliases, setAliases] = useState(size(service.domainAliases) ? service.domainAliases : { 0: ''});
    const [key, setKey] = useState(1);

    const onDomainAliasChangeDebounced = useCallback(
        debounce((values) => {
            onChangeServiceProperty('domainAliases', values);
        }, 300),
        []
    );

    useEffect(() => {
        onDomainAliasChangeDebounced(aliases);
    }, [aliases]);

    const onChange = (k) => ({ target }) => setAliases((a) => ({...a, [k]: target.value}));
    const onRemoveAlias = (k) => () => setAliases((a) => ({...omit(a, [k])}));
    const onCreateAlias = () => {
        setKey((k) => k + 1);
        setAliases((a) => ({...a, [key]: ''}));
    };

    const elements = map(aliases, (el, k) => (
        <Col xs={12} className="form-group alias-item">
            <FormControl id={`alias-${k}`} key={`alias-${k}`} type="text" value={el} onChange={onChange(k)}/>
            {toInteger(k) !== 0 &&
            <TooltipButton
                tooltip={<Message msgId="catalog.domainAliases.removeAliasTooltip" />}
                tooltipid="add-alias-button"
                tooltipPosition="left"
                className="remove-alias"
                onClick={onRemoveAlias(k)}>
                <Glyphicon glyph="minus" />
            </TooltipButton>
            }
        </Col>
    ));
    return (
        <FormGroup controlId="domain-aliases" key="domain-aliases" className="mapstore-catalog-domain-aliases">
            <Col xs={12}>
                <ControlLabel><Message msgId="catalog.domainAliases.title" /></ControlLabel>
                &nbsp;
                <InfoPopover text={<Message msgId="catalog.domainAliases.helpTooltip" />} />
            </Col>
            {elements}
            <Col xs={12}>
                <TooltipButton
                    className="add-alias"
                    tooltip={<Message msgId="catalog.domainAliases.addAliasTooltip" />}
                    tooltipid="add-alias-button"
                    tooltipPosition="right"
                    onClick={onCreateAlias}>
                    <Glyphicon glyph={"plus"} />
                </TooltipButton>
            </Col>
        </FormGroup>
    );
};
