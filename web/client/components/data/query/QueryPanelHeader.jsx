const React = require('react');

const {Button, Glyphicon} = require('react-bootstrap');
module.exports = ({loadingError, onToggleQuery = () => {}} = {}) => (<div className="mapstore-block-width">
    <Button
        id="toc-query-close-button"
        key="menu-button"
        className="square-button no-border"
        onClick={() => onToggleQuery()}>
            <Glyphicon glyph="arrow-left"/>
    </Button>
        <div className="square-button pull-right no-border" style={{display: 'flex'}}><Glyphicon glyph={loadingError && "exclamation-mark" || "filter"} className={loadingError && "text-danger" || "text-primary"}/></div>
</div>);
