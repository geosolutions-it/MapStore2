

const React = require('react');
const PropTypes = require('prop-types');
const ResizableModal = require('../misc/ResizableModal');
const {Form, FormGroup, ControlLabel, FormControl, Button, Glyphicon} = require('react-bootstrap');
const Thumbnail = require('../maps/forms/Thumbnail');
const Select = require('react-select');
const assign = require('object-assign');


class BackgroundDialog extends React.Component{
    static propTypes = {
        onAdd: PropTypes.func,
        onClose: PropTypes.func,
        source: PropTypes.string,
        onSave: PropTypes.func,
        onUpdate: PropTypes.func,
        modalParams: PropTypes.object,
        add: PropTypes.bool,
        addParameters: PropTypes.func,
        updateThumbnail: PropTypes.func,
        unsavedChanges: PropTypes.bool,
        editing: PropTypes.bool,
        deletedId: PropTypes.string,
        thumbURL: PropTypes.string,
        addParameter: PropTypes.func
    };
    static defaultProps = {
        updateThumbnail: () => {},
        onClose: () => {},
        onSave: () => {},
        onUpdate: () => {},
        addParameters: () => {},
        addParameter: () => {},
        add: true,
        unsavedChanges: false,
        editing: false,
        modalParams: {}

    };
    state = {id: 0, additionalParameters: []};

    componentWillReceiveProps(nextProps) {
        if (!nextProps.modalParams) {
            this.setState({title: this.state.title || '', format: this.state.format || "image/png"});
        } else if (!this.props.modalParams || this.props.modalParams.id !== nextProps.modalParams.id) {
            this.setState({title: nextProps.modalParams && nextProps.modalParams.showModal && nextProps.modalParams.showModal.title || '',
                format: nextProps.modalParams && nextProps.modalParams.showModal && nextProps.modalParams.showModal.format || "image/png"});
        }

        if (!this.props.editing && nextProps.editing) {
            if (nextProps.modalParams && nextProps.modalParams.additionalParameters) {
                this.setState({additionalParameters: nextProps.modalParams.additionalParameters});
            }
        }

    }

