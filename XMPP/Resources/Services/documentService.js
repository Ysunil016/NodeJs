var urlForDocument = properties.ALL_DOCUMENTS_URL;
const documentSchema = require('../database/schema/documentSchema').documentModel;


//Exposing Required Functionalities Outside this File.
module.exports = {
    fetchDocumentsDataFromServer,
    storeDocumentData,
    viewDocuments
}


//Document Service to Fetch Documents Available from Server
function fetchDocumentsDataFromServer() {
    return new Promise((resolve, reject) => {
            fetch(urlForDocument)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resolve([]);
                    }
                    resolve(data);
                }).catch(err => {
                    resolve([]);
                    if (err) console.log(err);
                });
        })
        .catch(err => {
            resolve([]);
            console.log(err)
        });
}

//Document Service to Store Document's Details in MongoDB
function storeDocumentData(fetchedFocument) {
    return new Promise((resolve, reject) => {
        new documentSchema(fetchedFocument).save().then(resp => {
            resolve(true);
        }).catch(resp => {
            resolve(true);
        })
    })
}

//Document Service to View Documents Based on HTTP Streaming
function viewDocuments(url, fileType, fileName, size) {
    return new Promise((resolve, reject) => {
        var docViewModel = document.getElementById('documentViewModel');
        var modalImg = document.getElementById("imagePlaceholder");
        var modalText = document.getElementById("textPlaceholder");
        var modalPdf = document.getElementById("pdfPlaceholder");
        docViewModel.style.display = "block";

        switch (fileType) {
            case "text/plain": {
                if (modalText !== null) modalText.style.display = "block";
                if (modalImg !== null) modalImg.style.display = "none";
                if (modalPdf !== null) modalPdf.style.display = "none";
                fetch(url).then(response => response.text()).then(data => {
                    modalText.innerText = data;
                });
                break;
            }
            case "image/png": {
                if (modalImg !== null) modalImg.style.display = "block";
                if (modalText !== null) modalText.style.display = "none";
                if (modalPdf !== null) modalPdf.style.display = "none";
                modalImg.src = url;
                break;
            }
            case "image/jpeg": {
                if (modalImg !== null) modalImg.style.display = "block";
                if (modalText !== null) modalText.style.display = "none";
                if (modalPdf !== null) modalPdf.style.display = "none";
                modalImg.src = url;
                break;
            }
            case "application/pdf": {
                var modalPdf = document.createElement('iframe');
                modalPdf.className = "modal-content"
                modalPdf.id = "pdfPlaceholder";
                docViewModel.appendChild(modalPdf);

                if (modalPdf !== null) modalPdf.style.display = "block";
                if (modalImg !== null) modalImg.style.display = "none";
                if (modalText !== null) modalText.style.display = "none";
                console.log(url)
                // fetch(url).then(response => response.text()).then(data => {
                // console.log(data)
                modalPdf.src = url;
                // }).catch(err => {
                // if (err) throw err
                // })
                break;
            }

        }


        // Get the <span> element that closes the modal
        var closeSpan = document.getElementsByClassName("closeDocViewModel")[0];
        // When the user clicks on <span> (x), close the modal
        closeSpan.onclick = function () {
            docViewModel.style.display = "none";
        }
        resolve(true);
    })



}