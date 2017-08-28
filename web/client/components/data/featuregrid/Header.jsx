const React = require('react');
const {Button, Grid, Row, Col, Glyphicon} = require('react-bootstrap');

module.exports = (props = {
    onDownloadToggle: () => {}
}) => {
    return (<Grid className="bg-body data-grid-top-toolbar" fluid style={{width: "100%"}}>
        <Row className="flex-center">
            <Col xs={4}>
                {props.children}
            </Col>
            <Col xs={4}>
                <div className="text-center text-primary"><strong>{props.title}</strong></div>
            </Col>
            <Col xs={4}>
                <Button onClick={props.onClose} style={{"float": "right"}} className="square-button no-border featuregrid-top-toolbar-margin">
                    <Glyphicon glyph="1-close"/>
                </Button>
            </Col>
        </Row>
    </Grid>);
};
