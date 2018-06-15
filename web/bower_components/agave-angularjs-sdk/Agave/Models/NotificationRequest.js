/**
 *agave.sdk
 *
 * This file was automatically generated by APIMATIC BETA v2.0 on 10/07/2015
 */

function NotificationRequest() {
    this.associatedUuid = undefined
    this.url = undefined
    this.persistent = undefined

}

//Make instanceof work


/**
 *UUID of resource to whome the event applies.
 *
 * @return: string
 */
NotificationRequest.prototype.getAssociatedUuid = function () {

    return this.associatedUuid;
}


NotificationRequest.prototype.setAssociatedUuid = function (value) {
    this.associatedUuid = value;
}


/**
 *The url or email address that will be notified of the event.
 *
 * @return: string
 */
NotificationRequest.prototype.getUrl = function () {

    return this.url;
}


NotificationRequest.prototype.setUrl = function (value) {
    this.url = value;
}


/**
 *Whether this notification should stay active after it fires the first time.
 *
 * @return: bool
 */
NotificationRequest.prototype.getPersistent = function () {

    return this.persistent;
}


NotificationRequest.prototype.setPersistent = function (value) {
    this.persistent = value;
}
     




