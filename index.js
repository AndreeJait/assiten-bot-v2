const Discord = require('discord.js');
const mongoose = require('mongoose')
const ScheduleModel = require('./models/schedule')
const client = new Discord.Client()
const commands = [
    ">info", ">add-schedule", ">say-love", ">today", ">today-schedule", ">add-schedule", ">set-server", ">delete-schedule", ">get-schedule", ">get-all-schedule"
]
const db_url = "mongodb+srv://blank:" + process.env.MONGOOSE_DB_PW + "@cluster0.0bakn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(res => {

}).catch(err => {
    console.log(err)
})

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}
let interval_time = 5
client.login(process.env.DC_TOKEN.split("#")[1] + process.env.DC_TOKEN.split("#")[2] + process.env.DC_TOKEN.split("#")[3])
client.on("ready", () => {
    var channel = client.channels.cache.get('831436674205614091');
    shcheduleWillDo()
    setInterval(() => {
        let date = new Date()
        let newDate = leftPad(date.getDate(), 2) + "/" + leftPad(date.getMonth() + 1, 2) + "/" + leftPad(date.getFullYear(), 4)
        let start_hour = date.getHours()
        let start_minute = date.getMinutes()
        if ((start_minute - interval_time) < 0) {
            start_hour -= 1
            start_minute = 60 + (start_minute - interval_time)
        } else {
            start_minute = start_minute - interval_time
        }
        let start_time = leftPad(start_hour, 2) + ":" + leftPad(start_minute, 2) + ":" + "00"
        let end_time = leftPad(date.getHours(), 2) + ":" + leftPad(date.getMinutes(), 2) + ":" + "00"
        ScheduleModel.find({ date: newDate })
            .exec()
            .then(res => {
                if (res.length > 0) {
                    let result = "\n Segera lakukan jadwal dibawah !\n"
                    let send = false
                    res.map((item, index) => {
                        if (item.time >= start_time && item.time <= end_time) {
                            result += "\n-" + item.name + " pada waktu " + item.time
                            send = true
                        }
                    })
                    if (send) {
                        channel.send(result)
                    }
                }
            })
            .catch(err => {
                msg.reply("Error to get schedule!")
            })
    }, 60 * 1000)
})
client.on("message", (msg) => {
    const arr = msg.content.split(" ")
    if (commands.includes(msg.content.split(" ")[0])) {
        if (arr[0] == commands[0]) {
            msg.reply("This bot create by Andree Panjaitan,\n this bot to manage your schedule!")
        }
        if (arr[0] == commands[3]) {
            let date = new Date()
            let newDate = leftPad(date.getDate(), 2) + "/" + leftPad(date.getMonth() + 1, 2) + "/" + leftPad(date.getFullYear(), 4)
            msg.reply(newDate)
        }
        if (arr[0] == commands[2]) {
            msg.reply("Andree sayang Revi :love_letter:")
        }
        if (arr[0] == commands[4]) {
            let date = new Date()
            let newDate = leftPad(date.getDate(), 2) + "/" + leftPad(date.getMonth() + 1, 2) + "/" + leftPad(date.getFullYear(), 4)
            let result = "\nYour schedule today " + newDate + " :\n"
            ScheduleModel.find({ date: newDate })
                .exec()
                .then(res => {
                    res.map((item, index) => {
                        result += "\n" + Number(index + 1) + ". " + item.name + " Waktu activities " + item.time
                    })
                    msg.reply(result)
                })
                .catch(err => {
                    msg.reply("Error to get schedule!")
                })
        }
        if (arr[0] === commands[5]) {
            let slice = arr.slice(1, arr.length + 1).join(" ").split("#")
            if (slice[0] == undefined || slice[1] == undefined || slice[2] == undefined) {
                msg.reply("\nMasukkan command yang benar!")
            } else {
                ScheduleModel.find({ name: slice[1], date: slice[0] })
                    .exec()
                    .then(res => {
                        if (res.length) {
                            msg.reply("Jadwal already exist in db!")
                        } else {
                            let new_schedule = new ScheduleModel({
                                _id: mongoose.Types.ObjectId(),
                                name: slice[1],
                                date: slice[0],
                                time: slice[2]
                            })
                            new_schedule.save()
                                .then(result => {
                                    msg.channel.send("Activity success to add")
                                })
                                .catch(err => {
                                    msg.channel.send("Failed to add activity")
                                })
                        }
                    }).catch(err => {
                        msg.channel.send("Failed to add activity")
                    })
            }
        }
        if (arr[0] === commands[7]) {
            let slice = arr.slice(1, arr.length + 1).join(" ").split("#")
            if (slice[0] == undefined || slice[1] == undefined) {
                msg.reply("\nMasukkan command yang benar!")
            } else {
                ScheduleModel.deleteOne({ name: slice[1], date: slice[0] })
                    .exec().then(res => {
                        if (res.n === 0) {
                            msg.channel.send("Data not found in db!")
                        } else {
                            msg.channel.send("Success to delete!")
                        }
                    }).catch(err => {
                        msg.channel.send("Failed to delete!")
                    })
            }
        }
        if (arr[0] == commands[8]) {
            let result = "\nYour schedule at " + arr[1] + " :\n"
            if (arr[1] === undefined) {
                msg.reply("\nMasukkan command yang benar!")
            } else {
                ScheduleModel.find({ date: arr[1] })
                    .exec()
                    .then(res => {
                        res.map((item, index) => {
                            result += "\n" + Number(index + 1) + ". " + item.name + " Waktu activities " + item.time
                        })
                        msg.reply(result)
                    })
                    .catch(err => {
                        msg.reply("Error to get schedule!")
                    })
            }
        }
        if (arr[0] == commands[9]) {
            let result = "\nAll Your schedule \n"
            ScheduleModel.find()
                .sort({ 'date': 1 })
                .exec()
                .then(res => {
                    res.map((item, index) => {
                        result += "\n" + Number(index + 1) + ". " + item.name + " Waktu activities " + item.time + " pada tanggal " + item.date
                    })
                    msg.reply(result)
                })
                .catch(err => {
                    msg.reply("Error to get schedule!")
                })
        }
    }
})

function shcheduleWillDo() {
    var channel = client.channels.cache.get('831436674205614091');
    let date = new Date()
    let newDate = leftPad(date.getDate(), 2) + "/" + leftPad(date.getMonth() + 1, 2) + "/" + leftPad(date.getFullYear(), 4)
    let start_hour = date.getHours()
    let start_minute = date.getMinutes()
    if ((start_minute - interval_time) < 0) {
        start_hour -= 1
        start_minute = 60 + (start_minute - interval_time)
    } else {
        start_minute = start_minute - interval_time
    }
    let start_time = leftPad(start_hour, 2) + ":" + leftPad(start_minute, 2) + ":" + "00"
    let end_time = leftPad(date.getHours(), 2) + ":" + leftPad(date.getMinutes(), 2) + ":" + "00"
    ScheduleModel.find({ date: newDate })
        .exec()
        .then(res => {
            if (res.length > 0) {
                let result = "\n Segera lakukan jadwal dibawah !\n"
                let send = false
                res.map((item, index) => {
                    if (item.time >= start_time && item.time <= end_time) {
                        result += "\n-" + item.name + " pada waktu " + item.time
                        send = true
                    }
                })
                if (send) {
                    channel.send(result)
                }
            }
        })
        .catch(err => {
            msg.reply("Error to get schedule!")
        })
}