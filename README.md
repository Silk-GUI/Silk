# Silk

GUI For Developers (and Node OS)


###Plans
- Fast and Lightweight
- Have Features developers love
- Experiment with new ideas for GUI's
- Client (window manager) doesn't care if it is on the same or a different computer than the host.


### Version 0.1 To Do List


**Methods**  - Completed

Duplicate meteor.js methods to allow easy communication between the server and client.  There are some limitations.  See the wiki page for details.


**Basic Window Management** - Completed

This first version will have a taskbar on the bottom and allow opening, closing and minimizing windows.  Windows will be maximized and non resizable.  Apps are opened in iframes.

**File Explorer**

There will be a basic file explorer for navigating the files and folders.  It will allow going up one level, show the current path, and open folders when they are clicked.  It will try opening files in a text editor.

**Text Editor**

There will be a simple text editor that will open when a file is opened in the file explorer.  It will be able to save the file after edited.



##To Install
    npm i -g silk-gui 
    npm install
    npm start
