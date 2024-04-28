/**
 ** Module: EXT-VLCServer
 ** @bugsounet
 ** ©05-2024
 ** support: https://forum.bugsounet.fr
 **/

Module.register("EXT-VLCServer", {
  defaults: {
    debug: false,
    vlcPath: "/usr/bin"
  },

  getDom () {
    var dom = document.createElement("div");
    dom.style.display = "none";
    return dom;
  },

  notificationReceived (noti, payload, sender) {
    switch(noti) {
      case "GA_READY":
        if (sender.name === "MMM-GoogleAssistant") {
          this.sendSocketNotification("INIT", this.config);
          this.sendNotification("EXT_HELLO", this.name);
        }
        break;
    }
  }
});
