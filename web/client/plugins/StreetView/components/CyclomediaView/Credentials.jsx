import React, {useState} from 'react';
import Message from '../../../../components/I18N/Message';
import { Form, Button, ControlLabel, FormControl, Glyphicon, Alert } from 'react-bootstrap';
import tooltip from '../../../../components/misc/enhancers/tooltip';
const ButtonT = tooltip(Button);
/**
 * Component to insert Smart API Credentials.
 * If showCredentialsForm is false, it shows only a button to open the form.
 * When showCredentialsForm is true, it shows the form to insert credentials.
 * @prop {function} setCredentials function to set credentials
 * @prop {object} credentials object with username and password
 * @prop {boolean} showCredentialsForm show form
 * @prop {function} setShowCredentialsForm function to set showCredentialsForm
 * @prop {boolean} isCredentialsInvalid flag to indicate if credentials are invalid
 * @returns {JSX.Element} The rendered component
 */
export default ({setCredentials = () => {}, credentials, showCredentialsForm, setShowCredentialsForm = () => {}, isCredentialsInvalid = false}) => {
    const [username, setUsername] = useState(credentials?.username || '');
    const [password, setPassword] = useState(credentials?.password || '');
    const onSubmit = () => {
        setCredentials({username, password});
        setShowCredentialsForm(false);
    };
    if (!showCredentialsForm) {
        // show only button to reset credentials.
        return (<div style={{textAlign: "right"}}>
            <ButtonT
                style={{marginRight: 10, border: "none", background: "none"}}
                tooltipId="streetView.cyclomedia.changeCredentials"
                onClick={() => {
                    setShowCredentialsForm(true);
                }}><Glyphicon glyph="1-user-mod" /></ButtonT>
        </div>);
    }
    return (<div className="street-view-credentials">
        <h5><Message msgId="streetView.cyclomedia.insertCredentials" /></h5>
        <Form>
            <ControlLabel><Message msgId="streetView.cyclomedia.username" /></ControlLabel>
            <FormControl type="text"  value={username} onChange={e => setUsername(e.target.value)}/>
            <ControlLabel><Message msgId="streetView.cyclomedia.password" /></ControlLabel>
            <FormControl type="password"  value={password} onChange={e => setPassword(e.target.value)}/>
            {isCredentialsInvalid && (
                <Alert bsStyle="danger" style={{marginTop: 10}}>
                    <Message msgId="streetView.cyclomedia.errors.invalidCredentials" />
                </Alert>
            )}
            <div className="street-view-credentials-form-buttons">
                <Button disabled={!username || !password} onClick={() => onSubmit()}><Message msgId="streetView.cyclomedia.submit" /></Button>
                {
                    credentials?.username && credentials?.password && !isCredentialsInvalid && <Button onClick={() => {
                        setCredentials({username: credentials.username, password: credentials.password});
                        setShowCredentialsForm(false);
                    } }><Message msgId="cancel" /></Button>
                }
            </div>
        </Form>
    </div>);

};
