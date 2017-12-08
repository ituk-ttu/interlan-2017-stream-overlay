var app = new Vue({
    el: '#app',
    data: {
        overlay: {
            show: {}
        },
        connectionActive: false,
        authed: false,
        authError: false,
        io: null,
        password: "",
        loading: true,
        teams: null,
        available_maps: ["Cache", "Cobblestone", "Inferno", "Mirage", "Nuke", "Overpass", "Train"],
        nullTeam: {
            id: "???",
            name: "???",
            logo: null
        }
    },
    methods: {
        setVisible: function (viewName, bool) {
            this.io.emit("setVisible", {"viewName": viewName, "visible": bool});
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
        },
        swapTeams: function () {
            var temp = this.overlay.modified.teams.left;
            this.overlay.modified.teams.left = this.overlay.modified.teams.right;
            this.overlay.modified.teams.right = temp;
            app.$forceUpdate();
        },
        updateTeams: function () {
            this.io.emit("updateTeams");
        },
        getObjectAsArray: function (object) {
            if (object !== undefined && object !== null) {
                var array = [];
                Object.keys(object).forEach(function (key, index) {
                    array.push({
                        key: key,
                        value: object[key]
                    });
                });
                return array.sort(function (a, b) {
                    return a.key > b.key ? 1 : -1;
                });
            } else {
                return []
            }
        },
        isFocused: function (map) {
            return map === this.overlay.modified.focusedMap;
        },
        focus: function (map) {
            this.overlay.modified.focusedMap = map;
            app.$forceUpdate();
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
                self.io.emit("getAll");
            }
            self.authed = bool;
        });

        self.io.on('visible', function (views) {
            console.log("OVERLAY VISIBILITY SET TO: " + views);
            self.overlay.show = views;
        });

        self.io.on('all', function (all) {
            console.log("OVERLAY VISIBILITY SET TO: " + all.views);
            self.overlay.show = all.views;
            console.log("RECEIVED NEW DATA");
            self.overlay.current = all.data;
            self.overlay.modified = all.data;
            console.log("RECEIVED NEW TEAMS");
            self.teams = all.teams;
            self.loading = false;
        });

        self.io.on('data', function (data) {
            console.log("RECEIVED NEW DATA");
            self.overlay.current = data;
            self.overlay.modified = data;
            self.loading = false;
        });

        self.io.on('teams', function (teams) {
            console.log("RECEIVED NEW TEAMS");
            self.teams = teams;
        });
    }
});