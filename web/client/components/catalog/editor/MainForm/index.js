import React from 'react';
import Message from '../../../I18N/Message';

import MainForm from "./MainForm";
import { ControlLabel, Glyphicon, Tooltip, OverlayTrigger } from "react-bootstrap";

const TMSLabel = (<ControlLabel>
    <Message msgId="catalog.urlTemplate" />
    <OverlayTrigger
        placement="top"
        overlay={<Tooltip id="url-tooltip" >
            <Message msgId="catalog.tms.tooltip" />
        </Tooltip>}>
        <Glyphicon glyph="question-sign" />
    </OverlayTrigger>
</ControlLabel>);

const customizations = {
    tileProvider: {
        urlLabel: TMSLabel,
        urlPlaceholder: "example: https://{s}.myUrl.com/{variant}/{z}/{x}/{y}"
    }
};
const getCustomizations = (type) => customizations[type] || {};

export default (props) => <MainForm {...props} {...getCustomizations(props.service && props.service.type)} />;