    render() {
        return (<ResizableModal
        title={this.props.add ? "Add Background" : "Edit Current Background"}
        show={!!this.props.unsavedChanges || !!this.props.editing}
        fade
        onClose={() => { this.props.onClose(); this.resetParameters([]); }}
        buttons={[
            {
                text: this.props.add ? 'Add' : 'Save',
                bsStyle: 'primary',
                onClick: () => {
                    let obj = {source: this.props.thumbURL, title: this.state.title, format: this.state.format};
                    this.state.additionalParameters.forEach(parameter => obj[parameter.param] = parameter.val);
                    const extraParams = assign({}, obj, {source: this.props.thumbURL});
                    let parameters = assign({}, this.props.modalParams);
                    // add the edited source and additional parameters
                    if (this.props.editing) {
                        parameters = assign({}, this.props.modalParams, extraParams);
                        this.props.onUpdate(assign({}, this.props.modalParams, obj, {additionalParameters: assign({}, this.state.additionalParameters)}));
                    } else {
                        if (this.props.modalParams.showModal) {
                            this.props.onUpdate(assign({}, this.props.modalParams, {
                                showModal: assign({}, this.props.modalParams.showModal, obj),
                                additionalParameters: assign({}, this.state.additionalParameters)
                            }));
                        } else {
                            this.props.onUpdate(assign({}, this.props.modalParams, obj, {additionalParameters: assign({}, this.state.additionalParameters)}));
                        }
                    }
                    this.props.onSave(parameters, extraParams);
                    this.resetParameters([]);
                }
            }
        ]}>
        <Form style={{padding: 8}}>
            <FormGroup>
                <ControlLabel>Thumbnail</ControlLabel>
                <div className="shadow-soft" style={{width: 180, margin: 'auto'}}>
                    <Thumbnail
                    onUpdate = {(data, url) =>this.props.updateThumbnail(data, url)}
                    map={{
                        newThumbnail: this.props.deletedId ? null : this.props.thumbURL
                    }}/>
                </div>
            </FormGroup>
            <FormGroup>
                <ControlLabel>Title</ControlLabel>
                <FormControl
                    value={this.state.title}
                    placeholder="Enter displayed name"
                    onChange={event => this.setState({title: event.target.value})
                }/>
            </FormGroup>
            <FormGroup controlId="formControlsSelect">
                <ControlLabel>Format</ControlLabel>
                <Select
                    onChange = {event => this.setState({format: event.value})}
                    value={this.state.format}
                    clearable={false}
                    options={[{
                        label: 'image/png',
                        value: 'image/png'
                    }, {
                        label: 'image/png8',
                        value: 'image/png8'
                    }, {
                        label: 'image/jpeg',
                        value: 'image/jpeg'
                    }, {
                        label: 'image/vnd.jpeg-png',
                        value: 'image/vnd.jpeg-png'
                    }, {
                        label: 'image/gif',
                        value: 'image/gif'
                    }]}/>
            </FormGroup>
            <FormGroup>
                <ControlLabel>Style</ControlLabel>
                <Select
                    onChange = {event => this.props.onUpdate( assign({}, this.props.modalParams, {
                        showModal: assign({}, this.props.modalParams.showModal, {style: event.value})
                    } ) )
                    }
                    clearable={false}
                    value={this.props.modalParams && this.props.modalParams.showModal && this.props.modalParams.showModal.style || "default"}
                    options={[{
                        label: 'Default',
                        value: 'default'
                    }, {
                        label: 'Custom Style',
                        value: 'custom'
                    }]}/>
            </FormGroup>
            <FormGroup>
                <div style={{display: 'flex', alignItems: 'center'}}>
                    <ControlLabel style={{flex: 1}}>Additional Parameters </ControlLabel>
                    <Button
                        className="square-button-md"
                        style={{borderColor: 'transparent'}}
                        onClick={() => {
                            let cnt = this.state.additionalParameters.length;
                            this.setState({additionalParameters:
                        [...this.state.additionalParameters, {id: cnt, param: '', val: ''}]});
                            cnt++;
                        }}>
                        <Glyphicon glyph="plus"/>
                    </Button>
                </div>
                {this.state.additionalParameters.map((val) => (<div key={'val:' + val.id} style={{display: 'flex', marginTop: 8}}>
                <FormControl style={{flex: 1, marginRight: 8}} placeholder="Parameter" value = {val.param} onChange={ e => this.addAdditionalParameter(e.target.value, 'param', val.id, val.type)}/>
                <FormControl style={{flex: 1, marginRight: 8}} placeholder="Value" value = {val.val} onChange={ e => this.addAdditionalParameter(e.target.value, 'val', val.id, val.type)}/>
                <Select
                    style={{flex: 1, width: 90}}
                    onChange = {event => { this.addAdditionalParameter(val.val, 'val', val.id, event.value); val.type = event.value; }}
                    clearable={false}
                    value={ val.type || "string"}
                    options={[{
                        label: 'String',
                        value: 'String'
                    }, {
                        label: 'Number',
                        value: 'number'
                    },
                    {
                        label: 'boolean',
                        value: 'boolean'
                    }
                    ]}/>
                <Button onClick={() => this.setState({additionalParameters: this.state.additionalParameters.filter((aa) => val.id !== aa.id)} ) } className="square-button-md" style={{borderColor: 'transparent'}}><Glyphicon glyph="trash"/></Button>
                </div>))}
            </FormGroup>
        </Form>
    </ResizableModal>);
    }
    addAdditionalParameter = (event, key, id, type)=> {
        this.setState({
            additionalParameters:
            this.state.additionalParameters.map( v => {
                if (v.id === id) {
                    let modifiedKey = event;
                    if (key === 'val') {
                        switch (type) {
                            case 'number':
                                modifiedKey = Number(modifiedKey);
                            break;
                            case 'boolean':
                               modifiedKey = modifiedKey === 'true';
                            break;

                            default:
                            break;
                        }

                    }
                    v[key] = modifiedKey;

                }
                return v;
            })
        });
    }
    resetParameters = () => this.setState({id: 0, additionalParameters: []});
}

module.exports = BackgroundDialog;
