const xmpp = require('simple-xmpp');
const geolib = require('geolib');
const properties = require('../data/Properties');
const loginObject = require('../data/loginObject');
const extras = require('../Services/helperService');

const starterService = require('../Services/serviceStarter');
const forumService = require('../Services/forumService');
const chatService = require('../Services/chatService');
const emailService = require('../Services/emailService');
const documentService = require('../Services/documentService');
const linkTrackHandler = require('../Services/Tactical/linkTrackHandler');
const leaflet_map = require('../Services/Tactical/leafletMap');
const notificationService = require('../Services/notificationService');

const updateService = require('../Services/Updates');

var app = angular.module('CoNPoL', ["ngRoute"]);

//Igniting Primary Services (Subscriptions)
starterService.startServices();

//CoN View Routing CONFIG
app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "./dynamicContent/dashboard.html"
        })
        .when("/bulletinBoard", {
            templateUrl: "./dynamicContent/bulletinboard.html"
        })
        .when("/chat", {
            templateUrl: "./dynamicContent/chat.html"
        })
        .when("/profile", {
            templateUrl: "./dynamicContent/profile.html"
        })
        .when("/setting", {
            templateUrl: "./dynamicContent/setting.html"
        })
        .when("/email_compose", {
            templateUrl: "./dynamicContent/Email/compose.html"
        })
        .when("/email_inbox", {
            templateUrl: "./dynamicContent/Email/inbox.html"
        })
        .when("/email_draft", {
            templateUrl: "./dynamicContent/Email/draft.html"
        })
        .when("/email_sent", {
            templateUrl: "./dynamicContent/Email/sent.html"
        })
        .when("/email_trash", {
            templateUrl: "./dynamicContent/Email/trash.html"
        })
        .when("/document", {
            templateUrl: "./dynamicContent/documents.html"
        })
        .when("/tactical", {
            templateUrl: "./dynamicContent/tactical.html"
        })
        .when("/tacticalCOPPage", {
            templateUrl: "./dynamicContent/tacticalCOPPage.html"
        });

});


//SPA Dashboard View Handler and Controller
app.controller('dashboardController', async ($scope) => {
    updateService.getDashboardUpdate();

    document.getElementById('sidebarAngularTemplate').style.display = "block";
    document.getElementById('headerAngularTemplate').style.display = "block";
    document.getElementById('footerAngularTemplate').style.display = "block";


    $scope.username = loginObject.username;
    // $scope.unitName = properties.UNIT_NAME;
    // $scope.command = loginObject.COMMAND;
    // $scope.force = loginObject.FORCE_I_BELONG_TO;
    // $scope.taskForces = loginObject.TFG_FORCES;
    

    // if (loginObject.TFG_FORCES == null || loginObject.TFG_FORCES == undefined || loginObject.TFG_FORCES[0] == null)
    //     $scope.tfg_members = [];
    // else {
    //     $scope.tfg_members = loginObject.TFG_FORCES[0].units;
    // }

    // $scope.conclaveGroups = loginObject.CONCLAVE_GROUPS;
    // $scope.notificationData = notificationService.retrieveNotificationDataFromLocalStorage();
    // $scope.openForumFromDashboardTile = async (bbName, forceName, groupName) => {
    //     location.href = "#!/bulletinBoard";
    //     await forumService.openForum(bbName, forceName, groupName);
    // }

    // $scope.userSelectedForChat = async (chatUser) => {
    //     location.href = "#!/chat";
    //     chatUser = chatUser.toLowerCase();
    //     await chatService.openChatWindow(chatUser);
    // }

    // $scope.clearRecentActivity = () => {
    //     window.localStorage.removeItem("con_notificationData" + properties.USERNAME);
    // }

    // $scope.getTFGMapView = async () => {
    //     // var mapInstance = leaflet_map.getTFGMapInstance();
    //     // if(mapInstance==null)
    //     var mapInstance = leaflet_map.getTFGMAPView();
    //     await linkTrackHandler.switchToTFGUnitsView(mapInstance);
    // }

});

