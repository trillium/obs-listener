// Environment configuration utilities for OBS WebSocket connection

export interface OBSConfig {
    address: string;
    port: string;
    password: string;
}

export const getDefaultOBSConfig = (): OBSConfig => {
    return {
        address: process.env.NEXT_PUBLIC_OBS_DEFAULT_ADDRESS || 'localhost',
        port: process.env.NEXT_PUBLIC_OBS_DEFAULT_PORT || '4455',
        password: process.env.NEXT_PUBLIC_OBS_DEFAULT_PASSWORD || ''
    };
};

export const validateOBSConfig = (config: Partial<OBSConfig>): string[] => {
    const errors: string[] = [];

    if (!config.address || config.address.trim() === '') {
        errors.push('Address is required');
    }

    if (!config.port || config.port.trim() === '') {
        errors.push('Port is required');
    } else {
        const portNum = parseInt(config.port, 10);
        if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
            errors.push('Port must be a valid number between 1 and 65535');
        }
    }

    return errors;
};

// Environment variable names for reference
export const ENV_VARS = {
    ADDRESS: 'NEXT_PUBLIC_OBS_DEFAULT_ADDRESS',
    PORT: 'NEXT_PUBLIC_OBS_DEFAULT_PORT',
    PASSWORD: 'NEXT_PUBLIC_OBS_DEFAULT_PASSWORD'
} as const;
