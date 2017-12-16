// import sqlite from 'sqlite';
var path = require('path');
var express = require('express');
var router = express.Router();
var cors = require('cors');
var restapi = express();
var bodyParser = require("body-parser");
var moment = require('moment');
var winston = require('winston');

var sqlite3 = require('sqlite3').verbose();
var mysql = require('mysql');
//var db = new sqlite3.Database('data/demodb02');
var config = require('config');
var fs = require('fs');

/*MySql connection*/
var connection = require('express-myconnection'),
    mysql = require('mysql');

var configurationFileName = '../configuration/configuration.json';
var configuration = JSON.parse(
    fs.readFileSync(configurationFileName));


// restapi.use(express.methodOverride());

// var allowCrossDomain = function(req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

//     // intercept OPTIONS method
//     if ('OPTIONS' == req.method) {
//       res.sendStatus(200);
//     }
//     else {
//       next();
//     }
// };
// restapi.use(allowCrossDomain);

restapi.use(cors());
restapi.use(bodyParser.json());
//console.log(bodyParser.json());
// restapi.use(bodyParser.urlencoded({ // to support URL-encoded bodies
//     extended: true
// }));
var rootdir = "db";
var rootDirectory = __dirname;
if (process.platform === 'win32') {
    rootDirectory = '/' + rootDirectory;
}
//var dbpath = path.join(rootDirectory,'panna.db');
//var dbpath1 = path.join(rootDirectory,'webinterface.db');
// var pannadb = new sqlite3.Database('D:\\GridMonitor\\nodeApp\\db/panna.db');
// var pannadb = new sqlite3.Database('panna.db');

//creating connetion pool
var pool = mysql.createPool({
    connectionLimit: configuration["db"][0]["connectionLimit"], //important
    host: configuration["db"][0]["host"],
    user: configuration["db"][0]["user"],
    password: configuration["db"][0]["password"],
    database: configuration["db"][0]["database"],
    debug: false
});

restapi.use(
    connection(mysql, {
        connectionLimit: configuration["db"][0]["connectionLimit"],
        host: configuration["db"][0]["host"],
        user: configuration["db"][0]["user"],
        password: configuration["db"][0]["password"],
        database: configuration["db"][0]["database"],
        debug: false //set true if you wanna see debug logger
    }, 'request')

);



function errorMethod(error, errorType, studyId, shouldTryAgain) {
    /* This method is called if an error occurs during any step of the process. */
    awesomeLog('Error is  : ' + error, errorType, studyId);
    pool.getConnection(function(err, connection) {
        if (err) {
            // connection.release();
            awesomeLog(config.get('errorMsgs.connectionNonFound'), 0);
            return;
        }
        // console.log('connection id : ' + connection.threadId);
        var query = "select * from questionsmaster limit 2;";
        connection.query(query, function(err, rows, fields) {
            connection.release();
        });

    });

}

var myCustomLevels = {
    levels: {
        critical: 0,
        error: 1,
        warning: 2,
        info: 3
    }
};

function awesomeLog(log, type, studyId) {
    /* This is a custom log method to create logs as per different
        priority levels (critical, error, warning, info). It creates a
        new folders for every day.
     */
    var now = moment(new Date());
    var dateString = now.format("YYYY_MM_D");

    var fs = require('fs');
    var dir = './logs/' + dateString;

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    var logger = new(winston.Logger)({
        transports: [
            new(winston.transports.Console)(),
            new(winston.transports.File)({ filename: dir + '/' + studyId + '.log' })
        ],
        levels: myCustomLevels.levels
            // do exception handling for folder not exist
    });

    switch (type) {
        case 0:
            logger.critical(log);
            break;
        case 1:
            logger.error(log);
            break;
        case 2:
            logger.warning(log);
            break;
        case 3:
            logger.info(log);
            break;
        default:
            break;
    }
}

var pannadb = new sqlite3.Database(path.join(__dirname, '..', 'db', 'panna.db'));
// console.log(__dirname);
// console.log(pannadb);
//var webInterfacedb = new sqlite3.Database('D:\\GridMonitor\\nodeApp\/db/webinterface.db');

// var webInterfacedb = new sqlite3.Database('webinterface.db');

var webInterfacedb = new sqlite3.Database(path.join(__dirname, '..', 'db', 'webinterface.db'));


