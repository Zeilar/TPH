import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createUseStyles } from 'react-jss';

export default function User({ user }) {
    return (
        <div>
            <p>{user.username}</p>
        </div>
    );
}