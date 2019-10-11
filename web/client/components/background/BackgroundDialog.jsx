const React = require('react');
const PropTypes = require('prop-types');
const Select = require('react-select');
const assign = require('object-assign');
const uuidv1 = require('uuid/v1');
const {pick, omit, get, keys, isNumber, isBoolean} = require('lodash');
const ResizableModal = require('../misc/ResizableModal');
const {Form, FormGroup, ControlLabel, FormControl, Button, Glyphicon} = require('react-bootstrap');
const Thumbnail = require('../maps/forms/Thumbnail');
const Loader = require('../misc/Loader');


class BackgroundDialog extends React.Component {
    static propTypes = {
        loading: PropTypes.bool,
        editing: PropTypes.bool,
        layer: PropTypes.object,
        capabilities: PropTypes.object,
        onAdd: PropTypes.func,
        onClose: PropTypes.func,
        source: PropTypes.string,
        onSave: PropTypes.func,
        addParameters: PropTypes.func,
        updateThumbnail: PropTypes.func,
        thumbURL: PropTypes.string,
        title: PropTypes.string,
        format: PropTypes.string,
        style: PropTypes.string,
        thumbnail: PropTypes.object,
        additionalParameters: PropTypes.object,
        addParameter: PropTypes.func
    };
    static defaultProps = {
        updateThumbnail: () => {},
        onClose: () => {},
        onSave: () => {},
        addParameters: () => {},
        addParameter: () => {},
        loading: false,
        editing: false,
        layer: {},
        capabilities: {},
        title: '',
        format: 'image/png',
        thumbnail: {},
        additionalParameters: {}

    };

    constructor(props) {
        super(props);
        const pickedProps = pick(this.props, 'title', 'format', 'style', 'thumbnail');
        const newState = assign({}, pickedProps, {additionalParameters: this.assignParameters(this.props.additionalParameters)});
        this.state = newState;
    }

    state = {title: '', format: 'image/png', thumbnail: {}, additionalParameters: []};

    renderLoading() {
        return <Loader size={50} style={{margin: '8px auto'}}/>;
    }

    renderStyleSelector() {
        return this.props.capabilities ? (
            <FormGroup>
                <ControlLabel>Style</ControlLabel>
                <Select
                    onChange={event => this.setState({style: event ? event.value : undefined})}
                    clearable
                    value={this.state.style}
                    options={(this.props.capabilities.availableStyles || []).map(({name}) => ({label: name, value: name}))}/>
            </FormGroup>
        ) : null;
    }

