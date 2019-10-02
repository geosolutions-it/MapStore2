/**
* Copyright 2018, GeoSolutions Sas.
* All rights reserved.
*
* This source code is licensed under the BSD-style license found in the
* LICENSE file in the root directory of this source tree.
*/
const React = require('react');
const {Grid, Row, Col, Button, Glyphicon} = require('react-bootstrap');

const filterEnhancer = require("../enhancers/filterstyles");
const DefaultStyle = filterEnhancer(require("../DefaultStyle"));
const AvailableStyles = filterEnhancer(require("../AvailableStyles"));

const StylesList = require("../StylesList");
const Message = require("../../../I18N/Message");

const enhancer = require("./enhancers/style");
const getAvailables = (styles, {allowedStyles = {}}) => {
    const allow = allowedStyles.style || [];
    return styles.filter(s => allow.indexOf(s.name) !== -1);
};

module.exports = enhancer(({styles = [], constraints = {}, setOption = () => {}, active = false, toggleModal = () => {}, modal}) => {
    return (
        <div style={{position: "relative"}}>
            <Grid className="ms-rule-editor" fluid style={{top: 0, bottom: 60, position: "absolute", width: '100%', display: active ? 'block' : 'none'}}>
                <Row className="ms-add-style">
                    <Col><Message msgId="rulesmanager.defstyle"/></Col>
                    <Col>
                        <Button className="square-button-md no-border" onClick={() => {
                            toggleModal("default");
                        }}>
                            <Glyphicon glyph="pencil" />
                        </Button>
                    </Col>
                </Row>
                <StylesList className={'ms-no-select'} styles={styles.filter(s => s.name === constraints.defaultStyle)}/>
                <Row className="ms-add-style">
                    <Col><Message msgId="rulesmanager.avstyle"/></Col>
                    <Col>
                        <Button className="square-button-md no-border" onClick={() => {
                            toggleModal("availables");
                        }}>
                            <Glyphicon glyph="pencil" />
                        </Button>
                    </Col>
                </Row>
                <div className="available-style-list">
                    <StylesList className={'ms-no-select'} styles={getAvailables(styles, constraints)}/>
                </div>
                <DefaultStyle show={modal === 'default'} selectedStyles={[].concat(constraints.defaultStyle || [])} styles={styles} onClose={toggleModal} onSelectionChange={(sel) => setOption({key: "defaultStyle", value: sel[sel.length - 1]})}/>
                <AvailableStyles show={modal === 'availables'}
                    styles={styles}
                    selectedStyles={constraints && constraints.allowedStyles && constraints.allowedStyles.style || []}
                    onClose={toggleModal}
                    onSelectionChange={(sel) => setOption({key: "allowedStyles", value: {style: sel}})}
                    clearAll={() => setOption({key: "allowedStyles", value: {style: []}})}
                    selectAll={() => setOption({key: "allowedStyles", value: {style: styles.map(s => s.name)}})}/>
            </Grid>
        </div>
    );
});
