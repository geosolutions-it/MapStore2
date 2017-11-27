const React = require('react');

const {Button, Glyphicon} = require('react-bootstrap');
module.exports = ({onToggleQuery = () => {}} = {}) => (<div className="mapstore-block-width">
    <Button
        id="toc-query-close-button"
        bsStyle="primary"
        key="menu-button"
        className="square-button"
        onClick={() => onToggleQuery()}>
            <Glyphicon glyph="arrow-left"/>
        </Button>
        <Button className="square-button pull-right no-border"><Glyphicon glyph="filter"/></Button>
</div>);
