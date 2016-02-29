The app framework replaces the fork framework. The app framework attempts to 
replicate how apps run in electron. This opens the possibilities of electron apps
running in Silk with no modifications. Also, silk apps could run on other 
operating systems, with no modifications, by using electron.

If an app has no silk.json but contains a package.json, the app framework will
be used instead of the fork framework.
