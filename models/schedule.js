const mongoose = require('mongoose')
const scheduleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: { type: String, require: true },
    date: { type: String, require: true },
    time: { type: String, require: true }
})
module.exports = mongoose.model("Schedule", scheduleSchema)