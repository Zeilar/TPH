import React, { useState, useRef, useEffect, useContext } from 'react';
import { ErrorModalContext } from '../../contexts/ErrorModalContext';
import { UserContext } from '../../contexts/UserContext';
import { Redirect, useHistory } from 'react-router';
import { createUseStyles } from 'react-jss';
import { NavLink } from 'react-router-dom';
import Checkbox from '../misc/Checkbox';
import Tooltip from '../misc/Tooltip';
import Http from '../../classes/Http';
import { mdiLoading } from '@mdi/js';
import Header from '../Header';
import Icon from '@mdi/react';

export default function Login() {
    const { setError } = useContext(ErrorModalContext);
    const { user, setUser } = useContext(UserContext);

    if (user) {
        setError('You are already logged in');
        return <Redirect to="/" />
    }

    const styles = createUseStyles({
        login: {
            border: '1px solid var(--border-primary)',
            backgroundColor: 'var(--color-primary)',
            borderRadius: 3,
            width: '22.5%',
        },
        input: {
            border: '1px solid var(--border-secondary)',
            backgroundColor: 'transparent',
            transition: 'all 0.1s linear',
            fontSize: '1.25rem',
            borderRadius: 3,
            padding: 8,
            '&:focus': {
                boxShadow: [0, 0, 0, 1, 'var(--color-main)'],
                border: '1px solid var(--color-main)',
            },
        },
        row: {
            padding: 35,
        },
        label: {
            color: 'var(--text-secondary)',
        },
        footer: {
            borderTop: '1px solid var(--border-primary)',
            backgroundColor: 'var(--body-bg)',
            padding: 35,
        },
        submit: {
            boxShadow: [0, 0, 10, 1, 'rgba(0, 0, 0, 0.15)'],
            fontSize: '1.25rem',
            borderRadius: 3,
        },
        submitIcon: {
            color: 'var(--color-primary)',
            height: 25,
        },
        submitText: {
            height: 25,
        },
        errors: {
            padding: 35,
        },
        error: {
            backgroundColor: 'rgba(200, 0, 50, 0.05)',
            color: 'var(--text-secondary)',
            borderLeft: '3px solid red',
            borderBottomRightRadius: 2,
            borderTopRightRadius: 2,
            marginBottom: 10,
            '&:last-child': {
                marginBottom: 0,
            },
        },
    });
    const classes = styles();

    const [errors, setErrors] = useState({ id: false, password: false });
    const [submitting, setSubmitting] = useState(false);
    const [password, setPassword] = useState('');
    const [id, setId] = useState('');
    const history = useHistory();
    const remember = useRef();

    async function login(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append('id', id);
        formData.append('password', password);
        formData.append('remember', remember.current.checked);

        setSubmitting(true);
        const response = await Http.post('login', { body: formData }, true);
        setSubmitting(false);

        if (response.code === 200) {
            history.push('/');
            setUser(response.data);
        } else if (response.code === 422) {
            setErrors(response.data);
        } else {
            setError('Something went wrong');
        }
    }

    useEffect(() => {
        errors.id = false;
    }, [id]);

    useEffect(() => {
        errors.password = false;
    }, [password]);

    return (
        <>
            <Header />
            <h2 className={classes.header}>Login</h2>
            <form className={`${classes.login} mx-auto mt-4`} onSubmit={login}>
                {
                    (errors.id || errors.password) &&
                        <div className={`${classes.errors} col pb-0`}>
                            {errors.id && <p className={`${classes.error} p-2`}>{errors.id}</p>}
                            {errors.password && <p className={`${classes.error} p-2`}>{errors.password}</p>}
                        </div>
                }
                <div className={`${classes.row} pb-0 col`}>
                    <label className={classes.label}>Username or Email</label>
                    <input className={`${classes.input} mt-2`} value={id} onChange={e => setId(e.target.value)} />
                </div>
                <div className={`${classes.row} col`}>
                    <div className="row">
                        <label className={classes.label}>Password</label>
                        <NavLink className="ml-auto" to="/forgot-password">Forgot password?</NavLink>
                    </div>
                    <input
                        className={`${classes.input} mt-2`} id="password" type="password"
                        onChange={e => setPassword(e.target.value)} value={password} 
                    />
                </div>
                <div className={`${classes.row} pt-0 row center-children`}>
                    <Checkbox forwardRef={remember} className="mr-2" id="remember" />
                    <label className={`${classes.label} mr-auto pointer no-select`} htmlFor="remember">
                        Remember me
                    </label>
                    <NavLink className="ml-auto" to="/register">Register</NavLink>
                </div>
                <div className={`${classes.footer}`}>
                    <Tooltip
                        disabled={submitting || !id || !password} title={!id || !password ? 'Please fill all the fields' : null} tagName="button"
                        className={`${classes.submit} d-flex center-children py-2 btn w-100 border-0`}
                    >
                        {
                            !submitting
                                ? <span className={classes.submitText}>Login</span>
                                : <Icon className={`${classes.submitIcon}`} path={mdiLoading} spin={1} />
                        }
                    </Tooltip>
                </div>
            </form>
        </>
    );
}