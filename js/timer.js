;(function ($, window, moment) {

    var Timer = {
        intervalID: 0,
        startTime: "7:30",
        endTime: "16:30",
        compOrRemain: "complete"
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
        var cOR = localStorage.getItem('compOrRemain');

        if (sT !== null && eT !== null && cOR !== "") {
            Timer.startTime = sT;
            Timer.endTime = eT;
            Timer.compOrRemain = cOR;
        }

        $('#startTime').val(Timer.startTime);
        $('#endTime').val(Timer.endTime);
        $('.radioButtons :input[value="' + cOR + '"]').prop("checked", true);

        updateTimer();

        Timer.intervalID = setInterval(function () {
            updateTimer();
        }, (1000));

    }

    function updateTimer() {
        var start = moment(Timer.startTime, 'HH:mm').toDate();
        var end = moment(Timer.endTime, 'HH:mm').toDate();
        var now = moment().toDate();

        var perToGo = Math.round(((now - start) / (end - start)) * 100);
        var perLeft = 100 - perToGo;
        var perMetric = Timer.compOrRemain === "complete" ? perToGo : perLeft;

        var ms = moment(end, "DD/MM/YYYY HH:mm:ss").diff(moment(now, "DD/MM/YYYY HH:mm:ss"));
        var d = moment.duration(ms);
        var dA = Math.floor(d.asHours()) > 0 ? Math.floor(d.asHours()) + ":" : "";
        var timeLeft = dA + moment.utc(ms).format("mm:ss");

        if (perMetric >= 100 || perMetric < 0) {
            timerComplete();
        } else {
            $('.container').html('<h1>' + perMetric + '<span>%</span></h1><h2>' + timeLeft + '</h2>');
        }

    }

    function saveSettings() {
        var startTime = $('#startTime').val();
        var endTime = $('#endTime').val();
        var compOrRemain = $('input[type="radio"]:checked').val();

        if (moment(endTime, 'HH:mm').isBefore(moment(startTime, 'HH:mm'))) {
            $('#startTime').addClass('error');
        } else {
            $('#startTime').removeClass('error');
            localStorage.setItem('startTime', startTime);
            localStorage.setItem('endTime', endTime);
            localStorage.setItem('compOrRemain', compOrRemain);

            toggleConfig();
            clearInterval(Timer.intervalID);
            startTimer();
        }

    }

    function timerComplete() {
        // throw a party here, colors
        $('.container').html('<h3>You done!</h3>');
        clearInterval(Timer.intervalID);
    }

    function toggleConfig() {
        $('#configPanel').toggleClass('visible');
    }

    $(function () {
        init();
    });

})(jQuery, window, moment);