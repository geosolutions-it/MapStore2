/*
 * Copyright 2018, GeoSolutions Sas.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');
const { head } = require('lodash');
const { Form, FormGroup, FormControl: FormControlRB, ControlLabel, Alert } = require('react-bootstrap');

const BorderLayout = require('../layout/BorderLayout');
const emptyState = require('../misc/enhancers/emptyState');
const Loader = require('../misc/Loader');

const SquareCard = require('../misc/cardgrids/SquareCard');
const withLocal = require("../misc/enhancers/localizedProps");

const Filter = withLocal('filterPlaceholder')(require('../misc/Filter'));
const FormControl = withLocal('placeholder')(FormControlRB);

const ResizableModal = require('../misc/ResizableModal');
const Portal = require('../misc/Portal');
const Message = require('../I18N/Message');
const HTML = require('../I18N/HTML');
const SVGPreview = require('./SVGPreview');

const SideGrid = emptyState(
    ({items}) => items.length === 0,
    {
        title: <Message msgId="styleeditor.filterMatchNotFound"/>,
        glyph: '1-stilo'
    }
)(require('../misc/cardgrids/SideGrid'));

const validateAlphaNumeric = ({title, _abstract}) => {
    const regex = /^[a-zA-Z0-9\s]*$/;
    const validTitle = title && title.match(regex) !== null;
    return validTitle && !_abstract || validTitle && _abstract && _abstract.match(regex) !== null;
};

/**
 * Component for rendering a grid of style templates.
 * @memberof components.styleeditor
 * @name StyleTemplates
 * @class
 * @prop {array} templates array of template object eg: [{styleId: 'id00125', types: ['linestring', 'vector'], title: 'Line', code: "@styleTitle '${styleTitle}';\n@styleAbstract '${styleAbstract}';\n\n* {\n\tstroke: #999999;\n}", preview: <SVGPreview ... />}]
 * @prop {string} geometryType one of 'point', 'linestring', 'polygon', 'vector' or 'raster'
 * @prop {bool} add display form modal to update styleSettings
 * @prop {array} styleSettings object of settings, default { title: 'Title', _abstract: 'Abstract' }
 * @prop {string} selectedStyle name of selected style template
 * @prop {function} onSelect triggered clicking on card, arg. {code, templateId, format}
 * @prop {function} onClose triggered clicking on X button
 * @prop {function} onSave triggered clicking on save button, arg. styleSettings object
 * @prop {function} onUpdate update settings, arg. styleSettings object
 * @prop {string} filterText
 * @prop {function} onFilter arg. text value from input filter
 */
const StyleTemplates = ({
    selectedStyle,
    add,
    styleSettings = {},
    geometryType = '',
    templates = [],
    filterText,
    availableFormats = [
        'sld',
        'css'
    ],
    formFields = [
        {
            key: 'title',
            placeholder: 'styleeditor.titleSettingsplaceholder',
            title: <Message msgId="styleeditor.titleSettings"/>
        },
        {
            key: '_abstract',
            placeholder: 'styleeditor.abstractSettingsplaceholder',
            title: <Message msgId="styleeditor.abstractSettings"/>
        }
    ],
    onFilter = () => {},
    onSelect = () => {},
    onClose = () => {},
    onSave = () => {},
    onUpdate = () => {},
    loading
}) => (
    <BorderLayout
        header={
            <div>
                <Filter
                    filterPlaceholder="styleeditor.templateFilterPlaceholder"
                    filterText={filterText}
                    onFilter={onFilter}/>
                <div className="text-center">
                    <small>{loading ? <Loader size={15} style={{ display: 'inline-block' }}/> : <Message msgId="styleeditor.createStyleFromTemplate"/>}</small>
                </div>
            </div>
        }>
        <SideGrid
            colProps={{}}
            cardComponent={SquareCard}
            onItemClick={({
                code,
                styleId: templateId,
                format
            }) => {
                onSelect({
                    code,
                    templateId,
                    format: format || 'css'
                });
                onUpdate({...styleSettings, title: head(templates.filter(({styleId}) => styleId === templateId).map(({title}) => title))});
            }}
            items={templates
                .filter(({title}) => !filterText || filterText && title.indexOf(filterText) !== -1)
                .filter(({types, format}) => (!types || head(types.filter(type => type === geometryType)) && availableFormats.indexOf(format) !== -1))
                .map(styleTemplate => ({
                    ...styleTemplate,
                    preview: styleTemplate?.preview?.config
                        ? <SVGPreview { ...styleTemplate.preview.config } />
                        : styleTemplate?.preview,
                    selected: styleTemplate.styleId === selectedStyle,
                    disabled: loading
                }))}/>
        <Portal>
            <ResizableModal
                show={!!add}
                fitContent
                title={<Message msgId="styleeditor.createStyleModalTitle"/>}
                onClose={() => onClose()}
                buttons={[
                    {
                        text: <Message msgId="save"/>,
                        bsStyle: 'primary',
                        disabled: !validateAlphaNumeric(styleSettings),
                        onClick: () => onSave(styleSettings)
                    }
                ]}>
                <Form>
                    <FormGroup controlId="styleTitle" validationState={!validateAlphaNumeric(styleSettings) && 'error'}>
                        {formFields.map(({title, placeholder, key}) => (<span key={key}>
                            <ControlLabel>{title}</ControlLabel>
                            <FormControl
                                type="text"
                                defaultValue={styleSettings[key]}
                                placeholder={placeholder}
                                onChange={event => onUpdate({...styleSettings, [key]: event.target.value})}/>
                        </span>))}
                    </FormGroup>
                    {!validateAlphaNumeric(styleSettings) && <Alert style={{margin: 0}} bsStyle="danger">
                        <HTML msgId="styleeditor.titleRequired"/>
                    </Alert>}
                </Form>
            </ResizableModal>
        </Portal>
    </BorderLayout>
);

module.exports = StyleTemplates;
