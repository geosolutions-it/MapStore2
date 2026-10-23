/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';

const messages = {
    'en-US': {
        title: 'Privacy settings', settings: 'Privacy settings', necessary: 'Necessary', always: 'Always active',
        functional: 'Optional functional', statistics: 'Statistics', marketing: 'Marketing', unused: 'Not used',
        reject: 'Reject optional', accept: 'Accept optional', customize: 'Customize',
        save: 'Save choices', close: 'Close', withdraw: 'Withdraw all optional consent',
        baseline: 'This configuration uses only necessary technical tools, which do not require consent. Closing this notice does not express consent.',
        optional: 'Optional tools stay off until you choose. You can refuse them and continue using MapStore.',
        required: 'Authentication when you sign in, security and remembering your privacy settings. See the Cookie Policy for purposes and duration.',
        status: 'Change or withdraw consent at any time from the bottom bar. Withdrawal stops registered integrations; it cannot undo data already sent or remove third-party cookies.',
        storageError: 'Your choice could not be saved. Optional tools remain off. Check browser storage and try again.',
        fixture: 'LOCAL TEST FIXTURE — synthetic optional tools, not included in Vanilla.'
    },
    'it-IT': {
        title: 'Impostazioni privacy', settings: 'Impostazioni privacy', necessary: 'Necessari', always: 'Sempre attivi',
        functional: 'Funzionali opzionali', statistics: 'Statistiche', marketing: 'Marketing', unused: 'Non utilizzati',
        reject: 'Rifiuta opzionali', accept: 'Accetta opzionali', customize: 'Personalizza',
        save: 'Salva le scelte', close: 'Chiudi', withdraw: 'Revoca tutti i consensi opzionali',
        baseline: 'Questa configurazione utilizza solo strumenti tecnici necessari, per i quali non è richiesto il consenso. Chiudere questo avviso non esprime un consenso.',
        optional: 'Gli strumenti opzionali restano spenti fino alla tua scelta. Puoi rifiutarli e continuare a usare MapStore.',
        required: 'Autenticazione quando accedi, sicurezza e memorizzazione delle impostazioni privacy. Finalità e durata sono nella Cookie Policy.',
        status: 'Puoi cambiare o revocare il consenso dalla barra inferiore. La revoca interrompe le integrazioni registrate; non ritira dati già inviati né elimina cookie di terzi.',
        storageError: 'La scelta non è stata salvata. Gli opzionali restano spenti. Controlla lo storage del browser e riprova.',
        fixture: 'FIXTURE DI TEST LOCALE — strumenti opzionali sintetici, esclusi da Vanilla.'
    }
};

export default function PrivacyPanel({ config, locale, choice, show, storageError, onShow, onSave }) {
    const t = messages[locale] || messages['en-US'];
    const categories = (config.categories || []).filter(c => ['functional', 'statistics', 'marketing'].includes(c.id));
    const [details, setDetails] = useState(false);
    const [draft, setDraft] = useState({});
    const [nativeFooter, setNativeFooter] = useState(false);
    const titleRef = useRef();
    useEffect(() => {
        if (show) { setDraft(choice?.categories || {}); setDetails(false); }
    }, [show, choice]);
    useEffect(() => {
        const update = () => {
            const present = !!document.querySelector('#mapstore-map-footer, #ms-footer');
            setNativeFooter(current => current === present ? current : present);
        };
        update();
        const observer = new MutationObserver(update);
        observer.observe(document.body, {childList: true, subtree: true});
        return () => observer.disconnect();
    }, []);
    useEffect(() => { if (show) titleRef.current?.focus(); }, [show]);
    const returnFocus = () => requestAnimationFrame(() => document.querySelector('#privacy-settings')?.focus());
    const choose = selected => { if (onSave(selected) !== false) { setDetails(false); returnFocus(); } };
    const close = () => {
        if (categories.length && !choice) { choose({}); return; }
        onShow(false); returnFocus();
    };
    const labels = {cookie: 'Cookie Policy', privacy: 'Privacy Policy', terms: 'Terms of Use'};
    return createPortal(<>
        {!nativeFooter && <div className="mapstore-privacy-access" role="group" aria-label={t.settings}>
            <Button type="button" id="privacy-settings" className="mapstore-privacy-open"
                aria-label={t.settings} onClick={() => onShow(true)}>
                <Glyphicon glyph="lock" aria-hidden="true" /> <span>{t.settings}</span>
            </Button>
        </div>}
        {show && <section className="mapstore-privacy-panel" role="dialog" aria-labelledby="privacy-title" aria-modal="false"
            onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
            <h2 id="privacy-title" ref={titleRef} tabIndex="-1">{t.title}</h2>
            {config.testFixture && <p className="mapstore-privacy-warning">{t.fixture}</p>}
            <p>{categories.length ? t.optional : t.baseline}</p>
            <div className="mapstore-privacy-category"><strong>{t.necessary}</strong><span>{t.always}</span><p>{t.required}</p></div>
            {['functional', 'statistics', 'marketing'].map(id => {
                const category = categories.find(c => c.id === id);
                return (<div className="mapstore-privacy-category" key={id} data-category={id}>
                    {category && details ? <label>
                        <input type="checkbox" checked={draft[id] === true} aria-label={t[id]}
                            onChange={event => setDraft({...draft, [id]: event.target.checked})}/>
                        <strong>{t[id]}</strong>
                    </label> : <><strong>{t[id]}</strong><span>{category ? (choice?.categories[id] ? 'On' : 'Off') : t.unused}</span></>}
                    {category && <p>{category.description?.[locale] || category.description?.['en-US'] || ''}</p>}
                </div>);
            })}
            {categories.length > 0 && <p>{t.status}</p>}
            {storageError && <p role="alert" className="mapstore-privacy-warning">{t.storageError}</p>}
            <nav className="mapstore-privacy-links" aria-label="Policies">
                {['cookie', 'privacy', 'terms'].filter(key => config.links?.[key]).map(key =>
                    <a key={key} href={config.links[key]} target="_blank" rel="noopener noreferrer">{labels[key]}</a>)}
            </nav>
            <div className="mapstore-privacy-actions">
                {categories.length > 0 && <>
                    <Button type="button" id="privacy-reject" onClick={() => choose({})}>{t.reject}</Button>
                    {details ? <Button type="button" id="privacy-save" onClick={() => choose(draft)}>{t.save}</Button>
                        : <Button type="button" id="privacy-customize" onClick={() => setDetails(true)}>{t.customize}</Button>}
                    <Button type="button" id="privacy-accept" onClick={() => choose(Object.fromEntries(categories.map(({id}) => [id, true])))}>{t.accept}</Button>
                    {choice && Object.values(choice.categories).some(Boolean) && <Button type="button" id="privacy-withdraw" onClick={() => choose({})}>{t.withdraw}</Button>}
                </>}
                <Button type="button" id="privacy-close" onClick={close}>{t.close}</Button>
            </div>
        </section>}
    </>, document.body);
}
