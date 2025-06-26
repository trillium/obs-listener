// Type definitions for OBS WebSocket events and data structures

export interface OBSEventData {
    [key: string]: unknown;
}

export interface SceneChangedData extends OBSEventData {
    sceneName: string;
    sceneUuid: string;
}

export interface SceneItemStateData extends OBSEventData {
    sceneName: string;
    sceneUuid: string;
    sceneItemId: number;
    sceneItemEnabled: boolean;
}

export interface StreamStateData extends OBSEventData {
    outputActive: boolean;
    outputState: string;
}

export interface RecordStateData extends OBSEventData {
    outputActive: boolean;
    outputState: string;
    outputPath?: string;
}

export interface InputMuteStateData extends OBSEventData {
    inputName: string;
    inputUuid: string;
    inputMuted: boolean;
}

export interface InputVolumeData extends OBSEventData {
    inputName: string;
    inputUuid: string;
    inputVolumeMul: number;
    inputVolumeDb: number;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type LogType = 'info' | 'warning' | 'error' | 'event' | 'request' | 'response';
