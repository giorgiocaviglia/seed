// Visits

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// Schema
var VisitSchema = new Schema({
  raw: String,
  sequence: Number,
  startDate: {
    raw: String,
    year: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    day: { type: Number, default: 0 }
  },
  endDate: {
    raw: String,
    year: { type: Number, default: 0 },
    month: { type: Number, default: 0 },
    day: { type: Number, default: 0 }
  },
  place: String,
  coordinates: {
    lat: Number,
    lng: Number
  },
  tour: Schema.Types.ObjectId,
  entry: Schema.Types.ObjectId,
  entryName: String,
  parent: Schema.Types.ObjectId,
  visits: [ ] 
})

// Model
mongoose.model('Visit', VisitSchema);
