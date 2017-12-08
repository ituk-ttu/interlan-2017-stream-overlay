var app = new Vue({
    el: '#app',
    data: {
        show: false,
        data: null
    },
    mounted: function () {
        var self = this;
        self.io = io();
        self.io.on("connect", function () {
            console.log("CONNECTION STATUS SET TO: true");
            self.io.emit("viewAvailable", VIEW_NAME);
            self.connectionActive = true;
        });
        self.io.on("disconnect", function () {
            self.connectionActive = false;
            console.log("CONNECTION STATUS SET TO: false");
        });
        self.io.on('visible', function (views) {
            console.log("OVERLAY VISIBILITY SET TO: " + views[VIEW_NAME]);
            self.show = views[VIEW_NAME];
        });
        self.io.on('data', function (data) {
            console.log("RECEIVED NEW DATA");
            self.data = data;
        });
        self.io.emit('getData');
        self.io.emit('getViews');
    },
    methods: {
        toLowerCase: function (str) {
            return String(str).toLowerCase();
        }
    }
});