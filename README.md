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

**N.B.** The default database path is `localhost/gt`, if you want to change this, you can modify the path in the [config/config.js](https://github.com/humanitiesplusdesign/grandtour-explorer/blob/master/config/config.js#L6) file.


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
	  noteReferences: [{
	  	index: Number,
	  	title: String
	  }],
	  gender: String,
	  isGroup: Boolean,
	  occupations: [{
	  	index: Number,
	  	title: String
	  }],
	  parents: String,
	  successions: [{
		title : String,
		year : String,
		relativeLong : String",
		relative : String,
		raw : String
	  }],
	  education: [{
		to: String,
		from: String,
		place: String,
		raw: String
	  }],
	  associations: [{
		info: String,
		groupName: String,
		group: String,
		raw: String
	  }],
	  references: [{
		refernce: String,
		raw: String
	  }],
	  birthDate : String,
	  deathDate: String,
	  flourishedStart: String,
	  flourishedEnd: String,
	  marriages : [{
		spouse: String,
		year: Number,
		sequence: Number
	  }],
	  tours: [Tour],
	  createdAt: {
	  	type: Date,
	  	default: Date.now
	  }
	}
```

Example:

```javascript
	{
		"_id" : ObjectId("5408b086e728c70000927025"),
		"name" : "Willoughby Bertie, 4th Earl Of Abingdon",
		"gender" : "male",
		"isGroup" : false,
		"parents" : null,
		"narrative" : "'Extremely underbred but warmly honest' (CP), Lord Abingdon went abroad for several years after leaving Oxford. Much of his time was spent in Switzerland where he met Voltaire, who later characterised him as 'Pair d'Angleterre / Qui voyageait tout excédé d'ennui / Uniquement pour sortir de chez lui, / Lequel avait pour charmer sa tristesse / Trois chiens courants, du punch, et sa maîtresse' (La Guerre Civile de Genève). Hennin, the French resident in Geneva, described Abingdon as 'ce jeune homme très pétulant', who had been taught nothing but hunting and music.1 Lord Abingdon appears to have spent about a year in Italy, spread over the first half of 1763 and the winter and early summer of 1764-5. In February 1763 he visited Nathaniel Dance in Rome,2 and it was presumably at this time that he sat to Batoni.3 In March he had been in Naples with Thomas Vivien,4 and in September 1763 Richard Kaye met him in Geneva.5 In September 1764 Abingdon arrived in Turin from Geneva. 'His Lordship comes here it seems very much on acc't of the Opera of w'ch he is very fond', wrote John Morgan, 'as he has an excellent taste for Music & plays himself very well on some Instruments.'6 In February 1765 he was in Rome with his brother Peregrine Bertie, staying near the Piazza di Spagna at Pio Dominico Coco's inn.7 Sir William Farington met them there in April, and again in May in Florence, where Abingdon had fallen ill with 'a dangerous disorder'; on 26 May he invited Farington to dine with him at the house which had been taken for him in the country, overlooking the Vale of Arno; 'in the Evening we had Musick', Farington noted in his journal, adding that 'Mr Wisce, a German' [C. Weiss of Mulhausen, Switzerland; d. 1790] had performed delightfully on the flute.8 By the end of July 1765 Abingdon was back in Geneva. He was in London in July 1768 when he married, and he became a member of Gibbon's Roman Club.9 It appears he returned to Italy at least once; in October 1770 père Nicolas, who owned a house on Mont Cenis, boasted one room had been occupied that summer by Lord A-g-n who had retired there from Florence during the heats of the summer to amuse himself for three months in the mountains with his dogs and horses.10 He spent three summers in this Alpine retreat.11",
		"notes" : "1 Voltaire, no.88. 2. Dance letters MSS (N. Dance, 6 Feb. 1763). 3. F. Russell, CL, 14 Jun. 1973, 1754. Clark/Bowron, p.375, as unverified. 4. Seafield MSS, GD248 49/2 (D. Crespin, 11 Mar. 1763). 5. Kaye letters MSS (4 Sep. 1763). 6. Morgan Jnl., 198. 7. Holroyd letters MSS (7 Feb. 1765).AVR SA, S.Lorenzo in Lucina. 8. Farington jnl.MSS (1 Apr., 24-6 May 1765). 9. Gibbon, Misc.Works, 1:200. 10. Miller, Letters, 1:52. 11. R.C. Hoare, Recollections Abroad 1785-7, 17-18. See Dutens, Memoirs, 1:226-8.",
		"birthDate" : "1740",
		"deathDate" : "1799",
		"flourishedStart" : null,
		"flourishedEnd" : null,
		"createdAt" : ISODate("2014-09-04T18:33:42.252Z"),
		"tours" : [
			{
				"visits" : [
					{
						"__v" : 0,
						"raw" : "Rome (Feb. 1763)",
						"sequence" : 0,
						"place" : "Rome",
						"entry" : ObjectId("5408b086e728c70000927025"),
						"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
						"tour" : ObjectId("5408b086e728c70000927026"),
						"_id" : ObjectId("5408b086e728c70000927027"),
						"visits" : [ ],
						"coordinates" : {
							"lat" : 41.8723889,
							"lng" : 12.4801802
						},
						"endDate" : {
							"raw" : "1763-02",
							"day" : 0,
							"month" : 2,
							"year" : 1763
						},
						"startDate" : {
							"raw" : "1763-02",
							"day" : 0,
							"month" : 2,
							"year" : 1763
						}
					},
					{
						"__v" : 0,
						"raw" : "Naples (Mar.) ",
						"sequence" : 1,
						"place" : "Naples",
						"entry" : ObjectId("5408b086e728c70000927025"),
						"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
						"tour" : ObjectId("5408b086e728c70000927026"),
						"_id" : ObjectId("5408b086e728c70000927028"),
						"visits" : [ ],
						"coordinates" : {
							"lat" : 40.8517746,
							"lng" : 14.2681244
						},
						"endDate" : {
							"raw" : "1763-03",
							"day" : 0,
							"month" : 3,
							"year" : 1763
						},
						"startDate" : {
							"raw" : "1763-03",
							"day" : 0,
							"month" : 3,
							"year" : 1763
						}
					},
					{
						"__v" : 0,
						"raw" : "Turin (Sep. 1764)",
						"sequence" : 2,
						"place" : "Turin",
						"entry" : ObjectId("5408b086e728c70000927025"),
						"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
						"tour" : ObjectId("5408b086e728c70000927026"),
						"_id" : ObjectId("5408b086e728c70000927029"),
						"visits" : [ ],
						"coordinates" : {
							"lat" : 45.070312,
							"lng" : 7.6868565
						},
						"endDate" : {
							"raw" : "1764-09",
							"day" : 0,
							"month" : 9,
							"year" : 1764
						},
						"startDate" : {
							"raw" : "1764-09",
							"day" : 0,
							"month" : 9,
							"year" : 1764
						}
					},
					{
						"__v" : 0,
						"raw" : "Rome (by 7 Feb. 1765-Apr.)",
						"sequence" : 0,
						"place" : "Rome",
						"entry" : ObjectId("5408b086e728c70000927025"),
						"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
						"tour" : ObjectId("5408b086e728c70000927026"),
						"_id" : ObjectId("5408b086e728c7000092702a"),
						"visits" : [ ],
						"coordinates" : {
							"lat" : 41.8723889,
							"lng" : 12.4801802
						},
						"endDate" : {
							"raw" : "1765-04",
							"day" : 0,
							"month" : 4,
							"year" : 1765
						},
						"startDate" : {
							"raw" : "1765-02-07",
							"day" : 7,
							"month" : 2,
							"year" : 1765
						}
					},
					{
						"__v" : 0,
						"raw" : "Florence (by 26 May) ",
						"sequence" : 1,
						"place" : "Florence",
						"entry" : ObjectId("5408b086e728c70000927025"),
						"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
						"tour" : ObjectId("5408b086e728c70000927026"),
						"_id" : ObjectId("5408b086e728c7000092702b"),
						"visits" : [ ],
						"coordinates" : {
							"lat" : 43.7710332,
							"lng" : 11.2480006
						},
						"endDate" : {
							"raw" : "1765-05-26",
							"day" : 26,
							"month" : 5,
							"year" : 1765
						},
						"startDate" : {
							"raw" : "1765-05-26",
							"day" : 26,
							"month" : 5,
							"year" : 1765
						}
					}
				],
				"endDate" : {
					"range" : false,
					"to" : 1765,
					"from" : 1765
				},
				"startDate" : {
					"range" : false,
					"to" : 1763,
					"from" : 1763
				}
			}
		],
		"marriages" : [
			{
				"spouse" : "Charlotte Warren",
				"year" : 1768,
				"sequence" : NaN
			}
		],
		"references" : [ ],
		"associations" : [ ],
		"education" : [
			{
				"to" : null,
				"from" : null,
				"place" : "Westminster",
				"raw" : "educ. Westminster and Magd. Oxf. 1759"
			},
			{
				"to" : null,
				"from" : "1759",
				"place" : "Magd. Oxf.",
				"raw" : "educ. Westminster and Magd. Oxf. 1759"
			}
		],
		"successions" : [
			{
				"title" : "4th E",
				"year" : "1760",
				"relativeLong" : "father",
				"relative" : "fa.",
				"raw" : "suc. fa. 1760 as 4th E"
			}
		],
		"occupations" : [ ],
		"noteReferences" : [
			{
				"index" : 98,
				"title" : "CL"
			},
			{
				"index" : 394,
				"title" : "Miller, Letters"
			},
			{
				"index" : 231,
				"title" : "Morgan Jnl."
			},
			{
				"index" : 140,
				"title" : "Seafield mss"
			}
		],
		"bio" : [
			"ABINGDON, WILLOUGHBY BERTIE, 4TH EARL OF (1740-99), 1st surv. s. of 3rd E. of Abingdon",
			"educ. Westminster and Magd. Oxf. 1759",
			"suc. fa. 1760 as 4th E",
			"m. 1768 Charlotte Warren. "
		],
		"aliases" : [
			"Willoughby Bertie, 4th Earl Of Abingdon",
			"Willoughby Bertie Abingdon, 4th Earl Of",
			"Willoughby Bertie",
			"4th Earl Of Abingdon",
			"Abingdon, Willoughby Bertie, 4th Earl Of",
			"Willoughby Bertie Abingdon",
			"Abingdon, Willoughby Bertie"
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
  visits: [Visit]
}
```

Example

```javascript
	{
		"visits" : [
			{
				"__v" : 0,
				"raw" : "Rome (Feb. 1763)",
				"sequence" : 0,
				"place" : "Rome",
				"entry" : ObjectId("5408b086e728c70000927025"),
				"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
				"tour" : ObjectId("5408b086e728c70000927026"),
				"_id" : ObjectId("5408b086e728c70000927027"),
				"visits" : [ ],
				"coordinates" : {
					"lat" : 41.8723889,
					"lng" : 12.4801802
				},
				"endDate" : {
					"raw" : "1763-02",
					"day" : 0,
					"month" : 2,
					"year" : 1763
				},
				"startDate" : {
					"raw" : "1763-02",
					"day" : 0,
					"month" : 2,
					"year" : 1763
				}
			},
			{
				"__v" : 0,
				"raw" : "Naples (Mar.) ",
				"sequence" : 1,
				"place" : "Naples",
				"entry" : ObjectId("5408b086e728c70000927025"),
				"entryName" : "Willoughby Bertie, 4th Earl Of Abingdon",
				"tour" : ObjectId("5408b086e728c70000927026"),
				"_id" : ObjectId("5408b086e728c70000927028"),
				"visits" : [ ],
				"coordinates" : {
					"lat" : 40.8517746,
					"lng" : 14.2681244
				},
				"endDate" : {
					"raw" : "1763-03",
					"day" : 0,
					"month" : 3,
					"year" : 1763
				},
				"startDate" : {
					"raw" : "1763-03",
					"day" : 0,
					"month" : 3,
					"year" : 1763
				}
			}
		],
		"endDate" : {
			"range" : false,
			"to" : 1765,
			"from" : 1765
		},
		"startDate" : {
			"range" : false,
			"to" : 1763,
			"from" : 1763
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
  visits: [Visit] 
}
```

Example

```javascript
	{
		"__v" : 0,
		"raw" : "Venice (10 Sep.: 'Giovanni Adam di Andrea'; ASV IS 759)",
		"sequence" : 0,
		"place" : "Venice",
		"entry" : ObjectId("5408b086e728c70000927067"),
		"entryName" : "John Adam",
		"tour" : ObjectId("5408b086e728c70000927068"),
		"_id" : ObjectId("5408b086e728c70000927069"),
		"visits" : [ ],
		"coordinates" : {
			"lat" : 45.4408474,
			"lng" : 12.3155151
		},
		"endDate" : {
			"raw" : "1767-09-10",
			"day" : 10,
			"month" : 9,
			"year" : 1767
		},
		"startDate" : {
			"raw" : "1767-09-10",
			"day" : 10,
			"month" : 9,
			"year" : 1767
		}
	}
```