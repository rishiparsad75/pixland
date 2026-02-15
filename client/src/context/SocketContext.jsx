import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Use window.location.hostname to connect to the server on the same network
        // Port 5000 is the backend port
        const serverUrl = `http://${window.location.hostname}:5000`;
        console.log("[SocketContext] Connecting to:", serverUrl);

        const newSocket = io(serverUrl, {
            transports: ['websocket', 'polling'], // Fallback options
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
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
