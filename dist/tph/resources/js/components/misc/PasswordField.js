import { mdiEye, mdiEyeOff } from '@mdi/js';
import { createUseStyles } from 'react-jss';
import React, { useState } from 'react';
import classnames from 'classnames';
import Icon from '@mdi/react';

export default function PasswordField({ className = '', containerClass = '', iconProps, ...props }) {
    const styles = createUseStyles({
        input: {
            paddingRight: 40,  
        },
        icon: {
            transform: 'translateY(-50%)',
            backgroundColor: 'inherit',
            top: '50%',
            width: 25,
            right: 8,
        },
    });
    const classes = styles();

    const [visible, setVisible] = useState(false);

    function onClick() {
        setVisible(p => !p);
    }

    return (
        <div className={classnames(containerClass, 'relative row')}>
            <input className={classnames(classes.input, className, 'input', props?.className)} type={visible ? 'text' : 'password'} {...props} />
            <Icon
                className={classnames(classes.icon, iconProps?.className, 'color-main absolute pointer')}
                path={visible ? mdiEye : mdiEyeOff}
                onClick={onClick}
                {...iconProps}
            />
        </div>
    );
}