/**
 * Copyright 2016, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
const React = require('react');

const {Row, Col, Button, Glyphicon, Panel} = require('react-bootstrap');

const FilterField = require('./FilterField');
const ComboField = require('./ComboField');
const DateField = require('./DateField');

require('./queryform.css');

const LocaleUtils = require('../../utils/LocaleUtils');
const I18N = require('../I18N/I18N');

const GroupField = React.createClass({
    propTypes: {
        groupLevels: React.PropTypes.number,
        groupFields: React.PropTypes.array,
        filterFields: React.PropTypes.array,
        attributes: React.PropTypes.array,
        fieldWidth: React.PropTypes.string,
        removeButtonIcon: React.PropTypes.string,
        addButtonIcon: React.PropTypes.string,
        logicComboOptions: React.PropTypes.array,
        actions: React.PropTypes.object
    },
    contextTypes: {
        messages: React.PropTypes.object
    },
    getDefaultProps() {
        return {
            groupLevels: 1,
            groupFields: [],
            filterFields: [],
            attributes: [],
            removeButtonIcon: "glyphicon glyphicon-minus",
            addButtonIcon: "glyphicon glyphicon-plus",
            logicComboOptions: [
                {logic: "OR", name: "queryform.groupField.any"},
                {logic: "AND", name: "queryform.groupField.all"},
                {logic: "NOR", name: "queryform.groupField.none"}
            ],
            actions: {
                onAddGroupField: () => {},
                onAddFilterField: () => {},
                onRemoveFilterField: () => {},
                onUpdateFilterField: () => {},
                onUpdateExceptionField: () => {},
                onUpdateLogicCombo: () => {},
                onRemoveGroupField: () => {},
                onChangeCascadingValue: () => {}
            }
        };
    },
    getComboValues(selected, attributes) {
        if (selected && selected.dependson) {
            // ///////////////////////////////////////////////////////////////////////////
            // Retrieving the filterField which depends the selected one (the main field)
            // ///////////////////////////////////////////////////////////////////////////
            let filterField = this.props.filterFields.filter((field) => field.attribute === selected.dependson.field)[0];
            if (filterField && filterField.value) {
                // The complete attribute config object
                let attribute = attributes.filter((attr) => attr.id === filterField.attribute)[0];
                // The reference ID of the related attribute field value
                let attributeRefId = attribute.values.filter((value) => value.name === filterField.value)[0][selected.dependson.from];
                // The filtered values that match the attribute refId
                let values = selected.values.filter((value) => value[selected.dependson.to] === attributeRefId);

                return (selected && selected.type === "list" ? values.map((value) => value.name || value) : null);
            }
        }

        return (selected && selected.type === "list" ? selected.values.map((value) => value.name || value) : null);
    },
    renderFilterField(filterField) {
        let selectedAttribute = this.props.attributes.filter((attribute) => attribute.id === filterField.attribute)[0];
        let comboValues = this.getComboValues(selectedAttribute, this.props.attributes);

        return (
            <Row key={filterField.rowId}>
                <Col xs={10}>
                    <FilterField
                        attributes={this.props.attributes}
                        filterField={filterField}
                        operatorOptions={selectedAttribute && selectedAttribute.type === "list" ? ["="] : ["=", ">", "<", ">=", "<=", "<>", "><"]}
                        onUpdateField={this.props.actions.onUpdateFilterField}
                        onUpdateExceptionField={this.props.actions.onUpdateExceptionField}
                        onChangeCascadingValue={this.props.actions.onChangeCascadingValue}>
                        <ComboField
                            attType="list"
                            fieldOptions={comboValues ? comboValues : []}
                            comboFilterType={"contains"}/>
                        <DateField attType="date"
                            operator={filterField.operator}/>
                    </FilterField>
                </Col>
                <Col xs={2}>
                    <Button id="remove-filter-field" onClick={() => this.props.actions.onRemoveFilterField(filterField.rowId)}>
                        <Glyphicon glyph={this.props.removeButtonIcon}/>
                    </Button>
                </Col>
            </Row>
        );
    },
    renderGroupHeader(groupField) {
        const removeButton = groupField.groupId ?
            (
                <Col xs={1}>
                    <Button onClick={() => this.props.actions.onRemoveGroupField(groupField.id)}>
                        <Glyphicon glyph={this.props.removeButtonIcon}/>
                    </Button>
                </Col>
            ) : (
                <Col xs={0} lgHidden={true}>
                    <span/>
                </Col>
            );

        return (
            <Row className="logicHeader">
                {removeButton}
                <Col xs={4}>
                    <div style={{"paddingTop": "9px", "float": "left"}}><I18N.Message msgId={"queryform.form.group_label_a"}/></div>
                    <div style={{"float": "right"}}>
                        <ComboField
                            fieldOptions={
                                this.props.logicComboOptions.map((opt) => {
                                    return LocaleUtils.getMessageById(this.context.messages, opt.name);
                                })
                            }
                            fieldName="logic"
                            style={{width: "140px", marginTop: "3px"}}
                            fieldRowId={groupField.id}
                            fieldValue={
                                LocaleUtils.getMessageById(this.context.messages,
                                    this.props.logicComboOptions.filter((opt) => groupField.logic === opt.logic)[0].name)
                            }
                            onUpdateField={this.updateLogicCombo}/>
                    </div>
                </Col>
                <Col xs={7}>
                    <div style={{"paddingTop": "9px"}}><span><I18N.Message msgId={"queryform.form.group_label_b"}/></span></div>
                </Col>
            </Row>
        );
    },
    renderGroupField(groupField) {
        const filterFields = this.props.filterFields.filter((filterField) => filterField.groupId === groupField.id);
        const groupFields = this.props.groupFields.filter((group) => group.groupId === groupField.id);

        const fields = [...filterFields, ...groupFields];

        const container = fields.map((field) => {
            let element;
            if (field.rowId !== undefined) {
                element = this.renderFilterField(field);
            } else {
                element = this.renderGroupField(field);
            }

            return element;
        });

        const removeButton = groupField.index <= this.props.groupLevels ?
            (
                <Button id="add-condition-group" onClick={() => this.props.actions.onAddGroupField(groupField.id, groupField.index)}>
                    <Glyphicon glyph={this.props.addButtonIcon}/><I18N.Message msgId={"queryform.form.add_group"}/></Button>
            ) : (
                <span/>
            );

        return (
            <Panel key={groupField.id}>
                {this.renderGroupHeader(groupField)}
                {container}
                <Row>
                    <Col xs={3}>
                        <Button id="add-filter-field" onClick={() => this.props.actions.onAddFilterField(groupField.id)}>
                            <Glyphicon glyph={this.props.addButtonIcon}/>
                            <I18N.Message msgId={"queryform.form.add_condition"}/>
                        </Button>
                    </Col>
                    <Col xs={9}>
                        {removeButton}
                    </Col>
                </Row>
            </Panel>
        );
    },
    render() {
        return (
            <div>{this.props.groupFields.filter(g => !g.groupId).map(this.renderGroupField)}</div>
        );
    },
    updateLogicCombo(groupId, name, value) {
        const logic = this.props.logicComboOptions.filter((opt) => {
            if (value === LocaleUtils.getMessageById(this.context.messages, opt.name)) {
                return opt;
            }
        })[0].logic;
        this.props.actions.onUpdateLogicCombo(groupId, logic);
    }
});

module.exports = GroupField;
