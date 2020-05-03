const properties = require('../data/Properties');
const helper = require('../Services/helperService');
(function () {
	const extras = require('../Services/helperService');
	const properties = require('../data/Properties');
	const emailSchema = require('../database/schema/emailSchema');
	// const emailSchema = require('../../../database/schema/emailSchema');

	var $sumNote = $("#ta-1")
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
		.data("summernote");

	//get
	$("#btn-get-content").on("click", function () {
		var y = $($sumNote.code());
		var x = y.find("font").remove();
		var emailContent = $("#ta-1").val();
		if (emailContent)
			sendEmail(emailContent);
		// $("#content").text($("#ta-1").val());
	});
	//get text$($sumNote.code()).find("font").remove()$($sumNote.code()).find("font").remove()
	// $("#btn-get-text").on("click", function () {
	// 	// console.log($($sumNote.code()).text())
	// 	$("#content").html($($sumNote.code()).text());
	// });
	//set
	$("#btn-set-content").on("click", function () {
		$sumNote.code(content);
	}); //reset
	$("#btn-reset").on("click", function () {
		$sumNote.reset();
		$("#content").empty();
		$("#email_search").val('');
		$("#email_subject").val('');
	});

	$("#btn-store-draft").on("click", function () {
		var y = $($sumNote.code());
		var emailContent = $("#ta-1").val();
		console.log(emailContent)
		if (emailContent !== "")
			saveEmailToDraft(emailContent);
	});

	function sendEmail(emailContent) {
		var contactList = document.getElementById('email_search');
		// var bccList = document.getElementById('').value;
		// var ccList = document.getElementById('').value;
		var subject = document.getElementById('email_subject');
		if (contactList.value) {
			var currentTime = extras.getCurrrentTime();
			var listOfContacts = contactList.value.split(',');
		


			var emailContentEnc = helper.encryptData(emailContent);
			listOfContacts.forEach(element => {
				var dataToSend = {
					uuid: extras.getUUID(),
					sender:properties.USERNAME,
					sendTo: element,
					subject: subject.value,
					content: emailContentEnc,
					time: currentTime
				}
				sendMailViaAMQP(element, dataToSend);
				dataToSend.content = emailContent;
				dataToSend.username = properties.USERNAME,
				emailSchema.eSentModel.insertMany(dataToSend).then().catch(err=>{if(err) throw err;})
			});
			contactList.value = '';
			subject.value = '';
			$sumNote.reset();
		}
	}

	function sendMailViaAMQP(element, dataToSend) {
		element = element.split('@')[0];
		dataToSend = JSON.stringify(dataToSend);
	
    	var xhr = new XMLHttpRequest()
        xhr.open('POST', properties.API_FOR_SENDING_To_EMAIL, true)
        xhr.setRequestHeader('Content-Type', 'application/json')
        xhr.timeout = 10000;    

        xhr.send(dataToSend)
        
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status == 200) {
                console.log(xhr.status);
                extras.lobiNotification('success', 'Email', 'Send to :' + element, 'bottom center', 'bounceIn', 'bounceOut')
            } else {
                if (xhr.status !== 200) {
                extras.lobiNotification('warning', 'Email', 'Could Not Send Email', 'top center', 'bounceIn', 'bounceOut')
            }
            }
        }
	}
	
	function saveEmailToDraft(emailContent) {
		var contactList = document.getElementById('email_search');
		var subject = document.getElementById('email_subject');
		var dataToSend = {
			uuid: extras.getUUID(),
			subject: subject.value,
			content: emailContent,
			time: extras.getCurrrentTime()
		}
		dataToSend.username = properties.USERNAME,
			// emailSchema.eDraftModel.findOne({username:properties.USERNAME}).then(data=>{
			// if(data!=null)
			// emailSchema.eDraftModel.updateOne({$push:{data:dataToSend}}).then().catch(err => {if (err) throw err})
			// else
			emailSchema.eDraftModel.insertMany(dataToSend).then(res=>{
				contactList.value = '';
				subject.value = '';
				$sumNote.reset();
				extras.lobiNotification('warning', 'Email', 'Saved to Draft:', 'bottom center', 'bounceIn', 'bounceOut')
			}).catch(err=>{if(err) throw err;})
		// }).catch(err=>{console.log(err)});
			}

})();

//CC is Open CC
//BCC is Hidden CC