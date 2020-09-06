import React, { useState, useRef, useEffect } from 'react';
import { mdiGauge, mdiAccountGroup } from '@mdi/js';
import { createUseStyles } from 'react-jss';
import Icon from '@mdi/react';

export default function Sidebar({ active = 'dashboard' }) {
    const styles = createUseStyles({
        sidebar: {
            background: 'rgb(25, 35, 40)',
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
            color: 'rgb(200, 200, 200)',
            'align-items': 'center',
            'user-select': 'none',
            display: 'flex',
            padding: '15px',
            '&.active': {
                background: 'rgb(20, 30, 35)',
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
    });
    const classes = styles();

    const [user, setUser] = useState();

    async function getUser() {
        await fetch('/authenticate', { method: 'POST' })
            .then(response => response.json())
            .then(user => setUser(user));
    }

    useEffect(() => {
        if (user == null) getUser();
    }, [user, getUser]);

    return (
        <div className={classes.sidebar}>
            <div className={classes.user}>
                <img className={classes.avatar} src={user?.avatar} alt="User avatar" />
                <span className={classes.username}>
                    {user?.username}
                </span>
            </div>

            <ul classes={classes.list}>
                <a className={`${classes.item}${active === 'dashboard' ? ' active' : ''}`} href="/admin">
                    <Icon className={classes.icon} path={mdiGauge} />
                    <span className={classes.link}>
                        Dashboard
                    </span>
                </a>
                <a className={`${classes.item}${active === 'users' ? ' active' : ''}`} href="/admin/users">
                    <Icon className={classes.icon} path={mdiAccountGroup} />
                    <span className={classes.link}>
                        Users
                    </span>
                </a>
            </ul>
        </div>
    );
}