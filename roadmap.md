# Roadmap

## March - May

The focus will be on creating the best possible app experience. This will include a new app framework and app manager, 
installing updates and creating a new communication api to allow apps to communicate with each other. Also, the server api
will allow more finetuned notifications on changes which will be needed for the new app loader to communicate changes to
the window manager.

## June

The window manager will be improved. All of the styles will be cleaned up and made more consistent. We will add split screen to 
show multiple windows at once. There will be a new app menu that will replace the desktop.


## Todo
An incomplete list of what needs to be done

Features
- [ ] tests

App Loader
- [ ] Detect added or removed apps
- [ ] Send to client the remote urls

Window Manager
- [ ] maximize/restore windows
- [ ] drag windows
- [ ] resize windows
- [ ] App menu shows open windows
- [ ] Search apps and titles of open windows in app menu
- [ ] when remote, use port's remote url for apps on a different port

Services
- [ ] Add services folder and move app-defaults to it.
- [ ] Compile folder in app_loader

API
- [ ] change window title
- [ ] File picker
    - [ ] Save As
    - [ ] Open

- [ ] File Manager
    - [ ] Create new files
    - [ ] Rename files and folders
    - [ ] Favorite folders

- [ ] Tunnel Client
    - [ ] Start/stop remote
    - [ ] Show url
    - [ ] Explain how to use Silk-Server

Window.json
- [ ] disable running in remote

     "remote": {
         "enabled": false
      }

## Completed

## 0.4

- [x] Window Manager
    - [x] Load window manager as an app on server.  
    - [x] Create app.json and add bower dependencies to it
    - [x] Use server api to get list of apps and methods to send to client
    - [x] Make window manager object based.
    - [x] Make colors lighter so dark icons display better
    - [x] Change light icons to darker colors
    - [x] Have app menu appear over the desktop instead of beneath taskbar
- [x] Fix Bugs
    - [x] Crashes when app has error
    - [x] Crashes when app doesn't have server files
- [x] Remote
    - [x] Apps can list ports they use in app.json
    - [x] Remote starts all ports
    - [x] Server API to control remove
- [x] Start writing testes
    - [x] JS Hint
- [x] Core 
    - [x] API for apps to restart an app (ex. task manager can restart the text editor)
    - [x] API can add listeners on Silk objects and are run when the object changes
- [x] Terminal
    - [x] On open creates window and maximizes

- [x] App Manager
    - [x] Make icon darker shade of purple


## 0.3

- [x] Terminal
- [x] File Explorer create folders
- [x] Multiple windows for one app
- [x] App manager 
- [x] App menu
- [x] fix urls when remote.  localhost:3000/fileExplorer/index.html -> remote.address.com/fileExplorer/index.html
## 0.2

Window Manager
- Active Window - completed
- Close Window - completed
- style open programs in taskbar - completed
- clock - completed

Silk
- Default Programs - completed

File Explorer
- styling - completed

Text Editor
- Warn before opening file if one is open that is edited


### 0.1


**Methods**  - Completed

Duplicate meteor.js methods to allow easy communication between the server and client.  There are some limitations.  See the wiki page for details.


**Basic Window Management** - Completed

This first version will have a taskbar on the bottom and allow opening, closing and minimizing windows.  Windows will be maximized and non resizable.  Apps are opened in iframes.

**File Explorer**  - Completed

There will be a basic file explorer for navigating the files and folders.  It will allow going up one level, show the current path, and open folders when they are clicked.  It will try opening files in a text editor.

**Text Editor** - Completed

There will be a simple text editor that will open when a file is opened in the file explorer.  It will be able to save the file after edited.
