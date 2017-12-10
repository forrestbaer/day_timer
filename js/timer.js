;
(function ($, window, moment) {

    var Timer = {
        intervalID: 'undefined',
        timerSettings: 'undefined',
        startTime: "7:30 AM",
        endTime: "8:30 PM"
    };

    function init() {
        $('#startTime').clockpicker({
            autoclose: true
        });
        $('#endTime').clockpicker({
            autoclose: true
        });

        setWatches();
        startTimer();
    }

    function setWatches() {
        $('#saveTimes').click(saveSettings);
        $('#configure').click(toggleConfig);
    }

    function startTimer() {
        var sT = localStorage.getItem('startTime');
        var eT = localStorage.getItem('endTime');

        if (sT && eT) {
            Timer.startTime = sT;
            Timer.endTime = eT;
        }
        $('#startTime').val(Timer.startTime);
        $('#endTime').val(Timer.endTime);

        Timer.intervalID = setInterval(() => {
            updateTimer();
        }, (1000));
    }

    function updateTimer() {
        // what about if time is later than now?
        var start = moment(Timer.startTime, 'HH:mm').toDate();
        var end = moment(Timer.endTime, 'HH:mm').toDate();
        var now = moment();

        var complete = Math.round(((now - start) / (end - start)) * 100);
        var ms = moment(end, "DD/MM/YYYY HH:mm:ss").diff(moment(now, "DD/MM/YYYY HH:mm:ss"));
        var d = moment.duration(ms);
        var dA = Math.floor(d.asHours()) > 0 ? Math.floor(d.asHours()) + ":" : "";
        var toGo = dA + moment.utc(ms).format("mm:ss");

        if (complete >= 100 || complete < 0) {
            complete = 100;
            timerComplete();
        }

        $('.container').html('<h1>' + complete + '<span>%</span></h1><h2>' + toGo + '</h2>');
    }

    function saveSettings() {
        var startTime = $('#startTime').val();
        var endTime = $('#endTime').val();

        localStorage.setItem('startTime', startTime);
        localStorage.setItem('endTime', endTime);

        toggleConfig();
        clearInterval(Timer.intervalID);
        startTimer();
    }

    function timerComplete() {
        clearInterval(Timer.intervalID);
        console.log('You did it!');
    }

    function toggleConfig() {
        $('#configPanel').toggleClass('visible');
    }

    $(function () {
        init();
    });

})(jQuery, window, moment);
