"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import type { ConnectionStatus } from "@/types/obs";

interface ConnectionConfig {
  address: string;
  port: string;
  password: string;
}

interface AppHeaderProps {
  config: ConnectionConfig;
  setConfig: React.Dispatch<React.SetStateAction<ConnectionConfig>>;
  connectionStatus: ConnectionStatus;
  isConnected: boolean;
  validationErrors: string[];
  onConnect: () => void;
  onDisconnect: () => void;
  onShowEnvironmentToast?: () => void;
}

export default function AppHeader({
  config,
  setConfig,
  connectionStatus,
  isConnected,
  validationErrors,
  onConnect,
  onDisconnect,
  onShowEnvironmentToast,
}: AppHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasAutoClosedMenu, setHasAutoClosedMenu] = useState(false);

  // Auto-close menu when first connected (but allow manual toggle afterwards)
  useEffect(() => {
    if (isConnected && !hasAutoClosedMenu && isMenuOpen) {
      setIsMenuOpen(false);
      setHasAutoClosedMenu(true);
    } else if (!isConnected) {
      // Reset auto-close flag when disconnected
      setHasAutoClosedMenu(false);
    }
  }, [isConnected, hasAutoClosedMenu, isMenuOpen]);

  // Handle environment defaults toast
  const hasEnvironmentDefaults =
    process.env.NEXT_PUBLIC_OBS_DEFAULT_PASSWORD ||
    process.env.NEXT_PUBLIC_OBS_DEFAULT_ADDRESS !== "localhost" ||
    process.env.NEXT_PUBLIC_OBS_DEFAULT_PORT !== "4455" ||
    process.env.NEXT_PUBLIC_OBS_AUTO_CONNECT !== undefined;

  useEffect(() => {
    if (hasEnvironmentDefaults && onShowEnvironmentToast) {
      onShowEnvironmentToast();
    }
  }, [hasEnvironmentDefaults, onShowEnvironmentToast]);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case "connected":
        return "text-green-600 dark:text-green-400";
      case "connecting":
        return "text-yellow-600 dark:text-yellow-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };
  return (
    <header className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
      <div className="flex items-center justify-between p-6">
        {/* Left side: Title, subtitle and status */}
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              OBS WebSocket Listener
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Monitor and analyze OBS Studio WebSocket traffic in real-time
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div
              className={clsx("w-3 h-3 rounded-full", {
                "bg-green-500": connectionStatus === "connected",
                "bg-yellow-500": connectionStatus === "connecting",
                "bg-red-500": connectionStatus === "error",
                "bg-gray-400": connectionStatus === "disconnected",
              })}
            />
            <span className={clsx("text-sm font-medium", getStatusColor())}>
              {connectionStatus.charAt(0).toUpperCase() +
                connectionStatus.slice(1)}
            </span>
          </div>
        </div>

        {/* Right side: Quick actions and hamburger menu */}
        <div className="flex items-center space-x-3">
          {/* Quick connect/disconnect button */}
          <button
            onClick={isConnected ? onDisconnect : onConnect}
            disabled={connectionStatus === "connecting"}
            className={clsx(
              "px-4 py-2 rounded-md text-white font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed",
              {
                "bg-red-600 hover:bg-red-700": isConnected,
                "bg-blue-600 hover:bg-blue-700": !isConnected,
              }
            )}
          >
            {connectionStatus === "connecting"
              ? "Connecting..."
              : isConnected
              ? "Disconnect"
              : "Connect"}
          </button>

          {/* Hamburger menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Dropdown menu with connection settings */}
      <div
        className={clsx(
          "overflow-hidden transition-all duration-300 ease-in-out border-t border-gray-200 dark:border-gray-700",
          {
            "max-h-0": !isMenuOpen,
            "max-h-screen": isMenuOpen,
          }
        )}
      >
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Connection Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address
              </label>
              <input
                type="text"
                value={config.address}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, address: e.target.value }))
                }
                disabled={isConnected}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 disabled:opacity-50"
                placeholder="localhost"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Port
              </label>
              <input
                type="text"
                value={config.port}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, port: e.target.value }))
                }
                disabled={isConnected}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 disabled:opacity-50"
                placeholder="4455"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={config.password}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, password: e.target.value }))
                }
                disabled={isConnected}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-700 disabled:opacity-50"
                placeholder="Optional"
              />
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <div className="flex">
                <div className="text-red-800 dark:text-red-200">
                  <h4 className="text-sm font-medium">Configuration errors:</h4>
                  <ul className="mt-1 text-sm list-disc list-inside">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
