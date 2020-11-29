import React, { useState, useEffect, useRef } from 'react';
import { createUseStyles } from 'react-jss';
import classnames from 'classnames';
import { Tooltip } from '../misc';
import { mdiSend } from '@mdi/js';
import { Chatmessage } from './';
import Icon from '@mdi/react';

export default function Chatbox({ className = '', messages = [], onSubmit, placeholder = 'Aa', ...props }) {
    const styles = createUseStyles({
        container: {
            backgroundImage: 'var(--color-main-gradient-rotated)',
            boxShadow: [0, 0, 5, 0, 'rgba(0, 0, 0, 0.25)'],
            maxHeight: '100vh !important',
            color: 'var(--color-primary)',
            borderRadius: 3,
        },
        messages: {
            '&::-webkit-scrollbar': {
                width: 12,
            },
            '&::-webkit-scrollbar-track': {
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 8,
            },
            '&::-webkit-scrollbar-thumb': {
                background: 'var(--color-primary)',
                borderRadius: 8,
            },
        },
        button: {
            color: 'var(--color-primary)',
            background: 'none',
            border: 0,
        },
        input: {
            borderRadius: 3,  
        },
    });
    const classes = styles();

    const [input, setInput] = useState('');
    const messagesContainer = useRef();

    useEffect(() => {
        messagesContainer.current.scrollTo(0, 99999);
    }, [messages, messagesContainer]);

    function submit(e) {
        e.preventDefault();
        if (!input) return;
        onSubmit(input, setInput);
    }

    return (
        <div className={classnames(classes.container, className, 'col p-3')} {...props}>
            <div className={classnames(classes.messages, 'col flex mb-3 overflow-auto')} ref={messagesContainer}>
                {messages.map(message => <Chatmessage message={message} key={message.id} />)}
            </div>
            <form className={classnames(classes.footer, 'row center-children')} onSubmit={e => submit(e, input)}>
                <input
                    className={classnames(classes.input, 'flex p-2 mr-2')}
                    onChange={e => setInput(e.target.value)}
                    placeholder={placeholder}
                    value={input}
                    type="text"
                />
                <Tooltip className={classnames(classes.button, 'd-flex')} tagName="button" title="Send" type="submit">
                    <Icon path={mdiSend} style={{ width: 35 }} />
                </Tooltip>
            </form>
        </div>
    );
}