//SPA Forum View Handler and Controller
app.controller('bulletinBoardController', async ($scope) => {


    $scope.tfgIntra = loginObject.TFG_FORCES;
    $scope.tfgInter = loginObject.CONCLAVE_GROUPS;


    // await forumService.openForumByDefault(loginObject.TFG_FORCES);

    $scope.callingBulletinBoard = async (forumTitle, forceName, groupName) => {
        await forumService.openForum(forumTitle, forceName, groupName);
    }

    sendForumMessageToQueue = async (forumName, groupName, forceName) => {
        await forumService.sendForumMessageToQueue(forumName, groupName, forceName);
    }

})

//SPA Chat View Handler and Controller
app.controller('chatController', ($scope) => {
    $scope.chatRooms = loginObject.CHATROOM_DATA;
    const userList = window.localStorage.getItem('listOfAllUsers');
    if (userList)
        $scope.userList = JSON.parse(userList);
    else
        $scope.userList = [];

    $scope.userSelectedForChat = async (chatUser) => {
        chatUser = chatUser.toLowerCase();
        await chatService.openChatWindow(chatUser);
    }

    $scope.roomSelectedForRoom = async (roomName) => {
        await chatService.openChatRoomWindow(roomName);
    }



    //SENDING DIRECT CHAT
    sendingDirectChatMessage = async (sendTo) => {
        await chatService.sendChatMessageToServer(sendTo);
    }

    chatSelected = (id, me) => {
        chatService.selectSingleChat(id, me);
    }

    //REPLY FUNCTIONS
    replyButtonClicked = async (replyMessageTo) => {
        await chatService.replyButtonClicked(replyMessageTo);
    }

    backToNormal = async (selected, isDirect) => {
        await chatService.backToNormal(selected, isDirect);
    }

    sendDirectMessageToReply = async (sendReplyTo, idSelected) => {
        await chatService.sendChatMessageAsReply(sendReplyTo, idSelected);
    }

    // backToNormalAfterReplySend=async (sendReplyTo)=>{
    //     await chatService.backToNormalAfterReplySend
    //     chatFunctions.backToNormalAfterReplySend(sendReplyTo)
    // }

    deleteButtonClicked = async (chatUser) => {
        await chatService.deleteChatButton(chatUser);
    }


    //FORWARD FUNCTIONS
    forwardButtonClicked = async (forwardMessageTo) => {
        await chatService.forwardButtoninChat(forwardMessageTo)
        // chatFunctions.forwardButtonClicked(forwardMessageTo)
    }


    sendingChatRoomMessage = async (roomName) => {
        await chatService.sendingNormalChatRoomMessage(roomName);
    }


    // chatRoomDeleteButtonClicked = (chatRoom)=>{
    //     chatFunctions.chatRoomDeleteButtonClicked(chatRoom);
    // }

    chatRoomReplyButtonClicked = async (replyMessageTo) => {
        await chatService.chatRoomReplyButtonClicked(replyMessageTo);
    }

    sendDirectRoomMessageToReply = async (sendReplyTo, idSelected) => {
        await chatService.sendNormalRoomMessageToReply(sendReplyTo, idSelected);
    }

    userOpenListToForward = async () => {
        await chatService.openUserList();
    }

});

//SPA iChat Controller
app.controller('iChatController', ($scope) => {

    onlineClickedUsers = async (onlineUserSelected) => {
        await chatService.openActiveIChatUser(onlineUserSelected);
    }

    sendingMessageForIChat = async (sendTo) => {
        await chatService.sendingMessageIChat(sendTo);
    }

})


// Email Controller
var emailItemArray = []

//SPA Compose View Handler and Controller
app.controller('composeController', ($scope) => {

});

