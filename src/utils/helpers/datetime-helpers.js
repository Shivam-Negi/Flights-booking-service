function compareTime(timeString1, timeString2) {
    let dateTime1 = new Date(timeString1);
    let dateTime2 = new Date(timeString2);
    return dateTime1.getTime() > dateTime2.getTime();
}

module.exports = {
    compareTime
}

/* 
    let x = compareTime('2023-07-19 07:45:00','2023-07-19 05:15:00');
    console.log(x); 
*/

