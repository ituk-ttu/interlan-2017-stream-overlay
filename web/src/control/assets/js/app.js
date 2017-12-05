var app = new Vue({
    el: '#app',
    data: {
        overlay: {
            show: false
        },
        views: [],
        connectionActive: false,
        authed: false,
        authError: false,
        io: null,
        password: "",
        loading: true
    },
    methods: {
        setVisible: function (bool) {
            this.io.emit("setVisible", bool);
        },
        setData: function () {
            this.io.emit("setData", this.overlay.modified);
        },
        resetData: function () {
            this.overlay.modified = this.overlay.current;
        },
        saveToFile: function () {
            this.io.emit("saveToFile");
        },
        auth: function (password) {
            this.io.emit("authenticate", password);
        }
    },
    mounted: function () {
        var self = this;
        self.io = io();
        self.io.on("connect", function () {
            console.log("CONNECTION STATUS SET TO: true");
            self.connectionActive = true;
        });
        self.io.on("disconnect", function () {
            self.connectionActive = false;
            console.log("CONNECTION STATUS SET TO: false");
            self.authed = false;
        });
        self.io.on('authenticate', function (bool) {
            console.log("AUTH SET TO: " + bool);
            self.authError = !bool;
            if (bool) {
                self.io.emit("getData");
            }
            self.authed = bool;
        });
        self.io.on('visible', function (bool) {
            console.log("OVERLAY VISIBILITY SET TO: " + bool);
            self.overlay.show = bool;
        });
        self.io.on('data', function (data) {
            console.log("RECEIVED NEW DATA");
            self.overlay.current = data;
            self.overlay.modified = data;
            self.loading = false;
        });
    }
});