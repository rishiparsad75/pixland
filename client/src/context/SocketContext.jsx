import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Use backend API URL from environment variable
        // In production, this will be the Azure backend URL
        // In development, it will be localhost:5000
        const apiUrl = import.meta.env.VITE_API_URL || `http://localhost:5000`;

        // Remove /api suffix if present
        const baseUrl = apiUrl.replace('/api', '');
        const isSecure = baseUrl.startsWith('https://');

        console.log("[SocketContext] Connecting to:", baseUrl);

        const newSocket = io(baseUrl, {
            transports: ['websocket', 'polling'], // Fallback options
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            secure: isSecure, // Use secure connection based on protocol
            rejectUnauthorized: false // For development
        });

        newSocket.on('connect', () => {
            console.log('[SocketContext] Connected to server, socket ID:', newSocket.id);
        });

        newSocket.on('disconnect', (reason) => {
            console.log('[SocketContext] Disconnected:', reason);
        });

        newSocket.on('connect_error', (error) => {
            console.error('[SocketContext] Connection error:', error.message);
        });

        setSocket(newSocket);

        return () => {
            console.log('[SocketContext] Cleaning up socket connection');
            newSocket.close();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
