import React, { useRef, useContext } from 'react';
import { Knockout } from '../styled-components';
import { UserContext } from '../../contexts';
import { createUseStyles } from 'react-jss';
import { NavLink } from 'react-router-dom';
import { NavDropdown } from '../misc';
import classnames from 'classnames';

export default function Header() {
    const styles = createUseStyles({
        header: {
            padding: [0, 'var(--container-margin)'],
            backgroundColor: 'var(--color-dark)',
            zIndex: 100,
            '@media (max-width: 768px)': {
                padding: 'var(--container-margin)',
            },
        },
        brand: {
            '&:hover': {
                textDecoration: 'none',
            },
        },
        navlist: {
            alignItems: 'center',
        },
        navitem: {
            margin: [0, 20, 0, 0],
            alignItems: 'center',
            userSelect: 'none',
            display: 'flex',
            height: 100,
            '@media (max-width: 768px)': {
                height: 'unset',
            },
            '&:last-child': {
                marginRight: 0,
            },
        },
        navlink: {
            transition: 'color 0.25s ease-out',
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            position: 'relative',
            letterSpacing: 1,
            fontWeight: 600,
            padding: 10,
            '&::after': {
                backgroundColor: 'var(--color-main)',
                transition: 'width 0.25s ease-out',
                position: 'absolute',
                borderRadius: 10,
                content: '""',
                height: 2,
                bottom: 0,
                width: 0,
                left: 0,
            },
            '&:hover': {
                textDecoration: 'none',
            },
            '&:hover, &.active': {
                color: 'var(--color-main)',
                '&::after': {
                    width: '100%',
                },
            },
        },
        siteHeader: {
            fontFamily: 'Merriweather',
            fontSize: '2.5rem',
            letterSpacing: 2,
            lineHeight: 0.7,
            '@media (max-width: 768px)': {
                fontSize: '1.5rem',
            },
        },
        siteSlogan: {
            color: 'var(--color-primary)',
            fontFamily: 'Raleway',
            '@media (max-width: 768px)': {
                display: 'none',
            },
        },
    });
    const classes = styles();

    const { user } = useContext(UserContext);
    const navbar = useRef();

    const navItems = () => {
        if (user == null) return;
        if (user) {
            return (
                <>
                    {
                        !user.suspended && user.roles[0].clearance <= 2 &&
                            <NavDropdown
                                toggler="Admin"
                                items={[
                                    {
                                        name: 'Dashboard',
                                        to: { pathname: '/admin' },
                                    },
                                ]} 
                            />
                    }
                    <NavDropdown
                        toggler={<img className={classnames('round')} style={{ width: 50 }} src={`/storage/avatars/${user.avatar}`} />}
                        items={[
                            {
                                name: 'Profile',
                                to: { pathname: `/user/${user.username}` },
                            },
                            {
                                name: 'Search',
                                to: { pathname: '/search' },
                            },
                            {
                                name: 'Chat',
                                to: { pathname: '/chat' },
                            },
                            {
                                name: 'Settings',
                                to: { pathname: '/settings' },
                            },
                            {
                                name: 'Logout',
                                to: {
                                    pathname: '/api/logout',
                                    state: { url: window.location.pathname },
                                },
                                args: { router: false },
                            },
                        ]} 
                    />
                </>
            );
        } else {
            return (
                <>
                    <li className={classnames(classes.navitem)}>
                        <NavLink className={classnames(classes.navlink)} to={{
                            pathname: '/login',
                            state: { url: window.location.pathname },
                        }}>
                            Login
                        </NavLink>
                    </li>
                    <li className={classnames(classes.navitem)}>
                        <NavLink className={classnames(classes.navlink)} to={{
                            pathname: '/register',
                            state: { url: window.location.pathname },
                        }}>
                            Register
                        </NavLink>
                    </li>
                </>
            );
        }
    }

    return (
        <header className={classnames(classes.header, 'center-children col')}>
            <nav className={classnames(classes.navbar, 'w-100 row')} ref={navbar}>
                <ul className={classnames(classes.navlist, 'flex row')}>
                    <NavLink className={classnames(classes.brand, 'mr-auto col center-children')} to="/">
                        <Knockout className={classnames(classes.siteHeader, 'py-2')} as="h1">TPH</Knockout>
                        <p className={classnames(classes.siteSlogan)}>The pioneer hangout</p>
                    </NavLink>
                    {navItems()}
                </ul>
            </nav>
        </header>
    );
}
