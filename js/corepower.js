;
(function ($, moment, window) {

    var apiData = [];
    var today = moment().format('YYYY-MM-DD');

    function init() {
        setWatches();
    }

    function setWatches() {
        $(document).keyup(function (e) {
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
                var photo = cN.teacher.image_url ? cN.teacher.image_url : 'images/logo-circle.png';
                tD[idx].classes.push({
                    className: cN.name,
                    start: moment.utc(new Date(cN.start_date_time)).format('h:mm a'),
                    start2: moment.utc(new Date(cN.start_date_time)),
                    end: moment.utc(new Date(cN.end_date_time)).format('h:mm a'),
                    teacher: cN.teacher.first_name,
                    teacherPhoto: photo
                });
            });
        });

        return tD;
    }

    function showTeacherImage() {

    }

    function renderData(tD) {
        var toAppend = "";
        var now = moment(new Date()).utc();

        tD.forEach(function (studio) {
            toAppend += '<div class="aStudio">\n';
            toAppend += ('<h2>' + studio.studioName + '</h2>\n');
            toAppend += '<table><thead><tr><th>Class</th><th>Start</th><th>End</th><th>Instructor</th></tr></thead>';
            studio.classes.forEach(function (aClass) {
                var passed = now.isBefore(aClass.start2.add(7, 'h')) ? '' : 'passed';
                toAppend += '<tr class="'+passed+'">';
                toAppend += '<td>' + aClass.className + '</td>';
                toAppend += '<td>' + aClass.start + '</td>';
                toAppend += '<td>' + aClass.end + '</td>';
                toAppend += '<td class="instructor"><img class="instructorPhoto" src="' + aClass.teacherPhoto + '">' + aClass.teacher + '</td>';
                toAppend += '</tr>';
            });
            toAppend += '</table></div>\n';
        });

        $('.yogaSelector').html("").append(toAppend);
    }

    $(function () {
        init();
    });

})(jQuery, moment, window);