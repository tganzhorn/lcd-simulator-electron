<img alt="Logo" height="60" src="https://github.com/tganzhorn/lcd-simulator-electron/raw/master/public/ms-icon-310x310.png" align="right" title="LCD-Simulator" />

# LCD-Simulator
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[<img alt="GitHub release (latest SemVer)" src="https://img.shields.io/github/v/release/tganzhorn/lcd-simulator-electron">](https://github.com/tganzhorn/lcd-simulator-electron/releases/latest)
[<img alt="GitHub release (latest by date)" src="https://img.shields.io/github/downloads/tganzhorn/lcd-simulator-electron/latest/total">](https://github.com/tganzhorn/lcd-simulator-electron/releases/latest)
[<img alt="GitHub issues" src="https://img.shields.io/github/issues-raw/tganzhorn/lcd-simulator-electron">](https://github.com/tganzhorn/lcd-simulator-electron/issues)


## Table of content
- [About](#about)
- [Development](#development)
	- [IDE](#ide)
	- [Environment](#environment)
		- [Install dependencies](#install-dependencies)
		- [Start development Server](#start-development-server)
		- [Bundle Application](#bundle-application)
	- [Add display commands](#add-display-commands)
- [Supported commands](#supported-commands) 
	- [Display commands](#display-commands)
	- [Debug commands](#debug-commands)

## About
This project is a simple LCD Simulator for the Mikrocontroller-Labor-Board ([HS-Pforzheim](https://www.hs-pforzheim.de/)). We only support Windows 7+, due to end of life issues.

![Windows](https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Electron.js](https://img.shields.io/badge/Electron-191970?style=for-the-badge&logo=Electron&logoColor=white)


Build with [electron](https://www.electronjs.org/), [react](https://reactjs.org/) and [typescript](https://www.typescriptlang.org/).
## Development
### IDE
![Visual Studio Code](https://img.shields.io/badge/Visual%20Studio%20Code-0078d7.svg?style=for-the-badge&logo=visual-studio-code&logoColor=white)

For the best development experience please use [Visual Studio Code](https://code.visualstudio.com/). 
### Environment
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)

In order to start developing you need to install the latest LTS version of [NodeJS](https://nodejs.org/en/) >= 14.17.6.

Be aware that all commands in the following chapters need to be called from some commandline (PowerShell, CMD), at the root of the project folder.

#### Install dependencies
To install all the needed dependencies just call the following command:

`npm install`

You only have to call this command after the initial clone.
#### Start development server
Calling the following command runs a new React development server plus the electron development server concurrently.

`npm run start`
#### Bundle application
Finally you can build and bundle the application into a setup executable, which can be installed on any Windows 7+ device, by running the following command.

`npm run bundle`
### Add display commands

This paragraph is currently a stub, maybe the author wants to write something here!

## Supported commands
A question mark after an unticked command means that we can receive the command and process it, the implementation is just not quite right yet.
### Display commands
- [x] GLCD_DisplayChars
- [x] GLCD_SetTextCursor
- [ ] GLCD_SetRow (?)
- [ ] GLCD_SetColumn (?)
- [x] GLCD_PrintColumn
- [x] GLCD_PrintMulColumn
- [x] GLCD_PrintText
- [x] GLCD_PrintChar
- [ ] GLCD_PrintGrafikLine
- [x] GLCD_ClearRow
- [x] GLCD_ClearLCD
### Debug commands
- [x] Printing uint(8/16/32) to hexadecimal, decimal and binary.
- [x] Printing status messages (error, ok, etc.)
