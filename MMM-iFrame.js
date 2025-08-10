/* MMM-iFrame/module.js */
Module.register("MMM-iFrame", {
  defaults: {
    url: "https://example.com",                    // required: full URL to embed
    width: "100%",              // css value; e.g. "100%", "800px"
    height: "100%",             // css value
    refreshInterval: 0,         // ms; 0 = never
    cacheBuster: true,          // append timestamp query param when reloading
    sandbox: "",                // iframe sandbox attribute, e.g. "allow-scripts allow-same-origin"
    allow: "",                  // iframe "allow" attribute, e.g. "camera; microphone; geolocation"
    showLoading: true,          // show spinner while loading first time
    backgroundColor: "transparent",
    wrapperClass: "",           // extra class on wrapper
  },

  start: function () {
    this.loaded = false;
    this.iframe = null;
    if (this.config.refreshInterval && this.config.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => this.reloadiFrame(), this.config.refreshInterval);
    }
  },

  getScripts: function () {
    return [];
  },

  getStyles: function () {
    return ["MMM-iFrame.css"];
  },

  getDom: function () {
    const wrapper = document.createElement("div");
    wrapper.className = "mmm-iframe-wrapper " + this.config.wrapperClass;
    wrapper.style.width = this.config.width;
    wrapper.style.height = this.config.height;
    wrapper.style.background = this.config.backgroundColor;

    if (!this.config.url) {
      const error = document.createElement("div");
      error.className = "mmm-iframe-error";
      error.innerText = "MMM-iFrame: No url configured.";
      wrapper.appendChild(error);
      return wrapper;
    }

    // Loading overlay
    if (this.config.showLoading && !this.loaded) {
      const loader = document.createElement("div");
      loader.className = "mmm-iframe-loading";
      loader.innerHTML = '<div class="mmm-iframe-spinner"></div>';
      wrapper.appendChild(loader);
      this.loadingEl = loader;
    }

    this.iframe = document.createElement("iframe");
    this.iframe.className = "mmm-iframe";
    this.iframe.setAttribute("frameborder", "0");
    this.iframe.setAttribute("allowfullscreen", "true");

    if (this.config.sandbox !== null && this.config.sandbox !== undefined) {
      this.iframe.setAttribute("sandbox", this.config.sandbox);
    }
    if (this.config.allow) {
      this.iframe.setAttribute("allow", this.config.allow);
    }

    // initial src
    this.iframe.src = this._buildSrc(this.config.url, this.config.cacheBuster && !this.loaded);

    // when iframe finishes loading, hide loader
    this.iframe.addEventListener("load", () => {
      this.loaded = true;
      if (this.loadingEl && this.loadingEl.parentNode) {
        this.loadingEl.parentNode.removeChild(this.loadingEl);
        this.loadingEl = null;
      }
    });

    // style sizing to fill wrapper
    this.iframe.style.width = "100%";
    this.iframe.style.height = "100%";
    this.iframe.style.border = "0";
    this.iframe.style.display = "block";

    wrapper.appendChild(this.iframe);
    return wrapper;
  },

  reloadiFrame: function () {
    if (!this.iframe) return;
    // reload by changing src to bust cache if configured
    const newSrc = this._buildSrc(this.config.url, this.config.cacheBuster);
    // If same origin and you want to fully reload, you can also do:
    // this.iframe.contentWindow.location.reload(true);
    this.iframe.src = newSrc;
  },

  _buildSrc: function (url, addCache) {
    if (!addCache) return url;
    // add or append cache buster while preserving existing query params
    const sep = url.indexOf("?") === -1 ? "?" : "&";
    return url + sep + "_mmiframe_cache=" + Date.now();
  },

  notificationReceived: function (notification, payload, sender) {
    // optional: allow dynamic URL update via notification
    if (notification === "MMM-iFrame-SET-URL" && typeof payload === "string") {
      this.config.url = payload;
      if (this.iframe) {
        this.iframe.src = this._buildSrc(payload, this.config.cacheBuster);
      } else {
        this.updateDom();
      }
    }
  },

  socketNotificationReceived: function () {
    // Not used in basic version, kept for extendability
  },

  // clean up on module stop
  suspend: function () {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
  },

  resume: function () {
    if (this.config.refreshInterval && !this.refreshTimer) {
      this.refreshTimer = setInterval(() => this.reloadiFrame(), this.config.refreshInterval);
    }
  }
});
