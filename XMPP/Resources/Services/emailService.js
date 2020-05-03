var emailItemArray = []
const emailInboxSchema = require('../database/schema/emailSchema').eInboxModel;
const emailDraftSchema = require('../database/schema/emailSchema').eDraftModel;
const emailSentSchema = require('../database/schema/emailSchema').eSentModel;
const emailTrashSchema = require('../database/schema/emailSchema').eTrashModel;

//Exposing Required Functionalities Outside this File.
module.exports = {
    getEInboxMessages,
    getEDraftMessages,
    getESentMessages,
    getETrashMessages,

    storeMailToTrash,
    deleteMailFromSent,
    deleteMailFromTrash,
    deleteMailFromDraft,
    deleteMailFromInbox,

    findMailFromTrash,
    findMailFromDraft,
    findMailFromInbox,
    findMailFromSent,


    showDataInCompose,
    showReplyInCompose,
    forwardEmail,

    checkIfItemExistInArray,

    moveItemsToTrashFromDraft,
    moveItemsToTrashFromInbox,
    moveItemsToTrashFromSent,

    deleteItemsFromTrash

}
//Email Service to find All Inbox Messages
function getEInboxMessages(emailQuery) {
    return new Promise((resolve, reject) => {
        emailInboxSchema.find(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}
//Email Service to find All Draft Messages
function getEDraftMessages(emailQuery) {
    return new Promise((resolve, reject) => {
        emailDraftSchema.find(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}
//Email Service to find All Sent Messages
function getESentMessages(emailQuery) {
    return new Promise((resolve, reject) => {
        emailSentSchema.find(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}
//Email Service to find All Trash Messages
function getETrashMessages(emailQuery) {
    return new Promise((resolve, reject) => {
        emailTrashSchema.find(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}


//Email Service to Store Mail in Trash
function storeMailToTrash(mailData) {
    return new Promise((resolve, reject) => {
        new emailTrashSchema({
            username: mailData.username,
            uuid: mailData.uuid,
            subject: mailData.subject,
            content: mailData.content,
            time: mailData.time
        }).save().then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })

    })
}
//Email Service to Delete Mail from Sent
function deleteMailFromSent(emailQuery) {
    return new Promise((resolve, reject) => {
        emailSentSchema.findOneAndRemove(emailQuery).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}
//Email Service to Delete Mail from Trash
function deleteMailFromTrash(emailQuery) {
    return new Promise((resolve, reject) => {
        emailTrashSchema.findOneAndRemove(emailQuery).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}
//Email Service to Delete Mail from Draft
function deleteMailFromDraft(emailQuery) {
    return new Promise((resolve, reject) => {
        emailDraftSchema.findOneAndRemove(emailQuery).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}
//Email Service to Delete Mail from Inbox
function deleteMailFromInbox(emailQuery) {
    return new Promise((resolve, reject) => {
        emailInboxSchema.findOneAndRemove(emailQuery).then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}


//Email Service to Find Mail from Sent
function findMailFromSent(emailQuery) {
    return new Promise((resolve, reject) => {
        emailSentSchema.findOne(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}

//Email Service to Delete Mail from Trash
function findMailFromTrash(emailQuery) {
    return new Promise((resolve, reject) => {
        emailTrashSchema.findOne(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}
//Email Service to Delete Mail from Draft
function findMailFromDraft(emailQuery) {
    return new Promise((resolve, reject) => {
        emailDraftSchema.findOne(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}
//Email Service to Delete Mail from Inbox
function findMailFromInbox(emailQuery) {
    return new Promise((resolve, reject) => {
        emailInboxSchema.findOne(emailQuery).then(resp => {
            resolve(resp);
        }).catch(resp => {
            resolve([]);
        })
    })
}



//Email Service to Check if Selected Item is in Mail_Array
function checkIfItemExistInArray(data, array) {
    return new Promise((resolve, reject) => {
        if (array.length === 0) {
            resolve({
                result: false
            })
        } else {
            array.forEach((res, index) => {
                if (res === data) {
                    resolve({
                        result: true,
                        index: index
                    })
                }

            })
            resolve({
                result: false
            })
        }
    });
}














function showDataInCompose(data) {
    $("#ta-1")
        .summernote({
            callbacks: {
                onPaste: function (e, x, d) {
                    $sumNote.code(($($sumNote.code()).find("font").remove()));
                }
            },

            dialogsInBody: true,
            dialogsFade: true,
            disableDragAndDrop: true,
            //                disableResizeEditor:true,
            height: "150px",
            tableClassName: function () {
                alert("tbl");
                $(this)
                    .addClass("table table-bordered")

                    .attr("cellpadding", 0)
                    .attr("cellspacing", 0)
                    .attr("border", 1)
                    .css("borderCollapse", "collapse")
                    .css("table-layout", "fixed")
                    .css("width", "100%");

                $(this)
                    .find("td")
                    .css("borderColor", "#ccc")
                    .css("padding", "4px");
            }
        })
        .data("summernote").code(data.content)
    $("#email_subject").val(data.subject)
}











function showReplyInCompose(data) {
    var content = "<p><br><br><div class='emailReTag'>Re :</div><div class='replyTextInCompose disabled'>" + data.content + "</div></p>";

    $("#ta-1").summernote({
            callbacks: {
                onPaste: function (e, x, d) {
                    $sumNote.code(($($sumNote.code()).find("font").remove()));
                }
            },
            dialogsInBody: true,
            dialogsFade: true,
            disableDragAndDrop: true,
            //                disableResizeEditor:true,
            height: "150px",
            tableClassName: function () {
                alert("tbl");
                $(this)
                    .addClass("table table-bordered")
                    .attr("cellpadding", 0)
                    .attr("cellspacing", 0)
                    .attr("border", 1)
                    .css("borderCollapse", "collapse")
                    .css("table-layout", "fixed")
                    .css("width", "100%");

                $(this)
                    .find("td")
                    .css("borderColor", "#ccc")
                    .css("padding", "4px");
            }
        })
        .data("summernote").code(content);

    var subject = "Re : " + data.subject;
    $("#email_search").val(data.sender);
    $("#email_subject").val(subject);

}


function forwardEmail(data) {
    //Get ToSend
    var contacts = ["RANA_SCO", "TARKASH_SCO"];
    data.sender = properties.USERNAME;
    console.log(data);
    for (var i in contacts) {
        sendMailViaAMQP(contacts[i], data);
    }
}



















//Future Scope

function moveItemsToTrashFromDraft(emailItemArray) {
    return new Promise((resolve, reject) => {
        emailItemArray.forEach(async (id) => {
            var emailQuery = {
                username: properties.USERNAME,
                uuid: id
            };
            var draftMail = await findMailFromDraft(emailQuery);
            await storeMailToTrash(draftMail);
            await deleteMailFromDraft(emailQuery);
            var removeItem = document.getElementById(id);
            if (removeItem !== null) {
                removeItem.style.display = "none"
            }
        });
        resolve(true);
    })

}

function moveItemsToTrashFromInbox(emailItemArray) {
    return new Promise((resolve, reject) => {
        emailItemArray.forEach(async id => {
            var emailQuery = {
                username: properties.USERNAME,
                uuid: id
            };
            var inboxMail = await findMailFromInbox(emailQuery);
            await storeMailToTrash(inboxMail);
            await deleteMailFromInbox(emailQuery);
            var removeItem = document.getElementById(id);
            if (removeItem !== null) {
                removeItem.style.display = "none"
            }
        });
        resolve(true);
    });
}

function moveItemsToTrashFromSent(emailItemArray) {
    return new Promise((resolve, reject) => {

        emailItemArray.forEach(async id => {

            var emailQuery = {
                username: properties.USERNAME,
                uuid: id
            };
            var sentMail = await findMailFromSent(emailQuery);
            await storeMailToTrash(sentMail);
            await deleteMailFromSent(emailQuery);
            var removeItem = document.getElementById(id);
            if (removeItem !== null) {
                removeItem.style.display = "none"
            }
        });
        resolve(true);
    });
}

function deleteItemsFromTrash(emailItemArray) {
    return new Promise((resolve, reject) => {
        emailItemArray.forEach(async (id) => {
            var emailQuery = {
                username: properties.USERNAME,
                uuid: id
            };
            await deleteMailFromTrash(emailQuery);
            var removeItem = document.getElementById(id);
            if (removeItem !== null) {
                removeItem.style.display = "none"
            }
        });
        resolve(true);
    });
}