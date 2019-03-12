

const React = require('react');
const PropTypes = require('prop-types');
const ResizableModal = require('../misc/ResizableModal');
const {Form, FormGroup, ControlLabel, FormControl, Button, Glyphicon} = require('react-bootstrap');
const Thumbnail = require('../maps/forms/Thumbnail');
const Select = require('react-select');
let cnt = 0;


class ModalMock extends React.Component{
    static propTypes = {
        onAdd: PropTypes.func,
        onClose: PropTypes.func,
        source: PropTypes.string,
        onSave: PropTypes.func,
        onUpdate: PropTypes.func,
        modalParams: PropTypes.object,
        resetParameters: PropTypes.func,
        add: PropTypes.bool,
        additionalParameters: PropTypes.array,
        addParameters: PropTypes.func,
        updateThumbnail: PropTypes.func,
        unsavedChanges: PropTypes.bool,
        editing: PropTypes.bool,
        deletedId: PropTypes.string,
        CurrentModalParams: PropTypes.object,
        thumbURL: PropTypes.string
    };
    static defaultProps = {
        updateThumbnail: () => {},
        onClose: () => {},
        onSave: () => {},
        onUpdate: () => {},
        resetParameters: () => {},
        addParameters: () => {},
        add: true,
        additionalParameters: [],
        unsavedChanges: false,
        editing: false

    };

    render() {
        return (<ResizableModal
        title={this.props.add ? "Add Background" : "Edit Current Background"}
        show={!!this.props.unsavedChanges || !!this.props.editing}
        fade
        onClose={() => { this.props.onClose(); this.props.resetParameters([]); }}
        buttons={[
            {
                text: this.props.add ? 'Add' : 'Save',
                bsStyle: 'primary',
                onClick: () => { this.props.onSave(this.props.modalParams); this.props.resetParameters([]); }
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
                        // (this.props.CurrentModalParams &&
                        // this.props.CurrentModalParams.hasOwnProperty('CurrentNewThumbnail') && this.props.CurrentModalParams.CurrentNewThumbnail === undefined)
                        // ? null : (this.props.thumbURL && decodeURIComponent(this.props.thumbURL)) ||
                        // this.props.CurrentModalParams && this.props.CurrentModalParams.CurrentNewThumbnail || this.props.modalParams &&
                        // (this.props.modalParams.CurrentNewThumbnail || this.props.modalParams.source),
                        // id: this.props.modalParams && this.props.modalParams.id
                    }}/>
                </div>
            </FormGroup>
            <FormGroup>
                <ControlLabel>Title</ControlLabel>
                <FormControl
                    value={this.props.modalParams && this.props.modalParams.title}
                    placeholder="Enter displayed name"
                    onChange={event => this.props.onUpdate({...this.props.modalParams, title: event.target.value})}/>
            </FormGroup>
            <FormGroup controlId="formControlsSelect">
                <ControlLabel>Format</ControlLabel>
                <Select
                    value="image/png"
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
                    clearable={false}
                    value="default"
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
                            setState({id: cnt, additionalParameters:
                        [...state.additionalParameters, {id: cnt, param: '', val: ''}]});
                            cnt++;
                        }}>
                        <Glyphicon glyph="plus"/>
                    </Button>
                </div>
                {this.props.additionalParameters.map((val) => (<div key={'val:' + val.id} style={{display: 'flex', marginTop: 8}}>
                <FormControl style={{flex: 1, marginRight: 8}} placeholder="Parameter"/>
                <FormControl style={{flex: 1, marginRight: 8}} placeholder="Value"/>
                <Button onClick={() => this.props.addParameters(this.props.additionalParameters.filter((aa) => val.id !== aa.id))} className="square-button-md" style={{borderColor: 'transparent'}}><Glyphicon glyph="trash"/></Button>
                </div>))}
            </FormGroup>
        </Form>
    </ResizableModal>);
    }
}

module.exports = ModalMock;

