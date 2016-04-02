v.0.5.3

Core
- Add command `add-app` to add current dir as external app
- Add command `remove-app` to remove current dir as external app
- Move default command into `run` command
- When `silk` is run with no command, run the `run` command
- Update notification
- App id is saved in database
- Database stores if the install finished for each app
- Add eslint
- Fixed restarting apps
- Fork framework set's app process to app name
- Setup code climate to use eslint settings
- App framework uses default logo
- App framework will use productName in package.json if available
- Fixed calling server api's from apps using app framework
- Fixed prepublish script
- Stretto is now included with Silk when being published
- Fixed ids for apps using App Framework conflicting with apps using Fork Framework

File Explorer
- Opens to home folder instead of the root folder

Task Manager
- Only list apps that are running
- Fix restarting apps
- Fix memory chart scale

bower_static
- Pull bower routing out of core into module so apps can easily use it

Terminal
- Update tty.js
- Use new app framework

App Manager
- Use app framework

silk-electron
- Works on linux

v.0.5.2

Core
- Fix RSVP version

v.0.5.1

Core
- Fix RSVP version

v.0.5.0

Core
- External apps api. External apps are apps that are located outside of the app folder.
- Setup command to install default apps and window manager
- Apps are in separate repositories but are bundled when publishing
- App's url contains their id
- Npm Deps are installed in the app's folder
- Database stored in ~/.silk-gui
- App Manager more reliable
- Url to load in browser is always shown correctly
- Window Manager is loaded as app
- Improve error messages when failed installing bower deps for app
- Only install missing bower deps
- Remove globals
- Add server api to get state of apps
- Add apps/add server api which does what apps/start formerly did
- apps/start now starts an already added app
- Fix changed events in app loader
- Apps are not started automatically. The window manager has to use server apis to start an app.
- Headless apps always run
- New app framework that is compatible with electron
- Use electron instead of nw.js when silk runs with `--open` option.

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
