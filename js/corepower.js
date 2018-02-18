;
(function ($, moment, window) {

    var apiData = [];
    var today = moment().format('YYYY-MM-DD');

    function init() {
        setWatches();
    }

    function setWatches() {

        $(document).keyup(function(e) {
            if (e.keyCode === 27) {
                getClasses();
            }
        });
    }

    function getClasses() {
        if (localStorage.getItem(today) === null) {
            var requests = [
                callApi({
                    id: '110/12',
                    startDate: today,
                    endDate: today
                }),
                callApi({
                    id: '110/3',
                    startDate: today,
                    endDate: today
                })
            ];
            Promise.all(requests).then((combined) => {
                localStorage.setItem(today, JSON.stringify(combined));
                showClasses();
            }).catch((error) => {
                console.error(error);
            });
        } else {
            showClasses();
        }
    }

    function callApi(data) {
        return new Promise((resolve, reject) => {
            var options = {
                url: 'https://api.corepoweryoga.com/locations/' + data.id + '/classes/' + data.startDate + '/' + data.endDate
            };

            $.ajax(options)
                .done((res) => {
                    var body = apiData.concat.apply([], res);
                    resolve(body);
                })
                .fail((err) => {
                    reject(err);
                });
        });
    }

    function showClasses() {
        var templateData = getTemplateData();
        renderData(templateData);
        $('.yogaSelector').toggleClass('visible');
    }

    function getTemplateData() {
        var storedItems = JSON.parse(localStorage.getItem(today));
        // sort by time of start
        storedItems.forEach(function (loc) {
            loc.sort(function (x, y) {
                return new Date(x.start_date_time) - new Date(y.start_date_time);
            });
        });
        var tD = [];

        storedItems.forEach(function (loc, idx) {
            tD[idx] = {
                studioName: loc[0].location.name
            };
            tD[idx].classes = [];
            loc.forEach(function (cN) {
                if (cN.name.indexOf('Yoga 2') > 0 || cN.name.indexOf('Yoga 1') > 0) {
                    var photo = cN.teacher.image_url ? cN.teacher.image_url : 'images/logo-circle.png';
                    var shortName = cN.name.indexOf('Yoga 2') > 0 ? 'C2' : 'C1';
                    tD[idx].classes.push({
                        className: shortName,
                        start: moment.utc(new Date(cN.start_date_time)).format('h:mm a'),
                        start2: moment.utc(new Date(cN.start_date_time)),
                        start3: cN.start_date_time,
                        teacher: cN.teacher.first_name,
                        teacherPhoto: photo
                    });
                }
            });
        });

        return tD;
    }

    function renderData(tD) {
        var toAppend = "";
        var now = moment(new Date()).utc();

        tD.forEach(function (studio) {
            toAppend += '<div class="aRow">\n';
            toAppend += ('<h2>' + studio.studioName + '</h2>\n');
            studio.classes.forEach(function (aClass) {
                var passed = now.isBefore(aClass.start2.add(7,'h')) ? '' : 'passed';
                toAppend += '<div class="'+passed+'"><img src="' + aClass.teacherPhoto + '" /><h3>' + aClass.className + ' ' + aClass.teacher + '<br/>' + aClass.start + '</h3></div>\n';
            });
            toAppend += '</div>\n';
        });

        $('.yogaSelector').html("").append(toAppend);
    }

    $(function () {
        init();
    });

})(jQuery, moment, window);