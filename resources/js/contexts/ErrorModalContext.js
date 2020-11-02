import React, { createContext, useState, useEffect } from 'react';

export const ErrorModalContext = createContext();

export default function ErrorModalContextProvider({ children }) {
    const [error, setError] = useState();

    useEffect(() => {
        const timeout = setTimeout(() => {
            setError(undefined);
        }, 2250);
        return () => {
            clearTimeout(timeout);
        }
    }, [error]);

    return (
        <ErrorModalContext.Provider value={{ error, setError }}>
            {children}
        </ErrorModalContext.Provider>
    );
}
