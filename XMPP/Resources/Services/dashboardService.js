//Exposing Required Functionalities Outside this File.
const clientDetail = require('../data/loginObject');
module.exports = {
    updateRecentActivityDashboard
}


//Dashboard Service to Update Recent Activities in Dashboard UI
function updateRecentActivityDashboard(dataType, sender, sendTo, messageReceived, timeFromSender) {
    var bulletinBoardPanel = document.getElementById('bulletinBoardPanel')
    if (bulletinBoardPanel !== null) {
        // Displaying Bulletin Board Message
        var div0 = document.createElement('div');
        var div1 = document.createElement('div')
        div1.className = 'comment-phase'
        var div2 = document.createElement('div')
        div2.className = 'comment-adminpr'
        var span0 = document.createElement('span');
        span0.className = "dashtwo-messsage-title notificationChatOption";
        var span1 = document.createElement('span');
        if (dataType == "Chat")
            span1.className = 'label label-success panel_notification_label';
        else
            span1.className = 'label label-warning panel_notification_label';
        span1.innerText = dataType;
        var div3 = document.createElement('div')
        div3.className = 'panel_notification_content'
        var span2 = document.createElement('span');
        span2.className = "panel_notification_content_sendTo"
        span2.innerText = sender.toUpperCase();
        var span3 = document.createElement('span');
        span3.className = "panel_notification_content_message"
        span3.innerText = messageReceived;
        var span4 = document.createElement('span');
        span4.className = "panel_notification_content_time"
        span4.innerText = timeFromSender;

        bulletinBoardPanel.appendChild(div0)
        div0.appendChild(div1)
        div1.appendChild(div2)
        div2.appendChild(span0)
        span0.appendChild(span1)
        span0.appendChild(div3)
        div3.appendChild(span2)
        div3.appendChild(span3)
        div3.appendChild(span4)
    }
}
