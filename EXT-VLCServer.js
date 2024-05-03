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

  getTranslations () {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json"
    };
  },

  notificationReceived (noti, payload, sender) {
    switch (noti) {
      case "GA_READY":
        if (sender.name === "MMM-GoogleAssistant") {
          this.sendSocketNotification("INIT", this.config);
          this.sendNotification("EXT_HELLO", this.name);
        }
        break;
    }
  },

  socketNotificationReceived (noti, payload) {
    switch (noti) {
      case "ERROR":
        console.error(`[VLC] [ERROR] ${this.translate(payload.message)}`);
        this.sendNotification("EXT_ALERT", {
          type: "error",
          message: this.translate(payload.message),
          timer: 10000
        });
        break;
      case "WARNING":
        console.warn(`[VLC] [WARNING] ${this.translate(payload.message, { VALUES: payload.values })}`);
        this.sendNotification("EXT_ALERT", {
          type: "warning",
          message: this.translate(payload.message, { VALUES: payload.values }),
          timer: 10000
        });
        break;
      case "STARTED":
        this.sendNotification("EXT_VLCSERVER-START");
        break;
      case "CLOSED":
        this.sendNotification("EXT_VLCSERVER-CLOSE");
        break;
    }
  }
});
