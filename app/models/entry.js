// Entry Model

var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

// Schema
var EntrySchema = new Schema({
	// Name of the entry (Standardized)
  name: String,
  aliases: [String],
  // Biographical tokens
  bio: [String],
  narrative: String,
  notes: String,
  noteReferences: [],
  gender: String,
  isGroup: Boolean,
  occupations: [],
  parents: String,
  successions: [],
  education: [],
  associations: [],
  references: [],
  birthDate : String,
  deathDate: String,
  flourishedStart: String,
  flourishedEnd: String,
  marriages : [],
  tours: [],
  createdAt: {
  	type: Date,
  	default: Date.now
  }
});

// Model
mongoose.model('Entry', EntrySchema);
