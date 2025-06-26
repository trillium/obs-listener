import { useCallback } from "react";
import OBSWebSocket from "obs-websocket-js";
import type { LogEntry } from "./useLogs";

interface UseOBSCommandsProps {
    obsRef: React.MutableRefObject<OBSWebSocket | null>;
    addLog: (type: LogEntry["type"], message: string, data?: unknown, command?: LogEntry["command"]) => void;
    isConnected: boolean;
}

interface SceneParams {
    sceneName: string;
}

interface SceneItemParams {
    sceneName: string;
    sceneItemId: number;
    sceneItemEnabled: boolean;
}

interface InputMuteParams {
    inputName: string;
    inputMuted: boolean;
}

interface InputVolumeParams {
    inputName: string;
    inputVolumeDb?: number;
    inputVolumeMul?: number;
}

export function useOBSCommands({ obsRef, addLog, isConnected }: UseOBSCommandsProps) {
    const executeCommand = useCallback(async (command: LogEntry["command"]) => {
        if (!obsRef.current || !isConnected || !command) {
            addLog("error", "Cannot execute command: not connected to OBS");
            return;
        }

        try {
            addLog("info", `Executing command: ${command.description}`, command.params);

            let result;
            switch (command.type) {
                case "SetCurrentProgramScene":
                    result = await obsRef.current.call("SetCurrentProgramScene", command.params as unknown as SceneParams);
                    const sceneParams = command.params as unknown as SceneParams;
                    addLog("info", `Scene changed to: ${sceneParams?.sceneName}`, result);
                    break;

                case "SetSceneItemEnabled":
                    result = await obsRef.current.call("SetSceneItemEnabled", command.params as unknown as SceneItemParams);
                    const itemParams = command.params as unknown as SceneItemParams;
                    const action = itemParams?.sceneItemEnabled ? "shown" : "hidden";
                    addLog("info", `Scene item ${action} in ${itemParams?.sceneName}`, result);
                    break;

                case "StartStream":
                    result = await obsRef.current.call("StartStream");
                    addLog("info", "Stream started", result);
                    break;

                case "StopStream":
                    result = await obsRef.current.call("StopStream");
                    addLog("info", "Stream stopped", result);
                    break;

                case "StartRecord":
                    result = await obsRef.current.call("StartRecord");
                    addLog("info", "Recording started", result);
                    break;

                case "StopRecord":
                    result = await obsRef.current.call("StopRecord");
                    addLog("info", "Recording stopped", result);
                    break;

                case "StartVirtualCam":
                    result = await obsRef.current.call("StartVirtualCam");
                    addLog("info", "Virtual camera started", result);
                    break;

                case "StopVirtualCam":
                    result = await obsRef.current.call("StopVirtualCam");
                    addLog("info", "Virtual camera stopped", result);
                    break;

                case "SetInputMute":
                    result = await obsRef.current.call("SetInputMute", command.params as unknown as InputMuteParams);
                    const muteParams = command.params as unknown as InputMuteParams;
                    const muteAction = muteParams?.inputMuted ? "muted" : "unmuted";
                    addLog("info", `${muteParams?.inputName} ${muteAction}`, result);
                    break;

                case "SetInputVolume":
                    result = await obsRef.current.call("SetInputVolume", command.params as unknown as InputVolumeParams);
                    const volumeParams = command.params as unknown as InputVolumeParams;
                    addLog("info", `Volume set for ${volumeParams?.inputName}`, result);
                    break;

                case "CreateScene":
                    result = await obsRef.current.call("CreateScene", command.params as unknown as SceneParams);
                    const createParams = command.params as unknown as SceneParams;
                    addLog("info", `Scene created: ${createParams?.sceneName}`, result);
                    break;

                case "RemoveScene":
                    result = await obsRef.current.call("RemoveScene", command.params as unknown as SceneParams);
                    const removeParams = command.params as unknown as SceneParams;
                    addLog("info", `Scene removed: ${removeParams?.sceneName}`, result);
                    break;

                default:
                    addLog("warning", `Unknown command type: ${command.type}`);
                    break;
            }

        } catch (error) {
            addLog("error", `Failed to execute command: ${command.description}`, error);
        }
    }, [obsRef, addLog, isConnected]);

    const createCommandFromEvent = useCallback((eventType: string, eventData: Record<string, unknown>): LogEntry["command"] | undefined => {
        switch (eventType) {
            case "CurrentProgramSceneChanged":
                return {
                    type: "SetCurrentProgramScene",
                    params: { sceneName: eventData.sceneName },
                    description: `Switch to scene "${eventData.sceneName}"`
                };

            case "SceneItemEnableStateChanged":
                return {
                    type: "SetSceneItemEnabled",
                    params: {
                        sceneName: eventData.sceneName,
                        sceneItemId: eventData.sceneItemId,
                        sceneItemEnabled: eventData.sceneItemEnabled
                    },
                    description: `${eventData.sceneItemEnabled ? "Show" : "Hide"} scene item in "${eventData.sceneName}"`
                };

            case "StreamStateChanged":
                if (eventData.outputActive) {
                    return {
                        type: "StartStream",
                        params: {},
                        description: "Start streaming"
                    };
                } else {
                    return {
                        type: "StopStream",
                        params: {},
                        description: "Stop streaming"
                    };
                }

            case "RecordStateChanged":
                if (eventData.outputActive) {
                    return {
                        type: "StartRecord",
                        params: {},
                        description: "Start recording"
                    };
                } else {
                    return {
                        type: "StopRecord",
                        params: {},
                        description: "Stop recording"
                    };
                }

            case "VirtualcamStateChanged":
                if (eventData.outputActive) {
                    return {
                        type: "StartVirtualCam",
                        params: {},
                        description: "Start virtual camera"
                    };
                } else {
                    return {
                        type: "StopVirtualCam",
                        params: {},
                        description: "Stop virtual camera"
                    };
                }

            case "InputMuteStateChanged":
                return {
                    type: "SetInputMute",
                    params: {
                        inputName: eventData.inputName,
                        inputMuted: eventData.inputMuted
                    },
                    description: `${eventData.inputMuted ? "Mute" : "Unmute"} "${eventData.inputName}"`
                };

            default:
                return undefined;
        }
    }, []);

    return {
        executeCommand,
        createCommandFromEvent
    };
}
