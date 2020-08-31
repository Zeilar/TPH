import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState, useRef, useEffect } from 'react';

export default function PasswordToggler() {
    const [type, setType] = useState('password');
    const icon = useRef();

    function togglePassword() {
        const htmlId = icon.current.parentNode.getAttribute('data-id');
        const newType = type === 'password' ? 'text' : 'password';
        document.getElementById(htmlId).setAttribute('type', newType);
        setType(newType);
    }

    useEffect(() => {
        const htmlId = icon.current.parentNode.getAttribute('data-id');
        const currentType = document.getElementById(htmlId).getAttribute('type') === 'password' ? 'password' : 'text';
        setType(currentType);
    });

    return <FontAwesomeIcon forwardedRef={icon} icon={type === 'password' ? faEye : faEyeSlash} onClick={togglePassword} />;
}