//var getCurrentReading = "select a.co Name,cr.co Value,b.co Unit from panaa.settings a inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.co='CO' UNION ALL select a.o3 Name,cr.o3 Value,b.o3 Unit from  panaa.settings inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.o3='O3' UNION ALL select a.NO2 Name,cr.NO2 Value,b.NO2 Unit from  panaa.settings a inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.NO2='NO2' UNION ALL select a.SO2 Name,cr.SO2 Value,b.SO2 Unit from panaa.settings a inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.SO2='SO2' UNION ALL select a.PM2p5 Name,cr.PM2p5 Value,b.PM2p5 Unit from panaa.settings a inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.PM2p5='PM2.5' UNION ALL select  a.PM10 Name,cr.PM10 Value,b.PM10 Unit from panaa.settings a inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.PM10='PM10' UNION ALL select a.TSP Name,cr.TSP Value,b.TSP Unit from panaa.settings a inner join panaa.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.TSP='TSP' ";
var settingsdata = "select *  from settings";
var currentReadings = " select a.co Name,cr.co Value from settings a inner join currentReadings cr on a.id = cr.id UNION ALL select a.o3 Name,cr.o3 Value from settings a inner join currentReadings cr on a.id = cr.id UNION ALL select a.no2 Name,cr.no2 Value from settings a inner join currentReadings cr on a.id = cr.id UNION ALL select a.so2 Name,cr.so2 Value from settings a inner join currentReadings cr on a.id = cr.id UNION ALL select a.pm2p5 Name,cr.pm2p5 Value from settings a inner join currentReadings cr on a.id = cr.id UNION ALL select a.pm10 Name,cr.pm10 Value from settings a inner join currentReadings cr on a.id = cr.id";

var test3 = "select a.co Name,cr.co Value, from panna.settings a inner join panna.currentReadings cr on a.id = cr.id inner join webinterface_updated.UnitSettings b on b.id = a.id where a.co='CO' UNION ALL select a.o3 Name,cr.o3 Value,b.o3 Unit from panna.settings a inner join panna.currentReadings cr on a.id = cr.id inner join webinterface_updated.UnitSettings b on b.id = a.id where a.o3='O3'";

// var unitsettings = " select b.co Unit UnitSettings b inner join rawdata a  on a.Id=b.id where a.Name = 'CO'";
var readingsdata = "select id, round(co, 2), round(o3,2),round(no2,2),round(so2, 2), round(pm2p5,2),round(pm10,2),round(tsp,2), round(res1,2),round(res2,2),round(res3,2),round(res4,2),utc from readings";
var viewdata = "select id, round(co, 2) co, round(o3,2) o3, round(no2,2) no2, round(so2, 2) so2, round(pm2p5,2) pm2p5,round(pm10,2) pm10, round(tsp,2) tsp, round(res1,2) res1,round(res2,2) res2,round(res3,2) res3, round(res4,2) res4, utc from readings";
var unitsettings1 = " select * from UnitSettings";
var getipcSettingQuery = 'SELECT id, flags, textmsg, averagetime, loggingtime, gasunit, tempunit, pressureunit FROM ipcMessage where id=1';
//var t2 = "select a.co Name,cr.co Value,b.co Unit from panna.settings a inner join panna.currentReadings cr on a.id = cr.id inner join webinterface.UnitSettings b on b.id = a.id where a.co='CO' ";

var rawdata = "";
var webinterface_data = "";
var array = [];

restapi.post('/exportData', function(req, res) {
    restapi.options('/exportData', cors());
    console.log('Query : ' + getExportedQuery(req.body));
    console.log('Data :' + req.body.selectedOption);
    console.log('fromDate :' + req.body.fromDate);
    console.log('toDate :' + req.body.toDate);
    // pannadb.all(readingsdata, function(err, row) {
    pannadb.all(getExportedQuery(req.body), function(err, row) {
        if (!err) {
            res.json(row);
        } else {
            res.err();
        }
    });
});

function getExportedQuery(exportParameters) {
    var sqlQuery = 'select id, co,  o3, no2, so2, pm2p5, pm10, tsp, res1, res2, res3, res4,utc from readings';
    if (exportParameters.selectedOption.toLowerCase() == 'export all records') {
        sqlQuery = sqlQuery;
    } else if (exportParameters.selectedOption.toLowerCase() == 'export new records') {
        sqlQuery = sqlQuery + ' WHERE 1=1';
    } else if (exportParameters.selectedOption.toLowerCase() == 'export selected number of records') {
        sqlQuery = sqlQuery + ' limit ' + exportParameters.noofRecord;
    } else if (exportParameters.selectedOption.toLowerCase() == 'export selected date range') {
        sqlQuery = sqlQuery + ' WHERE 1=1';
    }
    return sqlQuery;
}


