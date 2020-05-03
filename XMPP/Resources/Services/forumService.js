const loginObject = require('../data/loginObject');
const extras = require('./helperService.js');
const properties = require('../data/Properties');
const forumSchema = require('../database/schema/forumSchema').forumMessageSchema;
const tfgData = require('../data/loginObject').TFG_FORCES;
const cgData = require('../data/loginObject').CONCLAVE_GROUPS;

//Exposing Required Functionalities Outside this File.
module.exports = {
    openForumByDefault,
    openForum,
    sendForumMessageToQueue,
    findForumInDatabase,
    createAndPushForumMessage,
    pushForumMessage,
    bbNameExistInBoard,
    updateForumPanelScreen,

    checkForumEntry
}

//Forum Service to Open Forum
function openForum(titleForForum, forceName, groupName) {
    return new Promise(async (resolve, reject) => {
        var boardMembers = await findMembersOfForum(titleForForum, loginObject.TFG_FORCES, loginObject.CONCLAVE_GROUPS);
        var forumQuery = {
            username: properties.USERNAME,
            bulletinBoardName: titleForForum
        };
        var forumDataFromDatabase = await findForumMessages(forumQuery, titleForForum, forceName, groupName);
        forumDataFromDatabase.members = boardMembers;

        var forumRender = $('#presentingBBSectionInUI').html()
        var compilebbMessageRender = Handlebars.compile(forumRender)
        $('.bulletinBoardArea').html(compilebbMessageRender(forumDataFromDatabase))

        $('.reply-for-bulletinBoard').css({
            display: 'block'
        })

        if (
            properties.DESIGNATION === 'SCO' ||
            properties.DESIGNATION === 'CCO' ||
            properties.DESIGNATION === 'FOO' ||
            properties.USERNAME === 'DNO') {
            $('.reply-for-bulletinBoard').css({
                display: 'block'
            })
        } else {
            $('.reply-for-bulletinBoard').css({
                display: 'none'
            })
            $('.bulletinBoardConversationArea').css({
                'max-height': 'calc(100vh - 290px)',
                'overflow-y': 'auto'
            })
            $('.bulletinBoardArea').css({
                height: 'calc(100vh - 290px)'
            })
            $('.bulletinBoardConversationAreaP').css({
                height: 'calc(100vh - 290px)'
            })
        }

        document.getElementById('bulletinBoardNameInConversationArea').innerText = titleForForum;
        document.getElementById('bbChatSectionFor' + titleForForum).scrollTop = document.getElementById('bbChatSectionFor' + titleForForum).scrollHeight;
        resolve(true);
    });
}

//Forum Service to Send Forum Message to Server Over API
function sendForumMessageToQueue(forumName, groupName, forceName) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest()
        xhr.open('POST', properties.API_FOR_SENDING_BB_MESSAGE, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.timeout = 6000;

        var currentTime = extras.getCurrrentTime();
        var messageEntered = document.getElementById('bulletinCommentAt' + forumName).value;
        document.getElementById('bulletinCommentAt' + forumName).value = '';

        var messageEnteredEnc = extras.encryptForumData(messageEntered); {
            var isExternal = 'false';
            if (forceName == '' || forceName == 'null') {
                isExternal = 'true';
                forceName = null;
            }

            var dataToStore = {
                forceName: forceName,
                bbName: forumName,
                sender: properties.UNIT_NAME,
                comment: messageEnteredEnc,
                conclaveName: loginObject.COMMAND,
                groupName: groupName,
                isExternal: isExternal
            };
            var dataToSendInString = JSON.stringify(dataToStore);
            console.log(dataToSendInString.length);
            xhr.send(dataToSendInString)

            //SENDING MESSAGE TO SERVER FOR RABBITMQ
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status == 200) {
                    document.getElementById("bulletinCommentAt" + forumName).setAttribute('disabled', 'true');

                    var insertMessageToForumQuery = {
                        username: properties.USERNAME,
                        bulletinBoardName: forumName,
                        groupName: groupName
                    };
                    var dataToPush = {
                        $push: {
                            comments: {
                                time: xhr.response,
                                sender: properties.UNIT_NAME,
                                comment: messageEntered
                            }
                        }
                    }
                    forumSchema.update(insertMessageToForumQuery, dataToPush, (err, raw) => {
                        if (err) throw err;
                    })

                    var dataToPushInUI = {
                        time: xhr.response,
                        sender: properties.UNIT_NAME,
                        comment: messageEntered
                    }
                    updateForumPanelScreen(forumName, dataToPushInUI);

                    // var dataToStore = {
                    //     messageType: 'Forum',
                    //     sender: properties.USERNAME,
                    //     message: messageEntered,
                    //     time: extras.getCurrrentTime(),
                    //     sendTo: bbName
                    // }
                    // notification_function.storeNotificationDataInLocalStorage(dataToStore);
                } else {
                    if (xhr.readyState === 4 && xhr.status != 200) {
                        extras.lobiNotification('warning', 'Could Not Send Comment', 'Connectivity Lost', 'top center', 'fadeIn', 'fadeOut');
                    }
                }
                document.getElementById("bulletinCommentAt" + forumName).removeAttribute('disabled');
                resolve(true);
            }
            if (xhr.ontimeout) {
                extras.lobiNotification('warning', 'Could Not Send Comment', 'Connectivity Lost', 'top center', 'fadeIn', 'fadeOut');
                resolve(true);
            }
        }
    })
}

