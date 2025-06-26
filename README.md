# OBS WebSocket Listener

A Next.js application for monitoring and analyzing OBS 4. **Export Data**: Click "Export" to download logs as JSON for further analysis

## Environment Configuration

You can set default connection values using environment variables in a `.env.local` file:

```env
# Default OBS WebSocket password (leave empty if no password)
NEXT_PUBLIC_OBS_DEFAULT_PASSWORD=your_password_here

# Default connection address (usually localhost)
NEXT_PUBLIC_OBS_DEFAULT_ADDRESS=localhost

# Default WebSocket port (OBS default is 4455)
NEXT_PUBLIC_OBS_DEFAULT_PORT=4455
```

**Benefits of using environment variables:**

- Pre-fill connection settings automatically
- Avoid typing passwords repeatedly during development
- Secure storage of credentials (ensure `.env.local` is in `.gitignore`)
- Easy configuration for different environments
- **Consistent port configuration** - Uses port 7328 by default for reliable localStorage persistence

**Security Note:** The `NEXT_PUBLIC_` prefix makes these variables available to the client-side code. Only use this for non-sensitive defaults. For production deployments, consider server-side configuration.

## Features

- **Real-time WebSocket monitoring** - Connect to OBS Studio and monitor all WebSocket traffic
- **Enhanced event details** - Shows detailed information with JSON data for each event
- **Command rerun functionality** - Rerun previous commands with a simple click from the log history
- **Smart command history** - Automatically tracks rerunnable commands from OBS events for easy access
- **Smart notifications** - Toast notifications for important events and environment settings
- **Auto-connection** - Automatically attempt to connect on app load (configurable)
- **Event filtering** - Filter logs by type (info, warning, error, events)
- **Search functionality** - Search through log messages and event data
- **Auto-scroll** - Automatically scroll to new logs as they arrive
- **Log export** - Export logs to JSON format for analysis
- **Copy event data** - One-click copy of JSON data for each event
- **Modern UI** - Clean, responsive interface with dark mode support
- **Connection management** - Easy connect/disconnect with status indicators and hamburger menu for settings
- **Environment configuration** - Pre-configure settings via environment variables

## Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [OBS Studio](https://obsproject.com/) with WebSocket server enabled
- [pnpm](https://pnpm.io/) (recommended) or npm

## OBS Studio Setup

1. Open OBS Studio
2. Go to **Tools** → **WebSocket Server Settings**
3. Check **Enable WebSocket server**
4. Note the **Server Port** (default: 4455)
5. Set a **Server Password** (optional but recommended)
6. Click **OK**

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd obs-listener
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

3. Configure environment variables (optional):

**Option A: Using the setup script (recommended)**

```bash
pnpm setup
# or
npx tsx setup.ts
```

This TypeScript setup script provides an interactive configuration experience.

**Option B: Manual configuration**

```bash
cp .env.example .env.local
```

Edit `.env.local` to set your default configuration:

```env
# Application Configuration
PORT=7328

# OBS WebSocket Configuration
NEXT_PUBLIC_OBS_DEFAULT_PASSWORD=your_obs_password
NEXT_PUBLIC_OBS_DEFAULT_ADDRESS=localhost
NEXT_PUBLIC_OBS_DEFAULT_PORT=4455
NEXT_PUBLIC_OBS_AUTO_CONNECT=true
```

4. Run the development server:

```bash
pnpm dev
# or
npm run dev
```

5. Open [http://localhost:7328](http://localhost:7328) in your browser (or the port you configured in `.env.local`)

## Usage

1. **Configure Connection**: Click the hamburger menu (☰) in the app header to access connection settings:

   - **Address**: Usually `localhost` (default)
   - **Port**: The port from OBS WebSocket settings (default: `4455`)
   - **Password**: The password you set in OBS (if any)

2. **Connect**: Click the "Connect" button in the header to establish connection with OBS (or enable auto-connection in your environment variables)

3. **Streamlined Interface**: The connection settings are now neatly tucked away in a hamburger menu to maximize screen space for monitoring:

   - Click the hamburger menu button (☰) to open/close connection settings
   - The header always shows connection status and quick connect/disconnect button
   - Menu automatically closes when you successfully connect to save space
   - Settings can only be modified when disconnected for safety

4. **Monitor Events**: Once connected, you'll see real-time logs of all WebSocket events:

   - Scene changes
   - Source visibility changes
   - Stream/recording state changes
   - Audio level changes
   - And much more!

5. **Rerun Commands**: For events that can be repeated (like scene changes, muting, etc.):

   - Look for the "🔄 Rerun" button next to log entries
   - Click to instantly repeat that action in OBS

6. **Command History**: Access your command history panel to see:

   - **Most Used**: Commands you run frequently, with usage counts
   - **Recent**: Recently executed or detected rerunnable commands
   - All rerunnable commands are automatically tracked from OBS events
   - Click "🔄 Run" to repeat any command from your history
   - Commands persist between app sessions for convenience

7. **Filter Logs**: Use the filter dropdown to show only specific types of events

8. **Export Data**: Click "Export" to download logs as JSON for further analysis

## Monitored Events

The application automatically listens for common OBS events including:

- `CurrentProgramSceneChanged` - When the active scene changes _(rerunnable)_
- `SceneItemEnableStateChanged` - When sources are shown/hidden _(rerunnable)_
- `StreamStateChanged` - When streaming starts/stops _(rerunnable)_
- `RecordStateChanged` - When recording starts/stops _(rerunnable)_
- `VirtualcamStateChanged` - When virtual camera starts/stops _(rerunnable)_
- `InputMuteStateChanged` - When audio sources are muted/unmuted _(rerunnable)_
- `InputVolumeChanged` - When audio levels change
- `SceneCreated` - When new scenes are created
- `SceneRemoved` - When scenes are deleted
- `InputCreated` - When new inputs are added
- `InputRemoved` - When inputs are removed

**Rerunnable Commands**: Events marked as _(rerunnable)_ can be repeated by clicking the "⋯" menu next to the log entry and selecting "🔄 Rerun command". This allows you to quickly repeat actions like switching scenes, toggling sources, or starting/stopping streams.

## Development

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with clsx for dynamic className management
- **WebSocket**: obs-websocket-js library
- **Package Manager**: pnpm

### Project Structure

```
src/
├── app/
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Main dashboard page
│   └── globals.css     # Global styles
├── components/
│   ├── OBSListener.tsx # Main WebSocket listener orchestrator
│   ├── AppHeader.tsx   # App header with hamburger menu and connection settings
│   ├── LogControls.tsx # Log filtering and control buttons
│   ├── LogDisplay.tsx  # Log viewer container
│   └── LogEntryItem.tsx # Individual log entry component
├── hooks/
│   ├── useLogs.ts      # Log management and filtering logic
│   └── useOBSEventHandlers.ts # OBS WebSocket event handling
├── lib/
│   └── config.ts       # Configuration utilities and validation
└── types/
    └── obs.ts          # TypeScript type definitions for OBS
setup.ts                # Interactive environment setup script
```

### Building for Production

```bash
pnpm build
pnpm start
```

## Troubleshooting

### Connection Issues

- **"Failed to connect"**: Ensure OBS Studio is running and WebSocket server is enabled
- **"Connection refused"**: Check that the port matches your OBS WebSocket settings
- **"Authentication failed"**: Verify the password is correct (leave empty if no password is set)

### Common Solutions

1. Restart OBS Studio if WebSocket server becomes unresponsive
2. Check firewall settings if connecting to a remote OBS instance
3. Ensure you're using the correct WebSocket protocol version (obs-websocket-js v5 for OBS 28+)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Acknowledgments

This project was developed with the assistance of **Claude Sonnet 4** by Anthropic. Claude provided significant help with:

- Code architecture and component design
- TypeScript implementation and type safety
- React hooks and state management patterns
- UI/UX improvements and accessibility features
- Code organization and best practices
- Documentation and project structure

The AI assistance helped accelerate development while maintaining high code quality and modern React patterns.

## License

This project is open source and available under the [MIT License](LICENSE).
