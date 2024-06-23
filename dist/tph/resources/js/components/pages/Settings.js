import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../contexts';
import { createUseStyles } from 'react-jss';
import { PasswordField } from '../misc';
import { mdiLoading } from '@mdi/js';
import classnames from 'classnames';
import { Header } from '../layout';
import Icon from '@mdi/react';

export default function Settings() {
    document.title = 'TPH | Settings';

    const styles = createUseStyles({
        wrapper: {
            border: '1px solid var(--border-primary)',
            margin: [50, 'var(--container-margin)'],
            borderRadius: 2,
            padding: 25,
        },
        inputGroup: {
            flexDirection: 'column',
            marginBottom: 25,
            display: 'flex',
        },
        label: {
            fontSize: '1.25rem',
            fontWeight: 'bold',
            marginBottom: 10,
        },
    });
    const classes = styles();

    const { user } = useContext(UserContext);

    const [fields, setFields] = useState({
        passwordConfirmation: '',
        password: '',
        perPage: 20,
        email: '',
    });

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setFields({
                perPage: user.settings.find(setting => setting.name === 'perPage') ?? 20,
                passwordConfirmation: '',
                email: user.email,
                password: '',
            });
        }
    }, [user]);


    function setField(e, field = '') {
        setFields(p => ({ ...p, [field]: e.target.value }));
    }

    async function save(e) {
        e.preventDefault();
        setSaving(true);
        // Http
        setSaving(false);
    }

    return (
        <>
            <Header />
            <form className={classnames(classes.wrapper, 'col')} onSubmit={save}>
                <div className={classnames(classes.inputGroup)}>
                    <label className={classnames(classes.label)}>Email</label>
                    <input className={classnames('input')} placeholder={fields.email} value={fields.email} onChange={e => setField(e, 'email')} type="email" />
                </div>
                <div className={classnames(classes.inputGroup)}>
                    <label className={classnames(classes.label)}>New Password</label>
                    <PasswordField onChange={e => setField(e, 'password')} value={fields.password} />
                </div>
                <div className={classnames(classes.inputGroup)}>
                    <label className={classnames(classes.label)}>Current Password</label>
                    <PasswordField onChange={e => setField(e, 'passwordConfirmation')} value={fields.passwordConfirmation} />
                </div>
                <div className={classnames(classes.inputGroup)}>
                    <label className={classnames(classes.label)}>Items per page</label>
                    <input className={classnames('input')} value={fields.perPage} onChange={e => setField(e, 'perPage')} type="number" min={0} max={100} />
                </div>
                <button className={classnames('btn')}>
                    {saving ? <Icon path={mdiLoading} style={{ width: 15 }} spin={1} /> : 'Save'}
                </button>
            </form>
        </>
    );
}
