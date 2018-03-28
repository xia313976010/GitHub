if (typeof (XrmUtil) == "undefined")
{ XrmUtil = { __namespace: true }; }
var XrmUtil = {
    getFilterUTCDate: function (date) {
        var monthString;
        var rawMonth = (date.getUTCMonth() + 1).toString();
        if (rawMonth.length == 1) monthString = "0" + rawMonth;
        else monthString = rawMonth;

        var dateString;
        var rawDate = date.getUTCDate().toString();
        if (rawDate.length == 1) dateString = "0" + rawDate;
        else dateString = rawDate;

        var hourString = "0" + date.getUTCHours();
        hourString = hourString.substr(hourString.length - 2, 2);

        var minuteString = "0" + date.getUTCMinutes();
        minuteString = minuteString.substr(minuteString.length - 2, 2);

        var secondString = "0" + date.getUTCSeconds();
        secondString = secondString.substr(secondString.length - 2, 2);

        return date.getUTCFullYear() + "-" + monthString + "-"
            + dateString + "T" + hourString + ":" + minuteString + ":"
            + secondString + "Z";
    },
    getFilterLocalDate: function (date, timePoint) {

        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        var hour = date.getUTCHours();
        var minute = date.getUTCMinutes();
        var second = date.getUTCSeconds();
        if (timePoint != null && timePoint != "" && typeof (timePoint) != "undefined") {
            year = date.getFullYear();
            month = date.getMonth() + 1;
            day = date.getDate();
            hour = parseInt(timePoint.substr(0, 2)) - 8;
            if (hour < 0) {
                day = day - 1;
                hour = hour + 24;
                if (day < 1) {
                    month = month - 1;
                    if (month < 1) {
                        year = year - 1;
                        month = 1;
                    }
                    day = new Date(year, month, 0).getDate();
                }
            }
        }
        var monthString = month.toString();
        if (monthString.length == 1)
            monthString = "0" + monthString;

        var dateString = day.toString();
        if (dateString.length == 1)
            dateString = "0" + dateString;

        var hoursString;
        hoursString = "0" + hour.toString();
        hoursString = hoursString.substr(hoursString.length - 2, 2);

        var minutesString;
        minutesString = "0" + minute.toString();
        minutesString = minutesString.substr(minutesString.length - 2, 2);

        var secondsString;
        secondsString = "0" + second.toString();
        secondsString = secondsString.substr(secondsString.length - 2, 2);

        var filterDateString = year + "-" + monthString + "-" + dateString;
        var filterTimeString = hoursString;
        if (timePoint == null)
            filterTimeString = filterTimeString + ":" + minutesString + ":" + secondsString;
        else
            filterTimeString = filterTimeString + ":00:00";

        return filterDateString + "T" + filterTimeString + "Z";
    },
    getServerDate: function () {
        var xmlHTTPRequest;
        if (window.ActiveXObject) xmlHTTPRequest = new ActiveXObject("Microsoft.XMLHTTP");
        else if (window.XMLHttpRequest) xmlHTTPRequest = new XMLHttpRequest();
        else xmlHTTPRequest = new ActiveXObject("Msxml2.XMLHTTP");
        xmlHTTPRequest.open('HEAD', '/?_=' + (-new Date), false);
        xmlHTTPRequest.send(null);

        return new Date(xmlHTTPRequest.getResponseHeader('Date'));
    },
    getFormatValue: function (result, name) {
        if (result != undefined && result.hasOwnProperty(name) && result[name] != null)
            return result[name + "@OData.Community.Display.V1.FormattedValue"];
    },
    getFormatERObj: function (result, name) {
        if (!(result != undefined && result.hasOwnProperty(name)
            && result[name] != null)) return;

        var id = result[name];
        var entityType = result[name + "@Microsoft.Dynamics.CRM.lookuplogicalname"];
        var name = result[name + "@OData.Community.Display.V1.FormattedValue"];

        var lookupReference = [];
        lookupReference[0] = {};
        lookupReference[0].entityType = entityType;
        lookupReference[0].id = id;
        lookupReference[0].name = name;
        return lookupReference;
    },
    getEntityReference: function (entityType, id, name) {
        var lookupReference = [];
        lookupReference[0] = {};
        lookupReference[0].entityType = entityType;
        lookupReference[0].id = id;
        lookupReference[0].name = name;
        return lookupReference;
    },
    approveRefresh: function () {
        Xrm.Page.data.setFormDirty(false);
        var id = Xrm.Page.data.entity.getId();
        var entity = Xrm.Page.data.entity.getEntityName();
        Xrm.Utility.openEntityForm(entity, id);
    },

    //getValue("name");
    getValue: function (field) {
        var control = Xrm.Page.data.entity.attributes.get(field);
        if (control != null) {
            return control.getValue();
        }
    },

    //getValue("name");
    getlookUpValue: function (field) {
        var control = Xrm.Page.data.entity.attributes.get(field);
        if (control != null) {
            var lookUpOBJ = control.getValue();
            if (lookUpOBJ && lookUpOBJ.length > 0) {
                return lookUpOBJ[0];
            }
            else {
                return null;
            }
        }
        else {
            return null;
        }
    },
    //setValue("name",value);
    setValue: function (field, value) {
        var control = Xrm.Page.data.entity.attributes.get(field);
        if (control != null) {
            try {
                control.setValue(value);
            }
            catch (e) {
            }
        }
    },
    //setVisible("name",true);
    setVisible: function (field, visible) {
        var control = Xrm.Page.ui.controls.get(field);
        if (control != null) {
            try {
                control.setVisible(visible);
            }
            catch (e) {
            };
        }
    },
    //setRequired("name","required")  setRequired("name","none"); 
    setRequired: function (field, requiredLevel) {
        var control = Xrm.Page.ui.controls.get(field);
        if (control != null) {
            try {
                Xrm.Page.getAttribute(field).setRequiredLevel(requiredLevel);
            }
            catch (e) { }
        }
    },
    //setSubmitMode("always");
    setSubmitMode: function (field, value) {
        var control = Xrm.Page.ui.controls.get(field);
        if (control != null) {
            try {
                Xrm.Page.getAttribute(field).setSubmitMode(value);


            } catch (e) { }
        }
    },
    //setDisabled("name",true)
    setDisabled: function (field, isDisabled) {
        var control = Xrm.Page.ui.controls.get(field);
        if (control != null) {
            try {
                control.setDisabled(isDisabled);
            } catch (e) { }
        }

    },
    //setDefaultView(field,guid);
    setDefaultView: function (field, viewGuid) {
        var control = Xrm.Page.ui.controls.get(field);
        if (control != null) {
            try {
                control.setDefaultView(viewGuid);
            } catch (e) { }
        }
    },
    getServerUrl: function () {
        if (typeof (Xrm.Page.context.getClientUrl) != "undefined")
            return Xrm.Page.context.getClientUrl();
        else
            return Xrm.Page.context.getServerUrl();
    },
    getId: function (id) {
        return id.replace('{', '').replace('}', '').toLowerCase();
    },
    guidsAreEqual: function (guid1, guid2) {
        var isEqual = false;

        if (guid1 == null || guid2 == null) {
            isEqual = false;
        }
        else {
            isEqual = guid1.replace(/[{}]/g, "").toLowerCase() == guid2.replace(/[{}]/g, "").toLowerCase();
        }

        return isEqual;
    },
}