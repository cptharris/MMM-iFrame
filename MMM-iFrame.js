/* MMM-iFrame/module.js */
Module.register("MMM-iFrame", {
  defaults: {
    url: "https://example.com",                    // required: full URL to embed
    width: "100%",                                 // css value; e.g. "100%", "800px"
    height: "100%",                                // css value
    refreshInterval: 0,                            // ms; 0 = never
    cacheBuster: true,                             // append timestamp query param when reloading
    sandbox: "",                                   // iframe sandbox attribute, e.g. "allow-scripts allow-same-origin"
    allow: "",                                     // iframe "allow" attribute, e.g. "camera; microphone; geolocation"
    showLoading: true,                             // show spinner while loading first time
    backgroundColor: "transparent",                // background color of wrapper element
    wrapperClass: "",                              // extra class on wrapper
    unloadOnHide: false,                           // whether to unload the iframe when it is hidden (may save CPU)
    instanceId: "",                                // optional string to target this instance with notifications
  },

  start: function () {
    this.loaded = false;
    this.iframe = null;
    if (this.config.refreshInterval && this.config.refreshInterval > 0) {
      this.refreshTimer = setInterval(() => this.reloadIframe(), this.config.refreshInterval);
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

    if (this.config.sandbox) {
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

    // Save wrapper reference
    this.wrapper = wrapper;

    // IntersectionObserver logic
    if (this._io) {
      // Disconnect any previous observer
      this._io.disconnect();
      this._io = null;
    }
    // Only observe if wrapper is connected to DOM
    // Use a microtask to ensure wrapper is attached
    setTimeout(() => {
      if (!this.wrapper || !this.wrapper.isConnected) return;
      // Create observer with 1% threshold
      this._io = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.intersectionRatio >= 0.01) {
              if (typeof this.resume === "function") this.resume();
            } else {
              if (typeof this.suspend === "function") this.suspend();
            }
          });
        },
        { threshold: 0.01 }
      );
      this._io.observe(this.wrapper);
    }, 0);

    return wrapper;
  },

  reloadIframe: function () {
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
    if (notification !== "MMM-iFrame-SET-URL") return;

    // payload can be a string (url) or an object: { url, target }
    let newUrl = null;
    let target = null;

    if (typeof payload === "string") {
      newUrl = payload;
    } else if (payload && typeof payload === "object") {
      newUrl = payload.url || null;
      target = payload.target || null;
    }

    if (!newUrl) return;

    // If target provided, only apply to matching instanceId
    if (target && target !== this.config.instanceId) return;

    this.config.url = newUrl;
    if (this.iframe) {
      this.iframe.src = this._buildSrc(newUrl, this.config.cacheBuster);
    } else {
      this.updateDom();
    }
  },

  socketNotificationReceived: function () {
    // Not used in basic version, kept for extendability
  },

  // clean up on module stop
  suspend: function () {
    // stop refresh timer if present
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }

    // optionally unload iframe to save CPU/network when hidden
    if (this.config.unloadOnHide && this.iframe && this.iframe.src && this.iframe.src !== "about:blank") {
      this._savedSrc = this.iframe.src;
      this.iframe.src = "about:blank";
    }
  },

  resume: function () {
    // (re)start the refresh timer if configured and not already running
    if (this.config.refreshInterval && !this.refreshTimer) {
      this.refreshTimer = setInterval(() => this.reloadIframe(), this.config.refreshInterval);
    }

    // restore iframe src if we unloaded it on suspend
    if (this.config.unloadOnHide && this.iframe && this._savedSrc) {
      this.iframe.src = this._savedSrc;
      this._savedSrc = null;
    }
  }
});
