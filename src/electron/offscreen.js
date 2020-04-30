/* @license
 * Copyright 2020  Dassault Systèmes - All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { app, BrowserWindow } = require('electron');

const url = require('url');
const path = require('path');
const fs = require('fs');

const argv = process.argv;
const args = argv.lastIndexOf('--') !== -1 ? argv.slice(argv.lastIndexOf('--') + 1) : [];

const ArgumentParser = require('argparse').ArgumentParser;
const parsedArgs = parseArguments(args);
global.sharedObject = { args: parsedArgs };

// app.disableHardwareAcceleration();

app.on('ready', () => createWindow(parsedArgs.res[0], parsedArgs.res[1]));

const outputFile = "output.png";

function parseArguments(args) {
    const parser = new ArgumentParser();

    parser.addArgument(
        'gltf_path',
        {
            nargs: "?",
            help: "The path of the glTF file"
        }
    );

    parser.addArgument(
        ["-r", "--res"],
        {
            defaultValue: [1024, 1024],
            metavar: ["WIDTH", "HEIGHT"],
            nargs: 2,
            type: "int",
            help: "Dimensions of the output image"
        }
    );

    parser.addArgument(
        ["-s", "--samples"],
        {
            defaultValue: 32,
            type: 'int',
            help: "Number of samples per pixel."
        }
    );

    parser.addArgument(
        '--ibl',
        {
            defaultValue: "None",
            type: 'string',
            help: 'The environment map path to use for image based lighting',
        }
    );

    const parsedArgs = parser.parseArgs(args);

    if (parsedArgs.gltf_path === null) {
        console.log("%s\n", parser.description);
        console.info("IMPORTANT NOTICE: \n\
            Add '-- --' to get your arguments through to the tool. \n\
            Example: 'npm run render -- -- --help'");
        console.error("\nNo gltf_path was given, doing nothing...");
    }

    return parsedArgs;
}


function createWindow(width, height) {
    const mainWindow = new BrowserWindow({
        width: width, height: height,
        webPreferences: {
            offscreen: true,
            nodeIntegration: true,
            webSecurity: false
        },
        frame: false 
    });

    //mainWindow.webContents.openDevTools();

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "../../dist/headless.html"),
        protocol: 'file',
        slashes: true
    }));

    // In main process.
    const { ipcMain } = require('electron');
    ipcMain.on('rendererReady', function () {
        mainWindow.webContents.capturePage().then(function(img) {
            fs.writeFile(outputFile, img.toPNG(), (err) => {
                console.log("Write image");
                if (err) throw err;
                console.log("The file has been saved to '%s'", outputFile);

                app.quit();
            });
        });
    });
}
