// Tours

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// Schema
var TourSchema = new Schema({
  raw: String,
  startDate: {
    range: Boolean,
    from: { type: Number, default: 0 },
    to: { type: Number, default: 0 }
  },
  endDate: {
    range: Boolean,
    from: { type: Number, default: 0 },
    to: { type: Number, default: 0 }
  },
  entry: Schema.Types.ObjectId,
  visits: [ ]
})

// Model
mongoose.model('Tour', TourSchema);
