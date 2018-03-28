function CreateDialog(dialogUrl, dialogWidth, dialogHeight, entityId) {
    var backgroundStr = '<div tabindex="0" class="ms-crm-InlineDialogBackground" id="InlineDialog_Background" style="top: 0px; width: 100%; height: 100%; position: absolute; z-index: 1005; opacity: 0.5;filter:alpha(opacity=50);background-color: grey;"></div>';

    var dialogStr = '<div tabindex="1" class="ms-crm-DialogChrome" id="InlineDialog" style="left: 50%; top: 50%; width: ' + dialogWidth + 'px; height: ' + dialogHeight + 'px; margin-top: -' + dialogHeight / 2 + 'px; margin-left: -' + dialogWidth / 2 + 'px; position: absolute; z-index: 1006;">' +
            '<iframe entityid="' + entityId + '" name="InlineDialog_Iframe" id="InlineDialog_Iframe" src="' + dialogUrl + '" style="border: 0px currentColor; width: ' + dialogWidth + 'px; height: ' + dialogHeight + 'px;"></iframe>' +
            '<div id="DialogLoadingDiv" style="left: 50%; top: 50%; width: ' + dialogWidth + 'px; height: ' + dialogHeight + 'px; margin-top: -' + dialogHeight / 2 + 'px; margin-left: -' + dialogWidth / 2 + 'px;  position: absolute; z-index: 1007; background-color: white;">' +
                '<table class="ms-crm-LoadingContainer" style="width: 100%; height: 100%;">' +
                    '<tbody>' +
                        '<tr class="ms-crm-LoadingContainer">' +
                            '<td align="center" style="vertical-align: middle;">' +
                                '<img id="DialogLoadingDivImg" alt="" src="/_imgs/AdvFind/progress.gif">' +
                                    '<br>Loading...' +
                            '</td>' +
                        '</tr>' +
                    '</tbody>' +
                '</table>' +
            '</div>' +
        '</div>';


    $("html", parent.parent.document).find("body").append(backgroundStr + dialogStr);

}


function CloseIsvDialog(donotReferesh) {
    $("html", parent.parent.document).find("#InlineDialog_Background").hide();
    $("html", parent.parent.document).find("#InlineDialog").hide();
    RefereshData(donotReferesh);
    setTimeout(function () { $("html", parent.parent.document).find("#InlineDialog_Background").remove(); $("html", parent.parent.document).find("#InlineDialog").remove(); }, 1000);
}


function RefereshData(donotReferesh) {
    if (!donotReferesh) {
        if (window.parent.parent && window.parent.parent.document) {
            if (window.parent.parent.Xrm && window.parent.Xrm.Page.data && window.parent.parent.Xrm.Page.data.entity) {
                if (window.parent.parent.Xrm.Page.data.entity.getEntityName() == "businessunit") {
                    window.parent.parent.location.reload();
                    return;
                }
            }


            var iframes = window.parent.parent.document.getElementsByTagName("iframe");
            for (var i = 0; i < iframes.length; i++) {
                if (iframes[i].style.visibility == "hidden")
                    continue;

                if (iframes[i].contentWindow.document.getElementById("refreshButton") && iframes[i].contentWindow.document.getElementById("refreshButtonLink")) {
                    iframes[i].contentWindow.document.getElementById("refreshButtonLink").click();
                    break;
                }

                if (iframes[i].contentWindow.Xrm && iframes[i].contentWindow.Xrm.Page && iframes[i].contentWindow.Xrm.Page.data) {
                    iframes[i].contentWindow.Xrm.Page.data.refresh(false);
                    break;
                }
            }
        }
    }
}


function ShowLoaddingDiv() {
    $("html", parent.parent.document).find("#DialogLoadingDiv").show();
}

function HideLoaddingDiv() {
    $("html", parent.parent.document).find("#DialogLoadingDiv").hide();
}

