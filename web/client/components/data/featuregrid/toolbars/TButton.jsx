const React = require('react');
const {Button, Glyphicon, Tooltip, OverlayTrigger} = require('react-bootstrap');
const hideStyle = {
    width: 0,
    padding: 0,
    borderWidth: 0
};
const normalStyle = {
};

const getStyle = (visible) => visible ? normalStyle : hideStyle;
module.exports = ({disabled, id, tooltip="", visible, onClick, glyph, active}) =>
    (<OverlayTrigger placement="top" overlay={<Tooltip id={`fe-${id}`}>{tooltip}</Tooltip>}>
        <Button key={id} bsStyle={active ? "success" : "primary"} disabled={disabled} id={`fg-${id}`}
            style={getStyle(visible)}
            className="square-button"
            onClick={() => !disabled && onClick()}>
            <Glyphicon glyph={glyph}/>
        </Button>
    </OverlayTrigger>);
