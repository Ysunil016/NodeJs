window.localStorage.setItem('server_ip', null);
const properties = require("../data/Properties");
const btoa = require('btoa');

// const path = require('path');
// const server_file_data = require(path.join(path.dirname(__dirname), "../../server_ip.js"));
// const server_data = JSON.parse(JSON.stringify(server_file_data));
// const primary_server_ips = server_data.primary_ip;

const primary_server_ips = "localhost";


window.localStorage.setItem('server_ip', primary_server_ips);

properties.pingAServer(primary_server_ips)

stageOneDisplay();

// TEMP
// window.localStorage.setItem('username', 'RAJPUT_SCO')
// window.location = "index.html"


// Login Service to Call an API with User Cred
function requestForLogintoAPI() {

  var server_ip = window.localStorage.getItem('server_ip');
  console.log(server_ip);

  if (server_ip != null) {

    var apiForLogin = "http://" + server_ip + ":6969/authenticationservice/authentication/login";

    var username = document.getElementById('loginUsername').value
    var password = document.getElementById('loginPassword').value

    var usernameSplit = username.split('_')
    var unitName = usernameSplit[0]
    require('getmac').getMac(function (err, macAddress) {
      if (err) throw err
      var ip = getIP()
      document.getElementById('loginUsername').value = ''
      document.getElementById('loginPassword').value = ''
      var authKey = window.localStorage.getItem('authKey')

      var dataToBeSent = JSON.stringify({
        username: username,
        password: password,
        mac: macAddress,
        ip: ip,
        authKey: authKey,
        unit: unitName
      })
      // console.log(dataToBeSent)
      var xhr = new XMLHttpRequest();
      xhr.timeout = 20000;
      xhr.open('POST', apiForLogin, true)
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
      xhr.send(dataToBeSent);

      //MAKING PRELOADER AVAILABLE
      $('#preloader-login').css({
        display: 'block'
      });

      xhr.onreadystatechange = function () {
        if (xhr.status === 200 && xhr.readyState === 4) {
          var json = JSON.parse(xhr.responseText)
          if (json.valid == 1) {
            window.localStorage.setItem('username', username);
            window.localStorage.setItem('password', password);
            window.localStorage.setItem('clientData', JSON.stringify(json));
            window.location = 'index.html'
          } else {
            $('#preloader-login').css({
              display: 'none'
            })

            //NOTIFY USER FOR ITS INCORRECT PASSWORD
            lobiMsg = '<i><h4>Username Or Password Doesn\'t Match<h4></i>'
            lobiNotification('error', 'Login Error', lobiMsg, 'top center', window.innerWidth * .4)
            stageOneDisplay();
          }
        } else if (xhr.readyState === 4 && xhr.status !== 200) {
          var lobiMsg = '<h4>Connectivity Lost</h4>';
          lobiNotification('error', 'Rukmani Unavailable', lobiMsg, 'bottom center', window.innerWidth * .4)

          properties.handleHopping();

          stageOneDisplay();

          if (xhr.ontimeout) {
            $('#preloader-login').css({
              display: 'none'
            })
            stageOneDisplay();
            var lobiMsg = '<h4>Connectivity Lost</h4>';
            lobiNotification('error', 'Rukmani Unavailable', lobiMsg, 'bottom center', window.innerWidth)
            stageOneDisplay();
          }
        }
      }
    })
  } else {
    lobiNotification('warning', 'Setting Up the Available Server', lobiMsg, 'top center', window.innerWidth * .4);
    properties.pingAServer(primary_server_ips)
  }


}

// Login Service to Show Password Area After Username is Inserted
async function requestForPasswordArea() {
  var username = document.getElementById('loginUsername');
  var usernameSplit = username.value.split('_');
  var unitName = usernameSplit[0];
  if (await checkUnitCertificate(unitName)) {
    stageTwoDisplay();
    username.setAttribute('readonly', 'true')
  } else {
    lobiNotification("warning", 'Unauthorized', 'Not Authorized Platform', 'center', window.innerWidth * .4);
    document.getElementById('loginUsername').value = "";
    stageOneDisplay();
  }
}


// Function Declared to Fetch IP Address of the System
function getIP() {
  var ip = require('ip')
  return ip.address()
}


// ERROR ALERT THROUGH LOBI_NOTIFY
function lobiNotification(type, title, message, position, width) {
  Lobibox.notify(type, {
    size: "mini",
    width: width,
    title: title,
    delayIndicator: false,
    position: position,
    msg: message
  });
}



//ALL LOGIN UI MANAGEMENT FUNCTIONS
function stageOneDisplay() {

  // document.getElementById('bindedUnit').innerText = properties.unit_hardening;

  document.getElementById('loginUsername').removeAttribute('readonly');
  document.getElementById('preloader-login').style = "display:none";
  document.getElementById('loginPassword').style = "display:none";
  document.getElementById('loginPassword').removeAttribute('required')
  document.getElementById('loginButton').innerText = "Next";
  document.getElementById('loginForm').setAttribute('action', 'javascript:requestForPasswordArea()')


}

function stageTwoDisplay() {
  document.getElementById('loginPassword').style = "display:block"
  document.getElementById('loginPassword').className = "animationToPasswordField"
  document.getElementById('loginPassword').setAttribute('required', 'true')
  document.getElementById('loginButton').innerText = "Login"
  document.getElementById('loginForm').setAttribute('action', 'javascript:requestForLogintoAPI()')
}


//HANDLING FORGET PASSWORD REQUESTS
function handlingForgetPasswordRequest() {
  alert('Request Send to Conclave Planner.. Please Wait for his Response')
  //SENDING Request USING API

}


//CHECK IF UNIT IS VALID BASED ON UNIT
function checkUnitCertificate(unitName) {
  return new Promise((resolve, reject) => {
    resolve(true);
    // if(unitName==properties.unit_hardening)
    // resolve(true);
    // else
    // resolve(false);
  })
}


//KIOSK OPTIONS
const cProcess = require('child_process');

function shutdownSystem() {
  cProcess.exec('pkill -9 indl*')
  cProcess.exec('pkill -9 indlt')
  cProcess.exec('pkill -9 INDL*')
  cProcess.exec('init 0', (err, stdin, stdout) => {
    if (err) throw err;
  });
}

function restartSystem() {
  cProcess.exec('pkill -9 indl*')
  cProcess.exec('pkill -9 indlt')
  cProcess.exec('pkill -9 INDL*')
  cProcess.exec('init 6', (err, stdin, stdout) => {
    if (err) throw err;
  });

}