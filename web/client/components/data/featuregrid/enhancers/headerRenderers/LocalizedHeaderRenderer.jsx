import React from 'react';
import { Tooltip } from "react-bootstrap";

import OverlayTrigger from "../../../../misc/OverlayTrigger";

import LocalizedString from '../../../../I18N/LocalizedString';

/**
 * Component that renders a localized header.
 * @param {object} props the component props
 * @param {object} props.column the column to render
 * @param {string} props.column.name the column name
 * @param {string} props.column.title the column title (localized)
 * @param {string} props.column.description the column description
 * @param {boolean} props.column.showTitleTooltip if true, the title will be shown as tooltip
 * @returns {object} the component
 */
export default ({column = {}}) => {
    const title = (column.title ? <LocalizedString value={column.title}/> : column.name) ?? "";
    if (column.showTitleTooltip) {
        return (<OverlayTrigger  placement="top" overlay={<Tooltip id={column.name}>{column.description}</Tooltip>}>
            <span>{title}</span>
        </OverlayTrigger>);
    }
    return title;
};