//SPA Inbox View Handler and Controller
app.controller('inboxController', async ($scope) => {

    const allUsers = JSON.parse(window.localStorage.getItem('listOfAllUsers'));
    if (allUsers)
        $scope.listOfAllUsers = [{
            userName: "Sunil"
        }, {
            userName: "Yadav"
        }];
    else
        $scope.listOfAllUsers = [];

    emailItemArray = [];
    var emailQuery = {
        username: properties.USERNAME
    };
    var eInboxData = await emailService.getEInboxMessages(emailQuery);
    const inboxTemplate = $('#inboxDataFromDatabase').html()
    const compileinboxTemplate = Handlebars.compile(inboxTemplate)
    $('.areaForInboxDataFromDatabase').html(compileinboxTemplate(eInboxData))


    trashInboxMail = async (uuid) => {
        var emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var inboxMail = await emailService.findMailFromInbox(emailQuery);
        await emailService.storeMailToTrash(inboxMail);
        await emailService.deleteMailFromInbox(emailQuery);
        var docAear = document.getElementById('documentViewModel');
        docAear.style.display = "none";
        var emailUUID = document.getElementById(uuid);
        emailUUID.remove();
    }


    viewInboxMail = async (uuid) => {
        var emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var inboxMail = await emailService.findMailFromInbox(emailQuery);
        var viewTemplate = $('#viewMailTemplate').html()
        var compileViewTemplate = Handlebars.compile(viewTemplate)
        const allUsers = JSON.parse(window.localStorage.getItem('listOfAllUsers'));

        if (allUsers)
            inboxMail.listOfAllUsers = allUsers
        $('.inbox-show-region').html(compileViewTemplate(inboxMail))

    }


    replyToMail = async (uuid) => {
        var emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var inboxMail = await emailService.findMailFromInbox(emailQuery);
        if (inboxMail.content) {
            location.href = "#!/email_compose";
            emailService.showReplyInCompose(inboxMail);
        }
    }


    searchInForwardList = () => {

    }

    moveItemsToTrashFromInbox = async () => {
        await emailService.moveItemsToTrashFromInbox(emailItemArray);
        emailItemArray = [];
    }


});

//SPA Draft View Handler and Controller
app.controller('draftController', async ($scope) => {
    emailItemArray = [];
    const emailQuery = {
        username: properties.USERNAME
    };
    var draftMessages = await emailService.getEDraftMessages(emailQuery);

    const draftTemplate = $('#draftDataFromDatabase').html()
    const compileDraftTemplate = Handlebars.compile(draftTemplate)
    $('.areaForDraftDataFromDatabase').html(compileDraftTemplate(draftMessages))

    composeEmailFromDraft = async (uuid) => {
        const emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var draftMail = await emailService.findMailFromDraft(emailQuery);
        location.href = "#!/email_compose";
        emailService.showDataInCompose(draftMail)

    }


    moveItemsToTrashFromDraft = async () => {
        await emailService.moveItemsToTrashFromDraft(emailItemArray);
        emailItemArray = [];
    }

});

//SPA Sent View Handler and Controller
app.controller('sentController', async ($scope) => {
    emailItemArray = [];
    const emailQuery = {
        username: properties.USERNAME
    };
    var sentMessages = await emailService.getESentMessages(emailQuery);
    const sentTemplate = $('#sentDataFromDatabase').html()
    const compileSentTemplate = Handlebars.compile(sentTemplate)
    $('.areaForsentDataFromDatabase').html(compileSentTemplate(sentMessages))


    trashSentMail = async (uuid) => {
        var emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var sentMail = await emailService.findMailFromSent(emailQuery);
        await emailService.storeMailToTrash(sentMail);
        await emailService.deleteMailFromSent(emailQuery);
        var docAear = document.getElementById('documentViewModel');
        docAear.style.display = "none";
        var emailUUID = document.getElementById(uuid);
        emailUUID.remove();
    }


    viewSentMail = async (uuid) => {
        var emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var sentMail = await emailService.findMailFromSent(emailQuery);

        var viewTemplate = $('#viewMailTemplate').html()
        var compileViewTemplate = Handlebars.compile(viewTemplate)
        $('.sent-email-region').html(compileViewTemplate(sentMail))
    }

    moveItemsToTrashFromSent = async () => {
        await emailService.moveItemsToTrashFromSent(emailItemArray);
        emailItemArray = [];
    }
});

