

const React = require('react');
const ResizableModal = require('../misc/ResizableModal');
const {Form, FormGroup, ControlLabel, FormControl, Button, Glyphicon} = require('react-bootstrap');
const Thumbnail = require('../maps/forms/Thumbnail');
const Select = require('react-select');
const {withState} = require('recompose');
let cnt = 0;
module.exports = withState('state', 'setState', {id: 0, additionalParameters: []})(({
    showModal,
    setState,
    state,
    onClose = () => {},
    onSave = () => {},
    onUpdate = () => {},
    add
}) => (
    <ResizableModal
        title={add ? "Add Background" : "Edit Current Background"}
        show={showModal}
        fade
        onClose={() => { onClose(); setState({additionalParameters: []}); }}
        buttons={[
            {
                text: add ? 'Add' : 'Save',
                bsStyle: 'primary',
                onClick: () => { onSave(showModal); setState({additionalParameters: []}); }
            }
        ]}>
        <Form style={{padding: 8}}>
            <FormGroup>
                <ControlLabel>Thumbnail</ControlLabel>
                <div className="shadow-soft" style={{width: 180, margin: 'auto'}}>
                    <Thumbnail maps={{
                        newThumbnail: showModal && showModal.thumbURL
                    }}/>
                </div>
            </FormGroup>
            <FormGroup>
                <ControlLabel>Title</ControlLabel>
                <FormControl
                    value={showModal && showModal.title}
                    placeholder="Enter displayed name"
                    onChange={event => onUpdate({...showModal, title: event.target.value})}/>
            </FormGroup>
            <FormGroup controlId="formControlsSelect">
                <ControlLabel>Format</ControlLabel>
                {/*<FormControl componentClass="select" placeholder="Select format"
                    onChange={event => onUpdate({...showModal, format: event.target.value})}>
                    <option value="image/png">image/png</option>
                    <option value="image/png8">image/png8</option>
                    <option value="image/jpeg">image/jpeg</option>
                    <option value="image/vnd.jpeg-png">image/vnd.jpeg-png</option>
                    <option value="image/gif">image/gif</option>
                </FormControl>*/}

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
                {/*<FormControl componentClass="select" value={showModal && showModal.style}
                    onChange={event => onUpdate({...showModal, style: event.target.value})}
                    placeholder="Enter custom style name">
                    <option value="default">default</option>
                    <option value="image/png8">my style</option>
                </FormControl>*/}
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
                {state.additionalParameters.map((val) => (<div key={'val:' + val.id} style={{display: 'flex', marginTop: 8}}>
                <FormControl style={{flex: 1, marginRight: 8}} placeholder="Parameter"/>
                <FormControl style={{flex: 1, marginRight: 8}} placeholder="Value"/>
                <Button onClick={() => setState({ additionalParameters: state.additionalParameters.filter((aa) => val.id !== aa.id)})} className="square-button-md" style={{borderColor: 'transparent'}}><Glyphicon glyph="trash"/></Button>
                </div>))}
            </FormGroup>
        </Form>
    </ResizableModal>
));
