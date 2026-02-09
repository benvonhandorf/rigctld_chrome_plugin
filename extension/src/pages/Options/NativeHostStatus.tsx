import React, { useEffect, useState } from 'react';
import { Alert, Button, CircularProgress, Collapse, Link } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import { CheckNativeHostMessage, MessageType, NativeHostStatusInfo } from '../../Messages';

type ConnectionState = 'checking' | 'connected' | 'disconnected';

const NativeHostStatus = () => {
    const [connectionState, setConnectionState] = useState<ConnectionState>('checking');
    const [error, setError] = useState<string | null>(null);
    const [version, setVersion] = useState<string | null>(null);
    const [showHelp, setShowHelp] = useState(false);

    const checkConnection = () => {
        setConnectionState('checking');
        setError(null);

        chrome.runtime.sendMessage(new CheckNativeHostMessage(), (response) => {
            if (response?.type === MessageType.NativeHostStatus) {
                const status: NativeHostStatusInfo = response.status;
                if (status.connected) {
                    setConnectionState('connected');
                    setVersion(status.version || null);
                    setShowHelp(false);
                } else {
                    setConnectionState('disconnected');
                    setError(status.error || 'Connection failed');
                    setShowHelp(true);
                }
            } else {
                setConnectionState('disconnected');
                setError('Invalid response from background script');
                setShowHelp(true);
            }
        });
    };

    useEffect(() => {
        checkConnection();
    }, []);

    const getPlatformInstructions = () => {
        const isLinux = navigator.userAgent.includes('Linux');
        const isMac = navigator.userAgent.includes('Mac');

        if (isMac) {
            return {
                hostPath: '~/Library/Application Support/Google/Chrome/NativeMessagingHosts/',
                command: './install.sh'
            };
        }
        return {
            hostPath: '~/.config/google-chrome/NativeMessagingHosts/',
            command: './install.sh'
        };
    };

    const instructions = getPlatformInstructions();

    return (
        <div className="native-host-status">
            <div className="status-row">
                {connectionState === 'checking' && (
                    <>
                        <CircularProgress size={20} />
                        <span className="status-text">Checking native host connection...</span>
                    </>
                )}
                {connectionState === 'connected' && (
                    <>
                        <CheckCircleIcon color="success" />
                        <span className="status-text status-connected">
                            Native host connected
                            {version && <span className="version"> (v{version})</span>}
                        </span>
                    </>
                )}
                {connectionState === 'disconnected' && (
                    <>
                        <ErrorIcon color="error" />
                        <span className="status-text status-disconnected">
                            Native host not connected
                        </span>
                    </>
                )}
                <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={checkConnection}
                    disabled={connectionState === 'checking'}
                >
                    Retry
                </Button>
            </div>

            <Collapse in={connectionState === 'disconnected' && showHelp}>
                <Alert severity="warning" sx={{ mt: 2 }}>
                    <div className="help-content">
                        <p><strong>The native messaging host is not installed or configured correctly.</strong></p>

                        {error && (
                            <p className="error-detail">Error: {error}</p>
                        )}

                        <p><strong>To install the native host:</strong></p>
                        <ol>
                            <li>
                                Navigate to the <code>host/</code> directory in the project
                            </li>
                            <li>
                                Update <code>com.skyironstudio.rigctld_native_messaging_host.json</code> with your extension ID:
                                <br />
                                <code className="extension-id">chrome-extension://{chrome.runtime.id}/</code>
                            </li>
                            <li>
                                Run the install script:
                                <br />
                                <code>{instructions.command}</code>
                            </li>
                            <li>
                                Restart Chrome completely
                            </li>
                        </ol>

                        <p>
                            The native host manifest should be installed at:
                            <br />
                            <code>{instructions.hostPath}</code>
                        </p>
                    </div>
                </Alert>
            </Collapse>
        </div>
    );
};

export default NativeHostStatus;