//SPA Trash View Handler and Controller
app.controller('trashController', async ($scope) => {
    emailItemArray = [];
    const emailQuery = {
        username: properties.USERNAME
    };
    var trashMessages = await emailService.getETrashMessages(emailQuery);

    const trashTemplate = $('#trashDataFromDatabase').html()
    const compileTrashTemplate = Handlebars.compile(trashTemplate)
    $('.areaForTrashDataFromDatabase').html(compileTrashTemplate(trashMessages))

    viewTrashMail = async (uuid) => {
        const emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        var trashMail = await emailService.findMailFromTrash(emailQuery);

        const viewTemplate = $('#viewMailTemplate').html()
        const compileViewTemplate = Handlebars.compile(viewTemplate)
        $('.trash-email-region').html(compileViewTemplate(trashMail))
    }

    deleteMailPermanently = async (uuid) => {
        const emailQuery = {
            username: properties.USERNAME,
            uuid: uuid
        };
        await emailService.deleteMailFromTrash(emailQuery);
        var docAear = document.getElementById('documentViewModel');
        docAear.style.display = "none";
        var emailUUID = document.getElementById(uuid);
        if (emailUUID != null)
            emailUUID.remove();
    }

    deleteItemsFromTrash = async () => {
        await emailService.deleteItemsFromTrash(emailItemArray);
        emailItemArray = [];
    }
});



//Global Function for Selection in Email
async function emailItemCheck(uuid) {
    var isAvailable = await emailService.checkIfItemExistInArray(uuid, emailItemArray);
    if (isAvailable.result === false) {
        emailItemArray.push(uuid)
    } else {
        emailItemArray.splice(isAvailable.index, 1)
    }
}




//SPA Document View Handler and Controller
app.controller('documentController', async ($scope) => {
    var fetchDocument = await documentService.fetchDocumentsDataFromServer();
    if (fetchDocument) {
        await documentService.storeDocumentData(fetchDocument);
        var documentsTemplate = $('#documentsFromDatabase').html()
        var compileDocumentTemplate = Handlebars.compile(documentsTemplate)
        $('.areaFordocumentsFromDatabase').html(compileDocumentTemplate(fetchDocument))
    }

    documentViewButtonClicked = async (url_rec, path_rec, fileName, size) => {
        await documentService.viewDocuments(url_rec, path_rec, fileName, size);
    }
});

//SPA Profile View Handler and Controller
app.controller('profileController', function ($scope) {
    $scope.username = properties.USERNAME;
    $scope.unit = properties.UNIT_NAME;
    $scope.designation = properties.DESIGNATION;
    $scope.conclave = loginObject.COMMAND;
    $scope.forceIBelongTo = loginObject.FORCE_I_BELONG_TO;

    // console.log(loginObject.COMMAND);
    // console.log(loginObject.CONCLAVE_GROUPS);


    if (loginObject.TFG_FORCES == null)
        $scope.taskForceGroups = [{
            name: 'NYA'
        }];
    else
        $scope.taskForceGroups = loginObject.TFG_FORCES;

    if (loginObject.CONCLAVE_GROUPS == null)
        $scope.conclaveGroups = [{
            name: 'NYA'
        }];
    else
        $scope.conclaveGroups = loginObject.CONCLAVE_GROUPS;


    updateUserList = () => {
        extras.updatingUserList();
    }
});

//SPA Header View Handler and Controller
app.controller('headerController', function ($scope) {
    $scope.username = properties.USERNAME;
    $scope.command = loginObject.COMMAND;
    //$scope.country = loginObject.COUNTRY;
    $scope.country = "../assets/img/flags/India.png";
    $scope.notificationOtherClicked = function () {
        badgeHeaderOtherNotification = document.getElementById('badgeHeaderOtherNotification');
        if (badgeHeaderOtherNotification !== null)
            badgeHeaderOtherNotification.style = 'color:dimgray'
        window.localStorage.setItem('badgeHeaderOtherNotification', '0');
    };

    $scope.currentTime = extras.getTime();
    $scope.currentDate = extras.getDate();
    //HEADER REFRESH BUTTON
    $scope.headerRefresh = () => {
        extras.callingAPIAtLoginTimeData();
    }


    $scope.latitude = "-";
    $scope.longitude = "-";
    $scope.course = "-";
    $scope.speed = "-";



    // displayLimits = 10;
    // checkDataCountForNotificationInHeader(displayLimits)

});

