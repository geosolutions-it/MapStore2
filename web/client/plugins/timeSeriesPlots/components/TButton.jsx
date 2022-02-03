import classnames from 'classnames';
import React from 'react';
import {
    Button,
    OverlayTrigger,
    Glyphicon
} from 'react-bootstrap';

/**
 * Base button for the tools toolbar
 */
export default ({
    glyph,
    bsStyle,
    tooltip = <span></span>,
    tButtonClass,
    buttonSize,
    ...props
}) => {
    return (<OverlayTrigger placement="left" overlay={tooltip}>
        <Button
            {...props}
            bsStyle={bsStyle || "primary"}
            className={classnames(`square-button-${buttonSize}`, tButtonClass)}>
            <Glyphicon glyph={glyph} />
        </Button>
    </OverlayTrigger>);
};