//Forum Service to Check if Forum Exists in Database
function bbNameExistInBoard(bbName) {
    // return new Promise((resolve,reject)=>{
    for (var i = 0; i < tfgData.length; i++) {
        if (tfgData[i].defaultBoard !== null && tfgData[i].defaultBoard === bbName) {
            return true;
        }
    };
    for (var i = 0; i < cgData.length; i++) {
        if (cgData[i].defaultBoard !== null && cgData[i].defaultBoard === bbName) {
            return true;
        }
    };
    return false;
    // })

}

//Forum Service to find All Messages of Forum
function findForumMessages(forumQuery, forumTitle, forceName, groupName) {
    return new Promise(async (resolve, reject) => {
        forumSchema.findOne(forumQuery).sort({
            'bulletinMessages.comments.time': 1
        }).then(async resp => {
            if (resp)
                resolve(resp);
            else {
                var conclaveName = loginObject.COMMAND;
                resp = await makeNewForumEntryInDatabase(forumTitle, groupName, forceName, conclaveName);
                resolve(resp);
            }
        })
    });
}

//Forum Service to find all Members of Forum
function findMembersOfForum(titleForForum, tfgObject, cgObject) {
    return new Promise((resolve, reject) => {
        for (var i = 0; i < tfgObject.length; i++) {
            if (titleForForum == tfgObject[i].defaultBoard) {
                resolve(tfgObject[i].units);
            }
        }
        for (var i = 0; i < cgObject.length; i++) {
            if (titleForForum == cgObject[i].defaultBoard) {
                resolve(cgObject[i].units);
            }
        }
        resolve([]);
    });
}

//Forum Service to make new Database Entry in Database
function makeNewForumEntryInDatabase(forumName, groupName, forceName, conclaveName) {
    var data2Create = {
        username: properties.USERNAME,
        bulletinBoardName: forumName,
        forceName: forceName,
        groupName: groupName,
        conclaveName: conclaveName,
        comments: []
    }
    new forumSchema(data2Create).save().then(resp => {
        return (data2Create);
    })
}

//Forum Service to Update Forum Panel with Forum Message
function updateForumPanelScreen(forumName, dataToShow) {
    var mainD = document.getElementById('bbChatSectionFor' + forumName)
    if (mainD !== null) {
        var li1 = document.createElement('li')
        li1.className = 'clearfix'
        var div1 = document.createElement('div')
        div1.className = 'conversation-text-bulletinBoard'
        var div2 = document.createElement('div')
        div2.className = 'ctext-wrap bulletinBoardSingleComment'
        var i1 = document.createElement('i')
        i1.className = "bbSenderName"
        i1.innerHTML = dataToShow.sender
        var p1 = document.createElement('p')
        p1.className = "bbMessage"
        p1.innerHTML = dataToShow.comment
        var p2 = document.createElement('p')
        p2.className = "bbTime"
        p2.innerHTML = extras.convertTimestampForNormalFormat(parseInt(dataToShow.time));

        mainD.appendChild(li1)
        li1.appendChild(div1)
        div1.appendChild(div2)
        div2.appendChild(i1)
        div2.appendChild(p1)
        div2.appendChild(p2)


        // BB_SectionForScroll
        document.getElementById(
            'bbChatSectionFor' + forumName
        ).scrollTop = document.getElementById(
            'bbChatSectionFor' + forumName
        ).scrollHeight

    }
}

//Forum Service to Find Forum in Database
function findForumInDatabase(forumQuery) {
    return new Promise((resolve, reject) => {
        forumSchema.findOne(forumQuery).then(resp => {
            if (resp)
                resolve(true);
            else
                resolve(false);
        }).catch(resp => {
            resolve(false);
        })
    })
}

//Forum Service to Push Message in Database if Not Exist then Create
function createAndPushForumMessage(newForumData) {
    new forumSchema(newForumData).save().then(resp => {
        return true;
    }).catch(e => {
        return false;
    })
}

//Forum Service to Push Message in Database for Forum
function pushForumMessage(forumQuery, forumData) {
    forumSchema.update(forumQuery, forumData).then(resp => {
        return true;
    }).catch(resp => {
        return false;
    })
}

//NON-USED Funtion
function openForumByDefault(tfgObject) {
    return new Promise(async (resolve, reject) => {
        if (tfgObject[0]) {
            location.href = "#!/bulletinBoard"
            await openForum(tfgObject[0].defaultBoard, tfgObject[0].force, tfgObject[0].name);
        }
        resolve(true);
    });
}

async function checkForumEntry() {
    for (var i = 0; i < tfgData.length; i++) {
        if (tfgData[i]) {
            var forumQuery = {
                username: properties.USERNAME,
                bulletinBoardName: tfgData[i].defaultBoard
            }
            if (!(await findForumInDatabase(forumQuery)))
                makeNewForumEntryInDatabase(tfgData[i].defaultBoard, tfgData[i].name, tfgData[i].force, loginObject.COMMAND);
        }
    };
    for (var i = 0; i < cgData.length; i++) {
        if (cgData[i]) {
            var forumQuery = {
                username: properties.USERNAME,
                bulletinBoardName: cgData[i].defaultBoard
            }
            if (!(await findForumInDatabase(forumQuery)))
                makeNewForumEntryInDatabase(cgData[i].defaultBoard, cgData[i].name, null, cgData[i].conclave);
        }
    };

}