//SPA Footer View Handler and Controller
app.controller('footerController', function ($scope) {
    $scope.year = extras.getCurrrentYear();
})

//SPA Setting View Handler and Controller
app.controller('settingController', function ($scope) {

    $scope.detachButtonClicked = () => {
        alert('Detach Button Clicked');
    }

});

// SPA Sidebar View Handler and Controller
app.controller('sidebarController', async ($scope) => {
    $scope.dedicatedLine = "CON";
    $scope.notificationMessageData = await notificationService.getDataForNotificationHeader();

    //HEADER LOGOUT BUTTON
    $scope.headerLogout = () => {
        if (confirm("Are You Sure ?")) {
            window.sessionStorage.removeItem("session_id");
            xmpp.disconnect();
            window.location = "login.html";
        }
    }

    $scope.notificationMessageClicked = function () {
        var notificationBadge = document.getElementById('notificationBadge');
        if (notificationBadge !== null)
            notificationBadge.style.display = "none";
    };

    $scope.headerRefresh = () => {
        extras.callingAPIAtLoginTimeData();
    }


});



// Tactical MAP View Handler and Controller
app.controller('tacticalController', async ($scope) => {

    document.getElementById('sidebarAngularTemplate').style.display = "none";
    document.getElementById('headerAngularTemplate').style.display = "none";
    document.getElementById('footerAngularTemplate').style.display = "none";
    $scope.currentTime = extras.getTime();
    $scope.currentDate = extras.getDate();
    $scope.currentRange = "1024 nm";


    if (properties.OWN_SHIP_POSITION) {
        $scope.ownLatitude = properties.OWN_SHIP_POSITION.latitude;
        $scope.ownLongitude = properties.OWN_SHIP_POSITION.longitude;
    } else {
        $scope.ownLatitude = "N/A";
        $scope.ownLongitude = "N/A";
    }

    if (loginObject.FORCE_I_BELONG_TO)
        $scope.force = loginObject.FORCE_I_BELONG_TO;
    else
        $scope.force = "NET_UNIT";

    var map = leaflet_map.getLeafletMap();

    map.on('click', function (e) {
        getClickedLanLon(e);
    });

    getClickedLanLon = (e) => {
        var lat, lon, zoom;
        lat = e.latlng.lat;
        lon = e.latlng.lng;
        zoom = e.target._zoom;

        lat = lat.toFixed(4);
        lon = lon.toFixed(4);

        var createManualTrackForm = document.getElementById("createManualTrackForm");
        var latitude_form = document.getElementById("latitude_form");
        var longitude_form = document.getElementById("longitude_form");

        if (createManualTrackForm) {
            latitude_form.value = lat;
            longitude_form.value = lon;
        }
    }

    linkTrackHandler.switchToPF(map);
    var selectedLayer = 0;

    let track_tote_is_on = true;
    let track_table = false;

    changeLayer = async () => {
        var radioValue = $('input[name=switches]:checked').val();
        switch (radioValue) {
            case "PF":
                if (selectedLayer != 0) {
                    linkTrackHandler.switchToPF(map);
                    track_table = false;
                }
                selectedLayer = 0;
                break;
            case "NET_UNIT":
                if (selectedLayer != 1) {
                    linkTrackHandler.switchToNETUNIT(map);
                    track_table = false;                    
                }
                selectedLayer = 1;
                break;
            case "COP":
                if (selectedLayer != 2) {
                    linkTrackHandler.switchToCOP(map);
                    track_table = false;                    
                }
                selectedLayer = 2;
                break;
        }
    }

    $scope.track_tote_display = async () => {
        if (!track_tote_is_on) {
            document.getElementById("track_tote").style.display = "block";
            track_tote_is_on = true;
        } else {
            document.getElementById("track_tote").style.display = "none";
            track_tote_is_on = false;
        }
    }
   
    openTrackDetails = async (option) => {
        if (!track_table) {
        document.getElementById("track_list").style.display = "block";
        track_table = true;
        let tactical_cop = [];
        if(option==1)
        tactical_cop = await linkTrackHandler.get_cop_track_data();
        else
        tactical_cop = await linkTrackHandler.get_force_track_data();
   
        const tacticalTemplate = $('#tacticalCOPTrack').html()
        const compileTactTemplate = Handlebars.compile(tacticalTemplate)
        $('.copTrackListArea').html(compileTactTemplate(tactical_cop))
        } else {
            document.getElementById("track_list").style.display = "none";
            track_table = false;
        }

        
    }

    let currentZoomRange = map.getZoom();
    linkTrackHandler.showRangeScaleOnMap(currentZoomRange);
    $scope.zoomOut = ()=>{
        if(currentZoomRange<15){
        currentZoomRange++;                
        map.setZoom(currentZoomRange);
        linkTrackHandler.showRangeScaleOnMap(currentZoomRange);
        }

    }   
    $scope.zoomIn = ()=>{        
        if(currentZoomRange>4){
        currentZoomRange--;                    
        map.setZoom(currentZoomRange);  
        linkTrackHandler.showRangeScaleOnMap(currentZoomRange);

        }
    } 

    let dialLayer = null;
    let isRangeShown = false;
    let gridInstance = null;
    let tileViewOn = true;
    let dialOnMap = false;
    let isdragOn = false;
    let isVectorOn = true;
    

    var onPositionController = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'ownPositionButtonOnMap leaflet-bar leaflet-control leaflet-control-custom');
            container.title = "Own Position";
            container.onclick = async () => {
                const own_ship_position = await linkTrackHandler.get_lat_lng_Radian(properties.OWN_SHIP_POSITION);
                 if (own_ship_position != null) {
                    map.setView(own_ship_position, 9);
                    linkTrackHandler.showRangeScaleOnMap(9);
                    currentZoomRange = 9;
                }
            }
            return container;
        }
    });
    var rangeCircle = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'ownRangeControlButton leaflet-bar leaflet-control leaflet-control-custom');
            container.title = "Range Circle";
            container.onclick = () => {
                var mapZoomLevel = map.getZoom();                
                if(!isRangeShown){
                    linkTrackHandler.drawRangeCircleAroundOwn(map,0,mapZoomLevel);
                    isRangeShown = true;
                }else{
                    linkTrackHandler.drawRangeCircleAroundOwn(map,1,mapZoomLevel);                    
                    isRangeShown = false;                    
                }
            }
        return container;
        }
    });
    var gridView = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'gridTileButton leaflet-bar leaflet-control leaflet-control-custom');
            container.title = "Grid View";
            container.onclick = () => {
              if(!gridInstance){
                gridInstance = leaflet_map.getGridLayerTiles(map);
                gridInstance.addTo(map);
              }else{
                gridInstance.remove();
                gridInstance = null;            
              }
            }
        return container;
    }
    });
    var tileView = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'tileViewButton leaflet-bar leaflet-control leaflet-control-custom');
            container.title = "Map View";
            container.onclick = () => {
                var tileInstance = leaflet_map.getTileLayerInstance(); 
              if(tileViewOn){
                tileInstance.remove();
                tileViewOn = false;
              }else{
                leaflet_map.bindTileServerToMap(map);
                tileViewOn = true;
              }
            }
        return container;
    }
    });
    var dialView = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'dialViewButton leaflet-bar leaflet-control leaflet-control-custom');
           container.title = "Course Dial";
            container.onclick = () => {
                if(!dialOnMap){
                    dialLayer = linkTrackHandler.getCourseDialLayer();
                    dialLayer.addTo(map);
                    dialOnMap = true;
                }else{
                    map.removeLayer(dialLayer);
                    dialOnMap = false;
                }
            }
        return container;
    }
});
    var dragController = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'dragControllerButton leaflet-bar leaflet-control leaflet-control-custom');
            container.title = "Drag";
            container.onclick = () => {
                if(!isdragOn){
                    map.dragging.enable();
                    isdragOn = true;
                }else{
                    map.dragging.disable();
                    isdragOn = false;
                }
            }
        return container;
        }
    });
    var showHideVector = L.Control.extend({
        options: {
            position: 'bottomleft'
        },
        onAdd: function (map) {
            var container = L.DomUtil.create('div', 'vectorControllerButton leaflet-bar leaflet-control leaflet-control-custom');
            container.title = "Vector";
            container.onclick = () => {
               if(isVectorOn){
                linkTrackHandler.currentVectorLayerVisibility(map,0);
                isVectorOn = false;
                }else{
                linkTrackHandler.currentVectorLayerVisibility(map,1);            
                isVectorOn = true;            
             }
            }
        return container;
        }
    });


    map.addControl(new onPositionController());
    map.addControl(new rangeCircle());
    map.addControl(new gridView());    
    map.addControl(new tileView());
    map.addControl(new dialView());
    map.addControl(new dragController());
    map.addControl(new showHideVector());
    

    L.control.mousePosition({
        formatter: (lng, lat) => {

            var lat_dir = 'N';
            var lng_dir = 'E';
            if (lat < 0)
                lat_dir = 'S';
            if (lng < 0)
                lng_dir = 'W';


            document.getElementById('mouse_lat').innerText = geolib.decimalToSexagesimal(lat) +" "+lat_dir;
            document.getElementById('mouse_long').innerText = geolib.decimalToSexagesimal(lng) +" "+lng_dir;
            if (properties.OWN_SHIP_POSITION) {
                var {latitude,longitude} = properties.OWN_SHIP_POSITION;
                var latLong = [latitude,longitude];  
                var rangeBearing = linkTrackHandler.calculateRangeBearing(latLong[0],latLong[1],lat,lng);
                var rangeInKnot = (rangeBearing.SRange)/1852;
                document.getElementById('mouse_range').innerText = rangeInKnot.toFixed(2)+" nm";
                document.getElementById('mouse_bearing').innerText = (rangeBearing.SBearing).toFixed(2)+" deg";

            }

        }
        }).addTo(map);

    let large_icon = true;
    let small_icon = false;

    map.on('zoomend', () => {
        let zoomLevel = map.getZoom();
        if(zoomLevel<6){
            if(!small_icon)
            linkTrackHandler.manageIconScaling(map,zoomLevel,0);   
            small_icon = true;
            large_icon = false;
        }else{
            if(!large_icon)
            linkTrackHandler.manageIconScaling(map,zoomLevel,1);        
            large_icon = true;
            small_icon = false;
        }
        if(isRangeShown){
            var getValue = linkTrackHandler.getRangeBasedOnZoomLevel(zoomLevel)
            linkTrackHandler.updateRangeCircle(getValue);
        }
     
    });

    showTrackDetailInTote = (track_data)=>{
        linkTrackHandler.showTrackDetailInTote(track_data);
    }



});


