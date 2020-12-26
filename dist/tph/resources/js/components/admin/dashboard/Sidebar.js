import React, { useState, useRef, useEffect } from 'react';
import { mdiGauge, mdiAccountGroup } from '@mdi/js';
import { createUseStyles } from 'react-jss';
import Icon from '@mdi/react';

export default function Sidebar({ active = 'dashboard' }) {
    const styles = createUseStyles({
        sidebar: {
            background: 'var(--dashboard-primary)',
            color: 'var(--color-secondary)',
            'flex-direction': 'column',
            display: 'flex',
            width: '20vw',
        },
        user: {
            'font-family': 'Raleway',
            'align-items': 'center',
            display: 'flex',
            padding: '10px',
            height: '80px',
        },
        username: {
            'margin-left': '5px',
        },
        list: {
            'flex-direction': 'column',
            display: 'flex',
            flex: 1,
        },
        item: {
            transition: 'background 0.1s linear',
            'align-items': 'center',
            'user-select': 'none',
            color: 'inherit',
            display: 'flex',
            padding: '15px',
            '&.active': {
                background: 'var(--dashboard-secondary)',
            },
            '&:hover:not(.active)': {
                background: 'rgb(35, 50, 55)',
            },
            '&:hover': {
                'text-decoration': 'none',
            },
        },
        link: {
            'margin-left': '10px',
            background: 'none',
        },
        icon: {
            height: '30px',
            width: '30px',
        },
        logo: {
            background: 'var(--color-main-gradient)',
            '-webkit-text-fill-color': 'transparent',
            '-webkit-background-clip': 'text',
            'background-clip': 'text',
            'text-align': 'center',
            'font-weight': 'bold',
            'user-select': 'none',
            'font-size': '2rem',
            padding: '20px',
        },
    });
    const classes = styles();

    const [translations, setTranslations] = useState();
    const [user, setUser] = useState();

    async function getUser() {
        await fetch('/api/authenticate', { method: 'POST' })
            .then(response => response.json())
            .then(user => setUser(user));
    }

    async function getTranslations() {
        await fetch('/api/translations')
            .then(response => response.json())
            .then(translations => setTranslations(translations));
    }

    useEffect(() => {
        if (translations == null) getTranslations();
        if (user == null) getUser();
    }, [user, getUser]);

    return (
        <div className={classes.sidebar}>
            <a className={classes.logo} href="/">
                {translations?.partials?.site_title}
            </a>

            <div className={classes.user}>
                <img className={classes.avatar} src={user?.avatar} alt={translations?.dashboard?.user_avatar} />
                <span className={classes.username}>
                    {user?.username}
                </span>
            </div>

            <ul classes={classes.list}>
                <a className={`${classes.item}${active === 'dashboard' ? ' active' : ''}`} href="/admin">
                    <Icon className={classes.icon} path={mdiGauge} />
                    <span className={classes.link}>
                        {translations?.dashboard?.dashboard}
                    </span>
                </a>
                <a className={`${classes.item}${active === 'users' ? ' active' : ''}`} href="/admin/users">
                    <Icon className={classes.icon} path={mdiAccountGroup} />
                    <span className={classes.link}>
                        {translations?.dashboard?.users}
                    </span>
                </a>
            </ul>
        </div>
    );
}