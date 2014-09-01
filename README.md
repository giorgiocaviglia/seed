##Instructions

###Dependencies

- [Node.js](http://nodejs.org/download/)
- [MongoDB](http://www.mongodb.org/downloads)

###Installation

- Clone this repository on your machine:

```sh
$ git clone https://github.com/humanitiesplusdesign/grandtour-explorer.git
```

- Make sure MongoDB is running somewhere. As a suggestion, you can run MongoDB as daemon within the `/grandtour-explorer` directory. In this way the data will stay on the same folder:
	
```sh
$ cd grandtour-explorer
$ mkdir data
$ mongod --dbpath data
```

**N.B.** The default database path is `localhost/gt`, if you want to change this, you can modify the path in the [server.js](https://github.com/humanitiesplusdesign/grandtour-explorer/blob/master/server.js#L43) file.


- Now install the Node dependencies and run the app. Open another shell (do not close the MongoDB daemon, it needs to be running):

```sh
$ npm install
$ npm start
```
		
Now point your browser to [http://localhost:3000/](http://localhost:3000/).

###Running the parser and populate the DB

At this point you are ready to run the parser and populate the database. To do so, point to [http://localhost:3000/api/collection/reset](http://localhost:3000/api/collection/reset). You need to do this only once, but please, notice that **every time you will run the parser, the database will be erased and re-generated.**

##Data Model

There are three collections in the database:

####Entries

Each Entry represents a Dictionary entry (~Person) with information parsed so far. 

Model
```javascript
{
  name: String,
  aliases: [String],
  bio: [String],
  narrative: String,
  notes: String,
  gender: String,
  isGroup: Boolean,
  occupations: [String],
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
}
```

Example:

```javascript
{
	"_id" : ObjectId("53ec1d6c670140013533f0c1"),
	"name" : "John Dyke Acland",
	"parents" : "Sir Thomas Dyke Acland, 7th Bt.",
	"narrative" : "Acland set out from London with Thomas Vivien,1 and they were reported in Florence on 5 February 1767;2 'Giovanni Steland Inglese di Tomaso' and 'Tomaso Vivien' arrived in Venice on 20 February 1767.3 In May Acland was met in Paris by his uncle.  [He could not have travelled with Thomas Townshend (who was voting in Parliament during the period Acland was abroad), with whom he is shown in Reynolds's Young Archers (Tatton Heirlooms)]",
	"notes" : "1. Acland's uncle's acct.bk.; Somerset RO, DD/AH 21/3. 2. Gazz.Tosc., 14 Feb. 1767. 3. ASV IS 759 (noted as 1766 in RBF, evidently in error). ",
	"birthDate" : "1746",
	"deathDate" : "1778",
	"flourishedStart" : null,
	"flourishedEnd" : null,
	"updated" : ISODate("2014-08-14T02:22:36.760Z"),
	"tours" : [
		{
			"__v" : 0,
			"raw" : "1767 [dep. London 7 Oct. 1766] Florence (by 5 Feb. 1767), Venice (20 Feb.) [Paris, May]",
			"entry" : ObjectId("53ec1d6c670140013533f0c1"),
			"_id" : ObjectId("53ec1d6c670140013533f0c2"),
			"travels" : [
				{
					"__v" : 0,
					"raw" : "Florence (by 5 Feb. 1767)",
					"sequence" : 0,
					"place" : "Florence",
					"entry" : ObjectId("53ec1d6c670140013533f0c1"),
					"entryName" : "John Dyke Acland",
					"tour" : ObjectId("53ec1d6c670140013533f0c2"),
					"_id" : ObjectId("53ec1d6c670140013533f0c3"),
					"visits" : [ ],
					"coordinates" : {
						"lat" : 43.7710332,
						"lng" : 11.2480006
					},
					"endDate" : {
						"raw" : "1767-02-05",
						"day" : 5,
						"month" : 2,
						"year" : 1767
					},
					"startDate" : {
						"raw" : "1767-02-05",
						"day" : 5,
						"month" : 2,
						"year" : 1767
					}
				},
				{
					"__v" : 0,
					"raw" : "Venice (20 Feb.) ",
					"sequence" : 1,
					"place" : "Venice",
					"entry" : ObjectId("53ec1d6c670140013533f0c1"),
					"entryName" : "John Dyke Acland",
					"tour" : ObjectId("53ec1d6c670140013533f0c2"),
					"_id" : ObjectId("53ec1d6c670140013533f0c4"),
					"visits" : [ ],
					"coordinates" : {
						"lat" : 45.4408474,
						"lng" : 12.3155151
					},
					"endDate" : {
						"raw" : "1767-02-20",
						"day" : 20,
						"month" : 2,
						"year" : 1767
					},
					"startDate" : {
						"raw" : "1767-02-20",
						"day" : 20,
						"month" : 2,
						"year" : 1767
					}
				}
			],
			"endDate" : {
				"range" : false,
				"to" : 1767,
				"from" : 1767
			},
			"startDate" : {
				"range" : false,
				"to" : 1767,
				"from" : 1767
			}
		}
	],
	"marriages" : [
		{
			"spouse" : "Ldy. Christiana Harriet Caroline Fox Strangways, dau. of 1st E. of Ilchester",
			"year" : 1770,
			"sequence" : 1
		}
	],
	"occupations" : [ ],
	"bio" : [
		"ACLAND, JOHN DYKE (1746-78), e. s. of Sir Thomas Dyke Acland, 7th Bt.",
		"Univ.Coll. Oxf. 1765",
		"m. 1770 Ldy. Christiana Harriet Caroline Fox Strangways, dau. of 1st E. of Ilchester",
		"army officer, ensign 33 Ft. 1774, maj. 20 Ft. 1775",
		"MP 1774-8. "
	],
	"__v" : 0
}
```

####Tours

A Tour represents a Grand Tour made by the person in the entry. A Grand Tour consists in a (continuos) time period spent in Italy, visiting one or more locations. An entry could have accomplished more than one Grand Tour, meaning they returned to Italy many times.

Model

```javascript
{
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
  travels: [Travel]
}
```

Example
```javascript
{
	"__v" : 0,
	"raw" : "1767 [dep. London 7 Oct. 1766] Florence (by 5 Feb. 1767), Venice (20 Feb.) [Paris, May]",
	"entry" : ObjectId("53ec1d6c670140013533f0c1"),
	"_id" : ObjectId("53ec1d6c670140013533f0c2"),
	"travels" : [
		{
			"__v" : 0,
			"raw" : "Florence (by 5 Feb. 1767)",
			"sequence" : 0,
			"place" : "Florence",
			"entry" : ObjectId("53ec1d6c670140013533f0c1"),
			"entryName" : "John Dyke Acland",
			"tour" : ObjectId("53ec1d6c670140013533f0c2"),
			"_id" : ObjectId("53ec1d6c670140013533f0c3"),
			"visits" : [ ],
			"coordinates" : {
				"lat" : 43.7710332,
				"lng" : 11.2480006
			},
			"endDate" : {
				"raw" : "1767-02-05",
				"day" : 5,
				"month" : 2,
				"year" : 1767
			},
			"startDate" : {
				"raw" : "1767-02-05",
				"day" : 5,
				"month" : 2,
				"year" : 1767
			}
		},
		{
			"__v" : 0,
			"raw" : "Venice (20 Feb.) ",
			"sequence" : 1,
			"place" : "Venice",
			"entry" : ObjectId("53ec1d6c670140013533f0c1"),
			"entryName" : "John Dyke Acland",
			"tour" : ObjectId("53ec1d6c670140013533f0c2"),
			"_id" : ObjectId("53ec1d6c670140013533f0c4"),
			"visits" : [ ],
			"coordinates" : {
				"lat" : 45.4408474,
				"lng" : 12.3155151
			},
			"endDate" : {
				"raw" : "1767-02-20",
				"day" : 20,
				"month" : 2,
				"year" : 1767
			},
			"startDate" : {
				"raw" : "1767-02-20",
				"day" : 20,
				"month" : 2,
				"year" : 1767
			}
		}
	],
	"endDate" : {
		"range" : false,
		"to" : 1767,
		"from" : 1767
	},
	"startDate" : {
		"range" : false,
		"to" : 1767,
		"from" : 1767
	}
}
```


####Visits

A Visit represents a location visited by the Entry. Visits can also be nested, meaning that the Entry made some visits while staying in a location. This nested visits can be found in the `.visits` property.

Model
```javascript
{
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
  visits: [Travel] 
})
```

Example
```javascript
{
	"__v" : 0,
	"raw" : "Venice (20 Feb.) ",
	"sequence" : 1,
	"place" : "Venice",
	"entry" : ObjectId("53ec1d6c670140013533f0c1"),
	"entryName" : "John Dyke Acland",
	"tour" : ObjectId("53ec1d6c670140013533f0c2"),
	"_id" : ObjectId("53ec1d6c670140013533f0c4"),
	"visits" : [ ],
	"coordinates" : {
		"lat" : 45.4408474,
		"lng" : 12.3155151
	},
	"endDate" : {
		"raw" : "1767-02-20",
		"day" : 20,
		"month" : 2,
		"year" : 1767
	},
	"startDate" : {
		"raw" : "1767-02-20",
		"day" : 20,
		"month" : 2,
		"year" : 1767
	}
}
```
