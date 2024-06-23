import { createUseStyles } from 'react-jss';
import classnames from 'classnames';
import React from 'react';

export default function CrudField({ field = {}, updateField, ...props }) {
    const styles = createUseStyles({
        label: {
            fontFamily: 'Montserrat',
            fontSize: '0.8rem',
        },
    });
    const classes = styles();

    function onChangeHandler(e) {
        updateField(p => {
            const old = p;
            return old.map(element => {
                if (element.title === field.title) {
                    element.value = e.target.value;
                }
                return element;
            });
        });
    }

    return (
        <div className={classnames('col')}>
            <label className={classnames(classes.label, 'mb-2 caps bold')}>{field.title}</label>
            <input className={classnames('input')} type={props.type ?? 'text'} value={field.value} onChange={onChangeHandler} {...props} />
        </div>
    );
}
