"use strict";

const path = require("path");
const fs = require("fs");
var NodeHelper = require("node_helper");
const pm2 = require("pm2");

var log = (...args) => { /* do nothing */ };

module.exports = NodeHelper.create({
  start () {
    this.pm2 = pm2;
    this.VLCPath = null;
  },

  stop () {
    console.log("[VLC] Try to close VLCServer!");
    this.pm2.stop("VLCServer", (e,p) => {
      if (e) {
        console.error("[VLC] Error: VLCServer can't stop !");
        console.error("[VLC] Detail:", e);
      }
    });
  },

  socketNotificationReceived (noti, payload) {
    switch (noti) {
      case "INIT":
        this.config= payload;
        console.log("[VLC] EXT-VLCServer Version:", require("./package.json").version, "rev:", require("./package.json").rev);
        this.initialize();
        break;
      case "RESTART":
        this.VLCRestart();
        break;
    }
  },

  initialize () {
    if (this.config.debug) log = (...args) => { console.log("[VLC]", ...args); };
    console.log("[VLC] Launch VLC Http Server...");
    this.VLC();
  },

  /** launch vlc with pm2 **/
  VLC () {
    this.VLCPath = path.resolve(this.config.vlcPath, "vlc");

    if (!fs.existsSync(this.VLCPath)) {
      console.error("[VLC] VLC is not installed or not found!");
      this.sendSocketNotification("WARNING" , { message: "VLCNoInstalled" }); // not coded
      return;
    }
    console.log("[VLC] Found VLC in", this.VLCPath);
    this.pm2.connect((err) => {
      if (err) return console.error("[VLC]", err);
      this.pm2.list((err,list) => {
        if (err) return console.error("[VLC]", err);
        if (list && Object.keys(list).length > 0) {
          for (let [item, info] of Object.entries(list)) {
            if (info.name === "VLCServer" && info.pid) {
              return console.log("[VLC] VLC Http Server already Started!");
            }
          }
        }
        this.VLCStart();
      });
    });
  },

  VLCStart () {
    this.pm2.start({
	  script: this.VLCPath,
	  name: "VLCServer",
	  out_file: "/dev/null",
	  args: [
	    "-I http",
	    "--extraintf",
        "http",
	    "--http-port",
        8082,
	    "--http-host",
        "127.0.0.1",
	    "--http-password",
        "EXT-VLCServer"
	  ]
    }, (err, proc) => {
	  if (err) {
        this.sendSocketNotification("WARNING" , { message: "VLCError", values: err.toString() });
        console.error(`[VLC] ${err}`);
        return;
	  }
	  console.log("[VLC] VLC Http Server Started!");
    });
  },

  VLCRestart () {
    this.pm2.restart("VLCServer", (err, proc) => {
      if (err) console.error(`[VLC] Error: ${err}`);
      else console.log("[VLC] VLC Http Server Restarted!");
    });
  }
});