restapi.get('/viewData', function(req, res) {
    pannadb.all(viewdata, function(err, row) {
        res.json(row);
    });
});
restapi.get('/getipcSettings', function(req, res) {
    restapi.options('/getipcSettings', cors());
    // console.log('inside the getnetcp fn');
    webInterfacedb.all(getipcSettingQuery, function(err, row) {
        if (!err) {
            res.json(row);
            console.log(row);
        } else {
            res.err();
        }
    });
});
// Allowing CORS

restapi.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // allow preflight
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

//GET question master records
restapi.get('/getQuestion', function(req, res) {
    req.getConnection(function(err, conn) {

        if (err) return next("Cannot Connect");
        var query = conn.query(config.get('questions_configuration_query.getQuestionMaster'), function(err, rows) {

            if (err) {
                console.log(err);
                return next("Mysql error, check your query");
            }
            res.status('200');
            res.json(rows);

        });

    });

});



// res 

//restapi.put('/postdata/:id', function(req, res) {

restapi.put('/postdata', function(req, res) {
    restapi.options('/postdata', cors());
    console.log('Hello');
    console.log(req.body.averagetime);
    webInterfacedb.run("UPDATE ipcMessage SET averagetime = " + req.body.averagetime + " " + "WHERE id = 1", cors(), function(err, row) {
        if (err) {
            console.log(err);
            res.status(500);
        } else {
            res.status(202);
            res.json("ok");
        }
        res.end();
    });
});

restapi.use(bodyParser.json());
restapi.put('/measurmentUnits', function(req, res) {

    //restapi.put('/postdata', function (req, res) {
    restapi.options('/measurmentUnits', cors());
    console.log('Hello');
    console.log(req.body.pressure);
    console.log(req.body.gas);
    console.log(req.body.temp);
    //console.log(req.params.t2);
    webInterfacedb.run("UPDATE ipcMessage SET gasunit = '" + req.body.gas + "', tempunit='" + req.body.temp + "', pressureunit='" + req.body.pressure + "' " + "WHERE id = 1", cors(), function(err, row) {
        if (err) {
            console.log(err);
            res.status(500);
        } else {
            res.status(202);
            res.json("ok");
        }
        res.end();
    });
});


// Setting Logging period 
restapi.put('/setLogging', function(req, res) {

    restapi.options('/setLogging', cors());
    console.log('Hello');
    console.log(req.body.loggingTime);
    webInterfacedb.run("UPDATE ipcMessage SET loggingtime = '" + req.body.loggingTime + "' " + "WHERE id = 1", cors(), function(err, row) {
        if (err) {
            console.log(err);
            res.status(500);
        } else {
            res.status(200);
            res.json("ok");
        }
        res.end();
    });
});

// end

// Setting Logging period 
restapi.put('/seteraseLogStatus', function(req, res) {

    restapi.options('/seteraseLogStatus', cors());
    console.log(req.body.eroselogStatus);
    webInterfacedb.run("UPDATE ipcMessage SET flags = '" + req.body.eroselogStatus + "' " + "WHERE id = 1", cors(), function(err, row) {
        if (err) {
            console.log(err);
            res.status(500);
        } else {
            res.status(200);
            res.json("ok");
        }
        res.end();
    });
});

// end

// Getting tcpIP data
var getnetSettingQuery = 'SELECT id, dhcp, ipv4, netmask, gateway, hostname, ntpserver FROM netSettings where id=1';
restapi.get('/getnetSetting', function(req, res) {
    restapi.options('/getnetSetting', cors());
    // console.log('inside the getnetcp fn');
    webInterfacedb.all(getnetSettingQuery, function(err, row) {
        if (!err) {
            res.json(row);
        } else {
            res.err();
        }
    });
});
// end

// Getting Environmentals data
var getEnvironmentalgQuery = 'SELECT id, sensors, readingvalue FROM environmental;';
restapi.get('/getEnvironmental', function(req, res) {
    restapi.options('/getEnvironmental', cors());
    // console.log('inside the getnetcp fn');
    pannadb.all(getEnvironmentalgQuery, function(err, row) {
        if (!err) {
            console.log(row);
            res.json(row);
        } else {
            res.err();
        }
    });
});
// end

// Getting Environmentals data
var gettestvoltageQuery = 'SELECT id, board, expectedvalue, actualvalue FROM testvoltages;';
restapi.get('/getTestVoltage', function(req, res) {
    restapi.options('/getTestVoltage', cors());
    // console.log('inside the getnetcp fn');
    pannadb.all(gettestvoltageQuery, function(err, row) {
        if (!err) {
            console.log(row);
            res.json(row);
        } else {
            res.err();
        }
    });
});
// end

restapi.listen(4000);

console.log("API is ready, Submit GET or POST to http://localhost:4000/data");