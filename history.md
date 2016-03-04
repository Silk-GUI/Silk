v.0.4
Core
- Switch to sockjs
- Show spinner until all apps are ready
- Apps have a name
- window.json was renamed to app.json
- Doesn't crash when app has an error
- Installs dependencies for apps
- Remote creates new url for each port apps use
- Watches for changes in an app's app.json
- Server api can listen for changes in the data it uses
- Open nw.js app with --open flag
- Server api for remote

Apps
- Redesign and rewrite for most apps.

v.0.3
Core
- bin.js only requires server.js.  Everything it did do is moved to server.js
- remote is moved to it's own file.  It is inside of a domain since it sometimes had uncaught errors.
- removed unnecessary console.logs or changed to debug()
- added method restartSingle to app loader to restart running apps.
- apps don't need zIndex, running or minimized in their window.json.  It is added for them.
- added Silk global.  It stores various information on parts of the Core so the server api can use it.
- added server api.  It is available in apps as Silk.api.  It is used similar to methods on client.  It currently has methods to restart and start apps and get a list of installed apps.
- moved methods global in apps to Silk.methods.  It is backwards compatible for now.
- ws is now at localhost:3000/websocket instead of on it's own port
- Silk url is shown in a box

Window Manager
- Moved from core to folder `window-manager`
- Added app menu
- Improved style of task bar and windows
- Apps can have multiple windows.  They need to enable it in their window.json
- added tooltips for apps on taskbar with their title.

Remote
remote is partially fixed. It now loads icons and apps, but web sockets don't work yet.

Apps
 - app defaults
    - if the settings file doesn't exist, it creates it.

- added App Manager
    - installs and removes apps.  It starts an app after installing it.

- file explorer
    - creates folders
    - changed color of logo
    - supports multiple windows

- added task manager
    - restart running apps

- added terminal.  Uses tty.js. 

- text editor
    - cmd + s or control + s saves file
    - correctly handles tab key.
    - changed color of logo
    - supports multiple windows

v.0.2
- Default programs to open files
- Apps run in their own process @formula1 
- Improved UI
- CLI
- Clock on task bar

v.0.1
- Edit files using the text editor
- Navigate your folders and files using the file explorer
