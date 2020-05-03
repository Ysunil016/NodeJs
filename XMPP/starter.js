const electron = require('electron');

const {
    app,
    BrowserWindow
} = electron;
let mainWindow;
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
    mainWindow.loadURL(`file://${__dirname}/Resources/views/login.html`);
    
    // mainWindow.on('ready-to-show',()=>{
    //     mainWindow.quit()
    //     mainWindow.show();
    // })


    mainWindow.webContents.on('crashed', () => {
        mainWindow.reload();
    })
    mainWindow.on('unresponsive', () => {
        mainWindow.reload();
    })

});


app.on('gpu-process-crashed',()=>{
    mainWindow.reload();
})

//KILL ALL THE PROCESS AFTER APPLICATION CLOSES
app.on('window-all-closed', function () {
    app.removeAsDefaultProtocolClient('udp');
    app.removeAllListeners('close');
    app.quit();
});