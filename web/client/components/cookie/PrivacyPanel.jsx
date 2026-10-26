/*
 * Copyright 2026, GeoSolutions Sas.
 * All rights reserved.
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import { Glyphicon } from 'react-bootstrap';
import Button from '../layout/Button';
import { getMessageById } from '../../utils/LocaleUtils';
import { getPolicyLink, policyLinkKeys, policyPagesDocsUrl, usesTemplatePolicyLinks } from '../../utils/PrivacyChoices';

export default function PrivacyPanel({ config, locale, choice, show, storageError, onShow, onSave }, context) {
    const t = id => getMessageById(context.messages, `privacySettings.${id}`);
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
        // Closing a first notice refuses optional tools, unless saving has already failed.
        if (categories.length && !choice && !storageError) { choose({}); return; }
        onShow(false); returnFocus();
    };
    return createPortal(<>
        {!nativeFooter && <div className="mapstore-privacy-access" role="group" aria-label={t('settings')}>
            <Button type="button" id="privacy-settings" className="mapstore-privacy-open"
                aria-label={t('settings')} onClick={() => onShow(true)}>
                <Glyphicon glyph="lock" aria-hidden="true" /> <span>{t('settings')}</span>
            </Button>
        </div>}
        {show && <section className="mapstore-privacy-panel" role="dialog" aria-labelledby="privacy-title" aria-modal="false"
            onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
            <h2 id="privacy-title" ref={titleRef} tabIndex="-1">{t('title')}</h2>
            {config.testFixture && <p className="mapstore-privacy-warning">{t('fixture')}</p>}
            {usesTemplatePolicyLinks(config) && <p className="mapstore-privacy-warning mapstore-privacy-template-warning">
                {t('templateWarning')} <a href={policyPagesDocsUrl} target="_blank" rel="noopener noreferrer">{t('templateWarningLink')}</a>
            </p>}
            <p>{categories.length ? t('optional') : t('baseline')}</p>
            <div className="mapstore-privacy-category"><strong>{t('necessary')}</strong><span>{t('always')}</span><p>{t('required')}</p></div>
            {['functional', 'statistics', 'marketing'].map(id => {
                const category = categories.find(c => c.id === id);
                return (<div className="mapstore-privacy-category" key={id} data-category={id}>
                    {category && details ? <label>
                        <input type="checkbox" checked={draft[id] === true} aria-label={t(id)}
                            onChange={event => setDraft({...draft, [id]: event.target.checked})}/>
                        <strong>{t(id)}</strong>
                    </label> : <><strong>{t(id)}</strong><span>{category ? t(choice?.categories[id] ? 'on' : 'off') : t('unused')}</span></>}
                    {category && <p>{category.description?.[locale] || category.description?.['en-US'] || Object.values(category.description || {})[0] || ''}</p>}
                </div>);
            })}
            {categories.length > 0 && <p>{t('status')}</p>}
            {storageError && <p role="alert" className="mapstore-privacy-warning">{t('storageError')}</p>}
            <nav className="mapstore-privacy-links" aria-label={t('policies')}>
                {policyLinkKeys.filter(key => getPolicyLink(config, key, locale)).map(key =>
                    <a key={key} href={getPolicyLink(config, key, locale)} target="_blank" rel="noopener noreferrer">{t(key)}</a>)}
            </nav>
            <div className="mapstore-privacy-actions">
                {categories.length > 0 && <>
                    <Button type="button" id="privacy-reject" onClick={() => choose({})}>{t('reject')}</Button>
                    {details ? <Button type="button" id="privacy-save" onClick={() => choose(draft)}>{t('save')}</Button>
                        : <Button type="button" id="privacy-customize" onClick={() => setDetails(true)}>{t('customize')}</Button>}
                    <Button type="button" id="privacy-accept" onClick={() => choose(Object.fromEntries(categories.map(({id}) => [id, true])))}>{t('accept')}</Button>
                    {choice && Object.values(choice.categories).some(Boolean) && <Button type="button" id="privacy-withdraw" onClick={() => choose({})}>{t('withdraw')}</Button>}
                </>}
                <Button type="button" id="privacy-close" onClick={close}>{t('close')}</Button>
            </div>
        </section>}
    </>, document.body);
}

PrivacyPanel.contextTypes = {
    messages: PropTypes.object
};
