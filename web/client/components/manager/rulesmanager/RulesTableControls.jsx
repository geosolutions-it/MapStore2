const PropTypes = require('prop-types');
/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const {ButtonGroup, Button, Glyphicon} = require('react-bootstrap');
const Modal = require('../../misc/Modal');

const Message = require('../../I18N/Message');

class RulesTableControls extends React.Component {
    static propTypes = {
        moveRulesToPage: PropTypes.func,
        updateActiveRule: PropTypes.func,
        deleteRules: PropTypes.func,
        selectedRules: PropTypes.array,
        rulesPage: PropTypes.number,
        rulesCount: PropTypes.number,
        bsSize: PropTypes.string
    };

    static defaultProps = {
        moveRulesToPage: () => {},
        updateActiveRule: () => {},
        deleteRules: () => {},
        selectedRules: []
    };

    state = {
        showModal: false
    };

    getAddRuleHandler = () => {
        return function() {
            this.props.updateActiveRule({}, "new", false);
        }.bind(this);
    };

    getEditRuleHandler = () => {
        return function() {
            this.props.updateActiveRule(this.props.selectedRules[0], "edit", false);
        }.bind(this);
    };

    render() {
        const bsSize = this.props.bsSize;
        const numberOfPages = Math.ceil(this.props.rulesCount / 10);
        const firstPage = this.props.rulesPage === 1 || !this.props.rulesPage;
        const lastPage = this.props.rulesPage === numberOfPages || !this.props.rulesPage;
        return (
            <ButtonGroup className="rules-controls">
                <Button bsSize={bsSize} bsStyle="primary" onClick={this.getAddRuleHandler()}>
                    <Glyphicon glyph="plus"/>
                </Button>
                { this.props.selectedRules.length > 0 &&
                    <Button bsSize={bsSize} bsStyle="primary" onClick={() => this.setState({showModal: true})}>
                        <Glyphicon glyph="minus"/>
                    </Button>
                }
                { this.props.selectedRules.length === 1 &&
                    <Button bsSize={bsSize} bsStyle="primary" onClick={this.getEditRuleHandler()}>
                        <Glyphicon glyph="pencil"/>
                    </Button>
                }
                { this.props.selectedRules.length > 0 && !firstPage &&
                    <Button bsSize={bsSize} bsStyle="primary"
                        onClick={() => this.props.moveRulesToPage(1, false, this.props.selectedRules)}>
                        <Glyphicon glyph="fast-backward"/>
                    </Button>
                }
                { this.props.selectedRules.length > 0 && !firstPage &&
                    <Button bsSize={bsSize} bsStyle="primary"
                        onClick={() => this.props.moveRulesToPage(this.props.rulesPage - 1, false, this.props.selectedRules)}>
                        <Glyphicon glyph="step-backward"/>
                    </Button>
                }
                { this.props.selectedRules.length > 0 && !lastPage &&
                    <Button bsSize={bsSize} bsStyle="primary"
                        onClick={() => this.props.moveRulesToPage(this.props.rulesPage + 1, true, this.props.selectedRules)}>
                        <Glyphicon glyph="step-forward"/>
                    </Button>
                }
                { this.props.selectedRules.length > 0 && !lastPage &&
                    <Button bsSize={bsSize} bsStyle="primary"
                        onClick={() => this.props.moveRulesToPage(numberOfPages, true, this.props.selectedRules)}>
                        <Glyphicon glyph="fast-forward"/>
                    </Button>
                }
                <Modal show={this.state.showModal} {...this.props} bsSize="small">
                    <Modal.Header closeButton onHide={() => this.setState({showModal: false})}>
                        <Modal.Title>
                            <Message msgId={"rulesmanager.deleteModal"}/>
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{textAlign: "center"}}>
                            <Message msgId={"rulesmanager.selectedRulesDelete"}/>
                    </Modal.Body>
                    <Modal.Footer style={{textAlign: "center"}}>
                        <Button bsSize={bsSize} bsStyle="primary" onClick={() => {
                            this.props.deleteRules();
                            this.setState({showModal: false});
                        }}>
                            <Message msgId={"rulesmanager.deleteButton"}/>
                        </Button>
                        <Button bsSize={bsSize} bsStyle="primary" onClick={() => this.setState({showModal: false})}>
                            <Message msgId={"rulesmanager.cancelButton"}/>
                        </Button>
                    </Modal.Footer>
                </Modal>
            </ButtonGroup>
        );
    }
}

module.exports = RulesTableControls;
