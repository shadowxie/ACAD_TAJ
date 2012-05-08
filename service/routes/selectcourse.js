/**
 * 課程加選處理（學生）
 */
app.post(urlprefix + '/service/selectcourse.json', function(req, res) {
    res.charset = 'UTF-8';
    res.contentType('application/json');

    //學生資料（SESSION）
    var user = req.session.user;

    //課程清單（網頁表單）    
    var courses = req.body['courses'].split(',');

    //預備批次寫入資料庫的資料陣列
    var docs = new Array();

    courses.forEach(function(course) {
        
        //用冒號分隔 semcourseid 及 courseid
        var course_arr = course.split(':');

        docs.push({
            semcourseid: course_arr[0], //學期課號
            courseid: course_arr[1],    //課號
            studentid: user.studentid,  //學生代碼
            studentno: user.studentno,  //學號
            createdate: new Date(),     //資料建立日期
            regtype: '1'                //選課類型
        });
    });

    console.log(docs);

    var options = {
        upsert: true,
        multi: false,
        safe: true
    };

    db.collection('tSelectedSemCus').insert(docs, options, function() {
        var results = {
            success: true,
            data: {
                docs: docs
            }
        };

        res.send(JSON.stringify(results));
    });
});