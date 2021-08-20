import React, { useState, useEffect } from "react";
import {
    Col,
    ControlLabel,
    FormGroup,
    Glyphicon,
    Tooltip,
    HelpBlock
} from "react-bootstrap";
import { Controlled as CodeMirror } from "react-codemirror2";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/material.css";
import "codemirror/mode/xml/xml";
import "codemirror/addon/lint/lint";
import "codemirror/addon/display/autorefresh";
import template from "lodash/template";
import isEqual from "lodash/isEqual";
import { cswGetRecordsXml } from "../../../../api/CSW";
import OverlayTrigger from "../../../misc/OverlayTrigger";
import Message from "../../../I18N/Message";

const options = {
    mode: "xml",
    theme: "material",
    lineNumbers: true,
    lineWrapping: true,
    autoRefresh: true,
    indentUnit: 2,
    tabSize: 2
};
const FilterInfo = ({ glyph = "info-sign", className = "", tooltip }) => (
    <OverlayTrigger placement={"bottom"} overlay={tooltip}>
        <Glyphicon
            style={{ marginLeft: 4 }}
            glyph={glyph}
            className={className}
        />
    </OverlayTrigger>
);

const tooltip = _type => {
    let msgId = `catalog.filter.${_type}.info`;
    if (_type === "error") msgId = `catalog.filter.error`;
    return (
        <Tooltip id={"filter"}>
            <Message msgId={msgId} />
        </Tooltip>
    );
};
const renderError = (
    <FilterInfo
        tooltip={tooltip("error")}
        glyph={"exclamation-mark"}
        className={"text-danger"}
    />
);
const renderHelpText = (
    <HelpBlock style={{ fontSize: 12 }}>
        <Message msgId={`catalog.filter.dynamic.helpText`} />
    </HelpBlock>
);

const FilterCode = ({ type, code, setCode, error }) => {
    const filterProp = `${type}Filter`;
    return (
        <FormGroup>
            <Col xs={4}>
                <ControlLabel>
                    <Message msgId={`catalog.filter.${type}.label`} />
                </ControlLabel>
                <FilterInfo tooltip={tooltip(type)} />
                {error[type] && renderError}
            </Col>
            <Col xs={8} style={{ marginBottom: 5 }}>
                <CodeMirror
                    value={code[filterProp]}
                    options={options}
                    onBeforeChange={(_, __, value) => {
                        setCode({ ...code, [filterProp]: value });
                    }}
                />
                {type === 'dynamic' && renderHelpText}
            </Col>
        </FormGroup>
    );
};

export default ({
    onChangeServiceProperty = () => {},
    filter: { staticFilter, dynamicFilter } = {}
} = {}) => {
    const [error, setError] = useState({});
    const [code, setCode] = useState({ staticFilter, dynamicFilter });

    const cmProps = { code, setCode, error };
    const isValid = value => {
        const _filter = template(cswGetRecordsXml)({
            filterXml: value,
            startPosition: 1,
            maxRecords: 4
        });
        return !new DOMParser()
            .parseFromString(_filter, "application/xml")
            ?.getElementsByTagName("parsererror")?.length;
    };

    useEffect(() => {
        const validFt = isValid(code.staticFilter);
        validFt &&
            !isEqual(code.staticFilter, staticFilter) &&
            onChangeServiceProperty("filter.staticFilter", code.staticFilter);
        setError({ ...error, "static": !validFt });
    }, [code.staticFilter]);

    useEffect(() => {
        const validFt = isValid(code.dynamicFilter);
        validFt &&
            !isEqual(code.dynamicFilter, dynamicFilter) &&
            onChangeServiceProperty("filter.dynamicFilter", code.dynamicFilter);
        setError({ ...error, dynamic: !validFt });
    }, [code.dynamicFilter]);

    return (
        <div className={"catalog-csw-filters"}>
            <FilterCode type={"static"} {...cmProps} />
            <FilterCode type={"dynamic"} {...cmProps} />
        </div>
    );
};
