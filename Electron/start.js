const electron = require('electron');

const {
    app,
    BrowserWindow
} = electron;
let mainWindow;

app.allowRendererProcessReuse = true

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        webPreferences: {
            plugins: true,
            webgl:true,
            nodeIntegration:true
        },
        minWidth: 900,
        minHeight: 600,
        width: 1111,
        height: 600,
        backgroundColor:"#000000",
        fullscreen:true,
        // show:false,
        // kiosk:true,        
        // frame: false
    });
    // mainWindow.setKiosk(true)
    mainWindow.webContents.openDevTools();
    
    mainWindow.setMenu(null);
    mainWindow.loadURL(`chrome://falgs/`);
    
    mainWindow.webContents.on('crashed', () => {
        mainWindow.reload();
    })
    mainWindow.on('unresponsive', () => {
        mainWindow.reload();
    })
});



// "start": "electron --enable-accelerated-mjpeg-decode --enable-accelerated-video --ignore-gpu-blacklist --enable-native-gpu-memory-buffers --enable-gpu-rasterization .",
    