const React = require('react');
const Message = require('../../I18N/Message');
const {Button, Glyphicon, Grid, Row, Col} = require('react-bootstrap');
const Spinner = require('react-spinkit');
const {toPage} = require('../../../utils/FeatureGridUtils');

module.exports = (props = {
    loading: false,
    onPageChange: () => {}
}) => {
    const {page = 0, size = 0, resultSize = 0, maxPages = 0, total = 0} = toPage(props);
    return (<Grid className="bg-body data-grid-bottom-toolbar" fluid style={{width: "100%"}}>
        <Row className="featuregrid-toolbar-margin">
            <Col md={3}>
                <span><Message msgId={props.virtualScroll && "featuregrid.resultInfoVirtual" || "featuregrid.resultInfo"} msgParams={{start: page * size + 1, end: page * size + resultSize, total}} /></span>
            </Col>
            { !props.virtualScroll ? (<Col className="text-center" md={6}>
                <Button
                    key="first-page"
                    onClick={() => props.onPageChange(0)}
                    disabled={page === 0}
                    className="no-border first-page"><Glyphicon glyph="step-backward"/></Button>
                <Button
                    key="prev-page"
                    onClick={() => props.onPageChange(page - 1)}
                    disabled={page === 0}
                    className="no-border prev-page"><Glyphicon glyph="chevron-left"/></Button>
                <span key="page-info"><Message msgId="featuregrid.pageInfo" msgParams={{page: page + 1, totalPages: maxPages + 1}} /></span>
                <Button
                    key="next-page"
                    onClick={() => props.onPageChange(page + 1)}
                    className="no-border next-page"
                    disabled={page >= maxPages}
                ><Glyphicon glyph="chevron-right"/></Button>
                <Button
                    key="last-page"
                    onClick={() => props.onPageChange(maxPages)}
                    className="no-border last-page"
                    disabled={page >= maxPages}
                ><Glyphicon glyph="step-forward"/></Button>
            </Col>) : null} <Col md={3}>
                {props.loading ? <span style={{"float": "right"}} ><Message msgId="loading" /><Spinner spinnerName="circle" style={{"float": "right"}}noFadeIn/></span> : null}
            </Col>
        </Row></Grid>);
};