//Tactical COP Trask Table View Handler and Controller
app.controller('tacticalCOPPageController', async ($scope) => {
    const tactical_cop = await linkTrackHandler.get_cop_track_data();
    const tacticalTemplate = $('#tacticalCOPTrack').html()
    const compileTactTemplate = Handlebars.compile(tacticalTemplate)
    $('.areaForTacticalCOPTrack').html(compileTactTemplate(tactical_cop))
});



//HANDLEBARS REGISTRY
Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase();
});
Handlebars.registerHelper('toUpperCase', function (str) {
    return str.toUpperCase();
});

Handlebars.registerHelper('toLocalTime', function (timeStamp) {
    timeStamp = parseInt(timeStamp);
    const currentTime = new Date(timeStamp);
    const currentDay = currentTime.getDate();
    const currentMonth = currentTime.getMonth() + 1;
    const currentYear = currentTime.getFullYear;

    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentSecond = currentTime.getSeconds();

    return currentDay + "/" + currentMonth + " " + currentHour + ":" + currentMinute;
});


Handlebars.registerHelper('detectTrackIdentity', function (str) {
    switch (str) {
        case 'F':
            return "Friend";
            break;
        case 'H':
            return "Hostile";
            break;
        case 'U':
            return "Unknown";
            break;
    }
});

Handlebars.registerHelper('JSON', function(data) {
    return JSON.stringify(data);
});