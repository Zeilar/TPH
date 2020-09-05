import { mdiClose, mdiLoading, mdiAlertCircleOutline } from '@mdi/js';
import React, { useState, useRef, useEffect } from 'react';
import { createUseStyles } from 'react-jss';
import Chatmessage from './Chatmessage';
import Icon from '@mdi/react';

export default function ChatInner({ setShow, messages, user, error }) {
    const styles = createUseStyles({
        chatInner: {
            'box-shadow': '0 0 25px 0 rgba(0, 0, 0, 0.15)',
            background: 'var(--chat-primary)',
            'flex-direction': 'column',
            'margin-bottom': '20px',
            'max-height': '500px',
            'max-width': '400px',
            display: 'flex',
        },
        toolbar: {
            background: 'var(--color-main-gradient)',
            'border-top-right-radius': '5px',
            'border-top-left-radius': '5px',
            'align-items': 'center',
            'font-weight': 'bold',
            display: 'flex',
            padding: '5px',
            color: 'black',
        },
        toolbarText: {
            'font-family': 'Raleway',
            'margin-left': '20px',
        },
        content: {
            position: 'relative',
            overflow: 'auto',
            height: '50vh',
            margin: '5px',
            width: '20vw',
        },
        footer: {
            background: 'var(--color-primary)',
            position: 'relative',
        },
        close: {
            background: 'var(--color-primary)',
            color: 'var(--text-primary)',
            'justify-content': 'center',
            'align-items': 'center',
            'border-radius': '5px',
            'margin-left': 'auto',
            display: 'flex',
            padding: '5px',
            '&:hover': {
                background: 'var(--color-secondary)',
                color: 'var(--text-secondary)',
            },
        },
        closeIcon: {
            color: 'inherit',
            height: '20px',
            width: '20px',
        },
        input: {
            'font-size': '1rem',
            'border-radius': 0,
            background: 'none',
            padding: '10px',
            margin: '5px',
            width: '100%',
            border: 0,
            '&:focus ~ .inputLine': {
                width: 'calc(100% - 30px)',
            },
        },
        inputLine: {
            background: 'var(--color-main-gradient)',
            transition: 'width 0.15s linear',
            transform: 'translateX(-50%)',
            position: 'absolute',
            bottom: '5px',
            height: '2px',
            left: '50%',
            width: 0,
        },
        loading: {
            height: '100%',
        },
        loadingIcon: {
            height: '75px',
            width: '75px',
        },
        chatError: {
            'flex-direction': 'column',
        },
        chatErrorIcon: {
            'align-self': 'center',
            height: '50px',
            width: '50px',
        },
        chatErrorMessage: {
            'margin-top': '5px',
        },
    });
    const classes = styles();
        
    const [inputError, setInputError] = useState(false);
    const messagesContainer = useRef();
    const input = useRef();
    const form = useRef();

    async function submit(e) {
        e.preventDefault();
        const formData = new FormData(form.current);
        await fetch('/chatmessages', { method: 'POST', body: formData })
            .then(response => input.current.value = '')
            .catch(error => {
                setInputError(true);
            });
    }

    useEffect(() => {
        messagesContainer.current.scrollTop = 99999;
        input.current.focus();
    });

    return (
        <div className={classes.chatInner}>
            <div className={classes.toolbar}>
                <p className={classes.toolbarText}>Shoutbox</p>

                <button className={classes.close} onClick={() => setShow(false)}>
                    <Icon className={classes.closeIcon} path={mdiClose} />
                </button>
            </div>

            <div className={`${classes.content} scrollbar`} ref={messagesContainer}>
                {
                    error
                        ? <div className={`${classes.chatError} centerAbsolute centerFlex`}>
                            <Icon className={classes.chatErrorIcon} path={mdiAlertCircleOutline} color="red" />
                            <p className={classes.chatErrorMessage}>Something went wrong</p>
                        </div>
                        : messages
                            ? messages.map(message => (
                                <Chatmessage key={message.id} message={message} />
                            ))
                            : <div className={`${classes.loading} centerFlex`}>
                                <Icon className={classes.loadingIcon} path={mdiLoading} spin={1} />
                            </div>
                }
            </div>

            <form className={classes.footer} onSubmit={submit} ref={form}>
                {
                    user
                        ? <input className={classes.input} ref={input} type="text" name="content" placeholder="Aa" autoComplete="off" />
                        : <input className={classes.input} ref={input} type="text" name="content" placeholder="Please log in first" autoComplete="off" disabled />
                }
                <div className={`inputLine ${classes.inputLine}`}></div>
            </form>
        </div>
    );
}