    render() {
        return (<ResizableModal
            title={this.props.editing ? "Edit Current Background" : "Add Background"}
            show
            fade
            onClose={() => { this.props.onClose(); this.resetParameters(); }}
            buttons={this.props.loading ? [] : [
                {
                    text: this.props.editing ? 'Save' : 'Add',
                    bsStyle: 'primary',
                    onClick: () => {
                        const backgroundId = this.props.editing ? this.props.layer.id : uuidv1();
                        this.props.updateThumbnail(this.state.thumbnail.data, this.state.thumbnail.url, backgroundId);
                        this.props.onSave(assign({}, this.props.layer, omit(this.state, 'thumbnail'), this.props.editing ? {} : {id: backgroundId},
                            {
                                additionalParameters: omit(
                                    this.state.additionalParameters.reduce((accum, p) => assign(accum, {[p.param]: p.val}), {}),
                                    ['source', 'format', 'style', 'title']
                                ),
                                thumbURL: this.state.thumbnail.url,
                                group: 'background'
                            }));
                        this.resetParameters();
                    }
                }
            ]}>
            {this.props.loading ? this.renderLoading() : <Form style={{padding: 8}}>
                <FormGroup>
                    <ControlLabel>Thumbnail</ControlLabel>
                    <div className="shadow-soft" style={{width: 180, margin: 'auto'}}>
                        <Thumbnail
                            onUpdate = {(data, url) => this.setState({thumbnail: {data, url}})}
                            map={{
                                newThumbnail: get(this.state.thumbnail, 'url')
                            }}
                        />
                    </div>
                </FormGroup>
                <FormGroup>
                    <ControlLabel>Title</ControlLabel>
                    <FormControl
                        value={this.state.title}
                        placeholder="Enter displayed name"
                        onChange={event => this.setState({title: event.target.value})}/>
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
                        }]}
                    />
                </FormGroup>
                {this.renderStyleSelector()}
                <FormGroup>
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <ControlLabel style={{flex: 1}}>Additional Parameters </ControlLabel>
                        <Button
                            className="square-button-md"
                            style={{borderColor: 'transparent'}}
                            onClick={() => {
                                const cnt = Math.max(...(this.state.additionalParameters.length > 0 ?
                                    this.state.additionalParameters.map(p => p.id) : [-1])) + 1;
                                this.setState({additionalParameters:
                                    [...this.state.additionalParameters, {id: cnt, type: 'string', param: '', val: ''}]});
                            }}>
                            <Glyphicon glyph="plus"/>
                        </Button>
                    </div>
                    {this.state.additionalParameters.map((val) => (<div key={'val:' + val.id} style={{display: 'flex', marginTop: 8}}>
                        <FormControl
                            style={{flex: 1, marginRight: 8, minWidth: 0}}
                            placeholder="Parameter"
                            value={val.param}
                            onChange={e => this.addAdditionalParameter(e.target.value, 'param', val.id, val.type)}/>
                        {val.type === 'boolean' ?
                            <div style={{flex: 1, marginRight: 8}}>
                                <Select
                                    onChange={e => this.addAdditionalParameter(e.value, 'val', val.id, val.type)}
                                    clearable={false}
                                    value={val.val}
                                    options={[{
                                        label: 'True',
                                        value: true
                                    }, {
                                        label: 'False',
                                        value: false
                                    }]}/>
                            </div> :
                            <FormControl
                                style={{flex: 1, marginRight: 8, minWidth: 0}}
                                placeholder="Value"
                                value = {val.val.toString()}
                                onChange={e => this.addAdditionalParameter(e.target.value, 'val', val.id, val.type)}/>}
                        <Select
                            style={{flex: 1, width: 90}}
                            onChange={event => this.addAdditionalParameter(val.val, 'val', val.id, event.value)}
                            clearable={false}
                            value={val.type}
                            options={[{
                                label: 'String',
                                value: 'string'
                            }, {
                                label: 'Number',
                                value: 'number'
                            },
                            {
                                label: 'Boolean',
                                value: 'boolean'
                            }
                            ]}/>
                        <Button onClick={() => this.setState({additionalParameters: this.state.additionalParameters.filter((aa) => val.id !== aa.id)} ) } className="square-button-md" style={{borderColor: 'transparent'}}><Glyphicon glyph="trash"/></Button>
                    </div>))}
                </FormGroup>
            </Form>}
        </ResizableModal>);
    }
    // assign the additional parameters from the layers (state) to the modal component state
    assignParameters = (parameters) =>
        keys(parameters).map((key, index) => {
            const value = parameters[key];
            const type = isNumber(value) ? 'number' : isBoolean(value) ? 'boolean' : 'string';
            return {
                id: index,
                param: key,
                type,
                val: type === 'string' ? value.toString() : value
            };
        });
    addAdditionalParameter = (event, key, id, type)=> {
        this.setState({
            additionalParameters:
            this.state.additionalParameters.map(v => {
                if (v.id === id) {
                    let modifiedKey;
                    if (key === 'val') {
                        switch (type) {
                        case 'number':
                            modifiedKey = Number(event);
                            if (!modifiedKey || isNaN(modifiedKey)) {
                                modifiedKey = 0;
                            }
                            break;
                        case 'boolean':
                            modifiedKey = isBoolean(event) ? event : true;
                            break;
                        default:
                            modifiedKey = event ? event.toString() : '';
                            break;
                        }
                    } else {
                        modifiedKey = event;
                    }
                    return assign({}, v, {[key]: modifiedKey, type});
                }
                return v;
            })
        });
    }
    resetParameters = () => this.setState({additionalParameters: []});
}

module.exports = BackgroundDialog;
