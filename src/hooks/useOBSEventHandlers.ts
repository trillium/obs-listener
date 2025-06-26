import { useCallback } from "react";
import OBSWebSocket from "obs-websocket-js";
import type { LogEntry } from "./useLogs";

interface UseOBSEventHandlersProps {
    addLog: (type: LogEntry["type"], message: string, data?: unknown, command?: LogEntry["command"]) => void;
    setIsConnected: (connected: boolean) => void;
    setConnectionStatus: (status: "connected" | "connecting" | "disconnected" | "error") => void;
    createCommandFromEvent: (eventType: string, eventData: Record<string, unknown>) => LogEntry["command"] | undefined;
}

export function useOBSEventHandlers({
    addLog,
    setIsConnected,
    setConnectionStatus,
    createCommandFromEvent,
}: UseOBSEventHandlersProps) {
    const setupEventHandlers = useCallback((obs: OBSWebSocket) => {
        // Connection events
        obs.on("ConnectionOpened", () => {
            addLog("info", "WebSocket connection opened");
        });

        obs.on("ConnectionClosed", () => {
            addLog("warning", "WebSocket connection closed");
            setIsConnected(false);
            setConnectionStatus("disconnected");
        });

        obs.on("ConnectionError", (error) => {
            addLog("error", "Connection error", error);
            setConnectionStatus("error");
        });

        obs.on("Identified", () => {
            addLog("info", "Successfully connected to OBS");
            setIsConnected(true);
            setConnectionStatus("connected");
        });

        // Scene events
        obs.on("CurrentProgramSceneChanged", (data) => {
            const command = createCommandFromEvent("CurrentProgramSceneChanged", data);
            addLog("event", `Scene changed to: ${data.sceneName}`, data, command);
        });

        obs.on("SceneCreated", (data) => {
            addLog("event", `Scene created: ${data.sceneName}`, data);
        });

        obs.on("SceneRemoved", (data) => {
            addLog("event", `Scene removed: ${data.sceneName}`, data);
        });

        // Scene item events
        obs.on("SceneItemEnableStateChanged", (data) => {
            const action = data.sceneItemEnabled ? "shown" : "hidden";
            const command = createCommandFromEvent("SceneItemEnableStateChanged", data);
            addLog("event", `Scene item ${action} in ${data.sceneName}`, data, command);
        });

        obs.on("SceneItemCreated", (data) => {
            addLog("event", `Scene item created in ${data.sceneName}`, data);
        });

        obs.on("SceneItemRemoved", (data) => {
            addLog("event", `Scene item removed from ${data.sceneName}`, data);
        });

        // Stream/recording events
        obs.on("StreamStateChanged", (data) => {
            const status = data.outputActive ? "started" : "stopped";
            const command = createCommandFromEvent("StreamStateChanged", data);
            addLog("event", `Stream ${status} (${data.outputState})`, data, command);
        });

        obs.on("RecordStateChanged", (data) => {
            const status = data.outputActive ? "started" : "stopped";
            const command = createCommandFromEvent("RecordStateChanged", data);
            addLog("event", `Recording ${status} (${data.outputState})`, data, command);
        });

        obs.on("VirtualcamStateChanged", (data) => {
            const status = data.outputActive ? "started" : "stopped";
            const command = createCommandFromEvent("VirtualcamStateChanged", data);
            addLog("event", `Virtual camera ${status} (${data.outputState})`, data, command);
        });

        // Input events
        obs.on("InputCreated", (data) => {
            addLog("event", `Input created: ${data.inputName} (${data.inputKind})`, data);
        });

        obs.on("InputRemoved", (data) => {
            addLog("event", `Input removed: ${data.inputName}`, data);
        });

        obs.on("InputMuteStateChanged", (data) => {
            const status = data.inputMuted ? "muted" : "unmuted";
            const command = createCommandFromEvent("InputMuteStateChanged", data);
            addLog("event", `${data.inputName} ${status}`, data, command);
        });

        obs.on("InputVolumeChanged", (data) => {
            addLog(
                "event",
                `${data.inputName} volume: ${Math.round(
                    data.inputVolumeMul * 100
                )}% (${data.inputVolumeDb.toFixed(1)} dB)`,
                data
            );
        });

        // Media events
        obs.on("MediaInputPlaybackStarted", (data) => {
            addLog("event", `Media playback started: ${data.inputName}`, data);
        });

        obs.on("MediaInputPlaybackEnded", (data) => {
            addLog("event", `Media playback ended: ${data.inputName}`, data);
        });
    }, [addLog, setIsConnected, setConnectionStatus, createCommandFromEvent]);

    return { setupEventHandlers };
}
