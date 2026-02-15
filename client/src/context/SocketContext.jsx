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

        const newSocket = io(serverUrl, {
            transports: ['websocket', 'polling'], // Fallback options
        });

        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
