// Parsing the text
var config = require('../../config/config')
	, fs = require('fs')
	,	d3 = require('d3')
	,	moment = require('moment')
	,	mongoose = require('mongoose')

  , Entry = mongoose.model('Entry')
	, Tour = mongoose.model('Tour')
	, Visit = mongoose.model('Visit')
	, utils = require('../../lib/utils')
	
	// globals
	,	coordinates = {}
	,	abbreviations = {}
	,	educations = {}
  , titles = []

// coordinates
fs.readFile( config.root + '/app/data/coordinates.txt', function (err, data) {

  d3.tsv.parse(data.toString(), function(d){
    d.name = d.name.split(", Italy")[0];
    coordinates[d.name] = {
      lat: parseFloat(d.latitude),
      lng: parseFloat(d.longitude)
    }
    return d;
  });
})

// abbreviations
fs.readFile( config.root + '/app/data/abbreviations.txt', function (err, data) {
  d3.tsv.parse(data.toString(), function(d){
    abbreviations[d.key] = d.value;
    return d;
  });
})

// titles
fs.readFile( config.root + '/app/data/titles.txt', function (err, data) {
  d3.tsv.parse(data.toString(), function(d){
    titles.push(d.Title.trim());
  });
})

// parsing utilities 
function parseBioDates(string, bioDatesRegExp) {

  bioDatesRegExp = bioDatesRegExp || new RegExp(/[A-Z\]\)]\.?\s(\(.*[0-9]{4,}.*\))/);

  var bornRegExp = new RegExp(/b\./),
      deadRegExp = new RegExp(/d\./),
      flourishedRegExp = new RegExp(/fl\./),
      periodRegExp = new RegExp(/-/),
      dates = string.match(bioDatesRegExp.source),
      circa = false,
      period = false,
      born = false,
      dead = false,
      flourished = false,
      start = null,
      end = null;

  if (!dates) return null;

  dates = dates[0].split(/\((?![A-Z'])/)[1].split(/\)/)[0];

  if(dates.match(/c\./)) circa = true;

  dates = dates.replace(/(^|\(-\s)*c\./,"");

  born = bornRegExp.test(dates);
  dead = deadRegExp.test(dates);
  period = periodRegExp.test(dates);
  flourished = flourishedRegExp.test(dates);

  var d = {};
  if (circa) d.circa = circa;

  if (flourished && dead) {
    start = dates.match(/(fl\.\s?[0-9]{4})/gi)[0].replace(/[^\d]/g, "");
    end = dates.match(/(d\.\s?[0-9]{4})/gi)[0].replace(/[^\d]/g, "");
    d = { dead: end, flourishedStart : start };
    return d;
  } else if (period) {
    start = dates.split('-')[0].replace(/[^\d]/g, ""),
    end = dates.split('-')[1].replace(/[^\d]/g, "");
    end = start.substring(0,4 - end.length) + end;
    if (flourished) {
      d.flourishedStart = start;
      d.flourishedEnd = end;
    }
    else {
      d.born = start;
      d.dead = end
    }
    return d;
  }

  if (born) {
    d.born = dates.replace(/[^\d]/g, "");
  }

  if (dead) {
    d.dead = dates.replace(/[^\d]/g, "");
  }

  if (!dead && !born) return null;

  return d;
  
}



function parseName(name){

  var re = new RegExp(/[A-z0-9,\s\.\-(and)]*/);

  name = re.exec(name)[0];

  if (name.indexOf("(") != -1) name = name.split("(")[0];
  if (name.indexOf(", see") != -1) name = name.split(", see")[0];
  name = name.replace(/\s$/g,"");

  var pieces = name.split(",");
  name = pieces.length > 1 && pieces[1].replace(/^\s/,"").charAt(0) == pieces[1].replace(/^\s/,"").toUpperCase().charAt(0) ? (pieces[1] + " " + pieces[0]).replace(/^\s/,"") : pieces[0].replace(/^\s/,"");

  return name;

}

function parseAlias(name){

  var re = new RegExp(/[A-z0-9,\s\.'\-(and)]*/);
  name = re.exec(name)[0];

  var aliases = [];
  // Nobles???
  var noble = name.replace(/\((.*)?\)\s/,"").match(/^([A-z-]+)\,\s([A-Z-\s]+)\,\s([A-Z0-9-\s\.]{3,})(of\s(.*)?)?/);

  if (noble) {

		aliases.push(noble[2] + ", " + noble[3].trim() + " " + noble[1]);
		aliases.push(noble[2] + " " + noble[1] + ", " + noble[3].trim());
		aliases.push(noble[2]);
		aliases.push(noble[3].trim() + " " + noble[1]);
		aliases.push(noble[1] + ", " + noble[2] + ", " + noble[3].trim());
  }

  var oldName = name;

  if (name.indexOf("(") != -1) name = name.split("(")[0];
  if (name.indexOf(", see") != -1) name = name.split(", see")[0];
  name = name.replace(/\s$/g,"");

  var pieces = name.split(",");
  if (pieces.length > 1 && pieces[1].replace(/^\s/,"").charAt(0) == pieces[1].replace(/^\s/,"").toUpperCase().charAt(0)) {
  	aliases.push((pieces[1] + " " + pieces[0]).replace(/^\s/,""));
  	aliases.push((pieces[0] + "," + pieces[1]).replace(/^\s/,""));
  }
  else aliases.push(pieces[0].replace(/^\s/,""));

  return aliases.map(function (d){ return d.toProperCase(); });
}


function parseCityDates(date, year) {

  if (!date) return [null,null,year];

  // let's remove those by
  date = date.replace(/^\-/,"")
             .replace(/\-$/,"")
             .replace(/(\bc.\b)/,"")
             //.replace(/\//,"-")
             .replace(/(\s?(by)\s?)/,"")
             .replace(/(\s?(mid-)\s?)/,"")
             .replace(/(\s?(early)\s?)/,"")
             .replace(/(\s?(late)\s?)/,"");

  // let's take before : and ;
  date = date.split(/;|:/)[0];

  var single = new RegExp(/^\s?(\d{1,2}\s[A-z]{1,3})\.?\s?(\d{4})?$/),
      period = new RegExp(/^\s?(\d{1,2}\s[A-z]{1,3})\.?(\s\d{4})?\-(\d{1,2}\s[A-z]{1,3})(\s\d{4})?/),
      periodMonth = new RegExp(/^\s?(\d{1,2}\-\d{1,2})\s[A-z]{1,3}/),
      periodMonthDay = new RegExp(/^\s?(\d{1,2})?\s?([A-Z]{1}[a-z]{2})\.?\s?(\d{4})?\s?\-\s?(\d{1,2})?\s?([A-Z]{1}[a-z]{2})?\.?/),
      month = new RegExp(/^\s?([A-Z]{1}[a-z]{2})\.?\s?(\d{4})?$/),
      singleYear = new RegExp(/^\d{4}$/),
      onlyYear = new RegExp(/^\s?\d{4}\-\s?\d{1,4}\s?$/),
      hasYear = new RegExp(/\d{4}/)

  // single date (e.g. 5 Jun.)
  if (single.test(date)) {
    // let's see if there is the year too...
    if (hasYear.test(date)) return [moment(date).format("YYYY-MM-DD"),moment(date).format("YYYY-MM-DD"), moment(date).format("YYYY")]
    else return [moment(date + " " + year).format("YYYY-MM-DD"),moment(date + " " + year).format("YYYY-MM-DD"), year]
  }
  
  // a whole month
  else if (month.test(date)) {
    date = date.replace(/\./,"");
    var y = date.match(/\d{4}/) ? date.match(/\d{4}/)[0] : year
    if (hasYear.test(date)) return [moment(date).format("YYYY-MM"),moment(date).format("YYYY-MM"),y]
    else return [moment(date + " " + y).format("YYYY-MM"),moment(date + " " + y).format("YYYY-MM"),year]
  }

  // only the year
  else if (singleYear.test(date)){
    var y = date.match(/^\d{4}$/)[0];
    return [y,y,y]

  }

  else if (period.test(date)) {

    var s = date.split("-")[0].replace(/\./,""),
        e = date.split("-")[1].replace(/\./,""),
        sy = s.match(/\d{4}/) ? s.match(/\d{4}/)[0] : year,
        ey = e.match(/\d{4}/) ? e.match(/\d{4}/)[0] : year

    var start = hasYear.test(s) ? moment(s).format("YYYY-MM-DD") : moment(s+"-"+sy).format("YYYY-MM-DD"),
        end = hasYear.test(e) ? moment(e).format("YYYY-MM-DD") : moment(e+"-"+ey).format("YYYY-MM-DD");

    return [start,end,ey]

  }
  
  // if period within same month
  else if (periodMonth.test(date)) {
    var s = date.split('-')[0],
        e = date.split('-')[1].match(/^\d{1,2}/)[0],
        m = date.split('-')[1].match(/[A-z]{3}/)[0],
        y = date.match(/\d{4}/) ? date.match(/\d{4}/)[0] : year

    //let's see
    e = s.substring(0,2-e.length) + e;

    return [moment(s+"-"+m+"-"+y).format("YYYY-MM-DD"), moment(e+"-"+m+"-"+y).format("YYYY-MM-DD"), y]

  }
  
  // if period across months and/or year
  else if (periodMonthDay.test(date)) {

    date = date.replace(/^\s+|\s+$/g, '');
    var s = date.split('-')[0].replace(/^\s+|\s+$/g, ''),
        e = date.split('-')[1].replace(/^\s+|\s+$/g, ''),
        sd = s.match(/^\d{1,2}\s/) ? s.match(/^\d{1,2}\s/)[0].replace(/^\s+|\s+$/g, '') : null,
        ed = e.match(/^\d{1,2}\s/) ? e.match(/^\d{1,2}\s/)[0].replace(/^\s+|\s+$/g, '') : null,
        sm = s.match(/[A-Z]{1}[a-z]{2}\.?/) ? s.match(/[A-Z]{1}[a-z]{2}\.?/)[0].replace(/\./,"").replace(/^\s+|\s+$/g, '') : null,
        em = e.match(/[A-Z]{1}[a-z]{2}\.?/) ? e.match(/[A-Z]{1}[a-z]{2}\.?/)[0].replace(/\./,"").replace(/^\s+|\s+$/g, '') : null,
        sy = s.match(/\d{4}/) ? s.match(/\d{4}/)[0] : null,
        ey = e.match(/\d{4}/) ? e.match(/\d{4}/)[0] : sy ? sy : year
        if (!sy) sy = ey;

    var start, end;
    if (!sd && !sm) start = sy;
    else if (!sd) start = moment(sm+"-"+sy).format("YYYY-MM");
    else start = moment(sd+"-"+sm+"-"+sy).format("YYYY-MM-DD");
    
    if (!sd && !em) end = ey;
    else if (!ed) end = moment(em+"-"+ey).format("YYYY-MM")
    else end = moment(ed+"-"+em+"-"+ey).format("YYYY-MM-DD")
    
    return [start,end,ey];
  }

  else if (onlyYear.test(date)) {
    var start = date.split("-")[0].replace(/^\s+|\s+$/g, ''),
        end = date.split("-")[1].replace(/^\s+|\s+$/g, '');
    end = start.substring(0,4-end.length) + end;

    return [start,end,end];

  }

  //else console.log(date)

  return [null,null,year];

}

String.prototype.toProperCase = function () {
  return this.replace(/([^\W_]+[^\s-]*) */g, function(txt){ return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });  
};



function parseOccupations(){

}


// Parsing the text

exports.reset = function (req, res) {


  // Dropping the collections
  Entry.collection.drop();
  Tour.collection.drop();
  Visit.collection.drop();

  // reading the dictionary file
  fs.readFile( config.root + '/app/data/combined.txt', function (err, data) {

    // in case something goes wrong...
    if (err) {
      res.json({ error : err }); 
    }

    // let's split the new lines
    var entries = data.toString().split(/\r+(?=[A-Z\s'\-]{4,}(\[|,|\s|\r+))/).filter(function (d){ return d.length > 2; })

    var tourRegExp = new RegExp(/^(c.)?\[?\-?\d{4}\-?/),
        bioRegExp = new RegExp(/^[A-Z\s']{3,}/),
        noteRegExp = new RegExp(/^\s?[0-9]\.?\s/);

    // processing each entry
    entries = entries.map(function (entry, indexEntry){

      var bio = [],
          tours = [],
          notes = [],
          narration = [],
          occupations = [],
          hasTours = false,
          parts = entry.split(/\r/)//.filter(function (d){ return d.length > 1; })

      for (var part in parts) {
        if (tourRegExp.test(part)) {
          hasTours = true;
          break;
        }
      }

      var gender;

      var last = "";

      // processing each entry's part
      parts.forEach(function (part){

        if ( (noteRegExp.test(part) || notes.length > 0) && (last == "note" || last == "narrative") ) {
          notes.push(part);
          last = "note";
        }
        else if (noteRegExp.test(part) && last == "tour") {
          tours[tours.length-1] += part;
          last = "tour";
        }
        else if (tourRegExp.test(part)) {
          tours.push(part);
          last = "tour";
        }
        else if (bioRegExp.test(part) && tours.length==0) {
          bio.push(part);
          last = "bio";
        }
        else if (part.match(/^[a-z]/) && last != "narrative") {
          tours[tours.length-1] += part;
          last = "tour";
        }
        else if (part.length > 1){
          narration.push(part);
          last = "narrative"
        }
      
      })

      bio = bio.join("");
      var bioParts = bio.split(/;\s/g);

      // ===========
      // Occupations
      // ===========

      var hasOccupation = bioParts[0].match(/,(,?\s[a-z\-]+\s?)+(\sand\s|\sof\s[A-Z]{1}[a-z]+|,|$|\.\s*$)(\s?[a-z]{4,})*/);
      if (hasOccupation) occupations = hasOccupation[0].replace(/^,\s+/,"").split(/(,\s+|\sand\s)/);
      occupations = occupations.map(function (occupation){
        return occupation.replace(/^\s|,|\.|^a\s|\s$/g,"");//.toProperCase();
      }).filter(function (occupation){
        return occupation != "and" && occupation != "";
      })  

      bio = bio.split(/;\s/g);



      // =============
      // Relationships
      // =============
      
      var rel = [];

      bio.forEach(function (b, bindex){

       /* <CHILD> = [s.|dau.|daus.]
          [<N>|<ORDER>] [surv.] [[and ]legit.|[and ]illeg.] [[and ]posth.]
          <CHILD> [[and ]h.|heir|coh.|coheir] [[and ]pupil] of
          <NITLE> [[and <NITLE>]|[[(]by his <N> wife|by his <N> w.|by <NITLE>[)]]]
        */
        if (bindex==bio.length-1) b = b.replace(/\.$/,"")
        var relation = b.match(/([0-9]{1,2}[a-z]{2}|o(?:\.|\?)|e(?:\.|\?)|yr(?:\.|\?)|yst(?:\.|\?))?\s?(surv\.\s?)?(?:(?:and\s)?(legit(?:\.|\?)|illeg(?:\.|\?))\s)?((?:and\s)?posth\.\s)?(s\.|dau\.|daus\.)\s(?:(?:and\s)?(h\.|heir|coh\.|coheir)\s)?(?:(?:and\s)?(pupil)(?:\.|\?)\s?)?of\s(.*)?/);
        var isSecondary = b.match(/^m\./);

        if (relation && !isSecondary) {

        	// sniffing gender
        	gender = relation[5] == 's.' ? 'male' : 'female';

          rel = {
          	raw: relation[0],
          	order: relation[1],
          	surviving: relation[2] == "surv. ",
          	illegitimate: relation[3] == "illeg.",
          	posthumous: relation[4] == 'posth. ',
          	heir: relation[6] != undefined,
          	pupil: relation[7] != undefined,
          	parents: relation[8]
          }
        }

      })

			// Are groups?



      // ===========
      // Successions
      // ===========

      // suc. [his|her] <RELATIVE> [<NITLE>] [<YEAR>] [as <NITLE>]
      
      var suc = [];

      bio.forEach(function (b){

        var succession = b.match(/suc\.\s(his\s|her\s)?(.*?)(?=(\(?[0-9-\?]{4,}\)?)|(\sas\s(?:(.*)?)))(\(?[0-9-\?]{4,}\)?)?(\sas\s(?:(.*)?))?/); //?(\S)?\s([\(0-9-\)])?(\sas\s(.*)?)?
        var isSecondary = b.match(/^m\./);

        if (succession && !isSecondary) {
        	// sniff gender hihihi

          suc.push({
          	raw: succession[0],
          	relative: succession[2].trim(),
          	relativeLong: abbreviations[succession[2].trim()] || null,
          	year: succession[3],
          	title: succession[8]
          });
        }

      })

      //if (suc.length) console.log(suc);

      // ===========
      // Marriages
      // ===========
      
      // m. [<n>] [<YEAR>] [as his <N> wife|as his <N> w.] [[her|his] <RELATIVE>] [<NITLE>] [(<BIODATES>)]

      var mar = [];

      bio.forEach(function (b, bindex){

        var ms = b.match(/^m\.\s(.*)?/);
        
        if (ms) {

          if (bindex==bio.length-1) ms[1] = ms[1].replace(/\.\s*$/,"")
          mar = ms[1].split(/(?:^|,\s)(?:[0-9]{1}\s)/g);

          mar = mar.filter(function (d){ return d.length; }).map(function (d,i){
            
            //var single = d.match(/(?:\(?(?:c\.)?([0-9]{4})?\??\)?,?\s)?(\(?as\shis\s([0-9]{1}[a-z]{2})\s(wife|w\.)\)?,?\s)?((?:his|her)\s(.*?(?=[A-Z])))?(.*)?/);
            
            var marriageRegExp = new RegExp((
              '(?:(before|after)\\s)?' +
              '(?:\\(?(?:c\\.)?([0-9]{4})?\\??\\)?,?\\s)?' +
              '(?:(?:at|in)\\s([A-z0-9]*)?\\s)?' +
              '(\\(?as\\shis\\s([0-9]{1}[a-z]{2})\\s(wife|w\\.)\\)?,?\\s)?' +
              '((?:his|her)\\s(.*?(?=[A-Z])))?' +
              '(.*)?' // NITLE
              ),"gi")


            var single =  marriageRegExp.exec(d);
            var spouseName = single[9].split(/\,/)[0];

            //if (nitleRegExp.exec(single[9])) console.log(nitleRegExp.exec(single[9]))

            /*
            [<n>]
            [before|after]
            [<YEAR>][at <PLACE>]
            [as his <N> wife|as his <N> w.]
            [[her|his] <RELATIVE>]
            [<NITLE>]
            [his pupil][later, <NITLE>]
            [(<BIODATES>)]
            [who was cr. <NITLE> in <YEAR>][,]
            [[<N>] [ORD.] <RELATIVE> of <NITLE>]
            [([<N>] [ORD.][<RELATIVE> of <NITLE>])]
            [,|and ][wid. of <NITLE>]
            [,|and ][h. of her|his <RELATIVE>, <NITLE>]
            [,|and] [div. w. of <NITLE>]
            [, ][div.|sep.|diss.] [<YEAR>]
            */

            //parseBioDates(bio[0])
            
            return {
            	raw: d,
              sequence : i+1,
              year : single[2],
              relative : single[7],
              spouse : spouseName.replace(/\s*\([^)]*\)/,""),
              spouseDates : parseBioDates(spouseName, new RegExp(/(\(.*[0-9]{4,}.*\))/))
            };
          })

        }


      })

			// Education

			var educ = [];

			bio.forEach(function (b){
				if(!b.match(/^(?:\s)?educ\.(.*)?/)) return;
				educ = b.match(/^(?:\s)?(educ\.)\s*(.*)?/)[2];
				educ = educ.split(/(?:\,* and |\,\s*)(?![0-9])/);

				educ = educ.map(function (e){
					var place = e.trim(),
							from = null,
							to = null,
							extra = null,
							pieces = e.match(/(.*)?(?=[0-9]{4})([0-9]{4})((?:-)([0-9]{1,4}))?/);

					//if (pieces && pieces[1].match(/ and /)) console.log(pieces[1]);

					if (pieces) {
						place = pieces[1].trim();
						from = pieces[2];
						to = pieces[4] ? pieces[2].substring(0,4-pieces[4].length) + pieces[4] : null
					}

					return {
						raw: b,
						place: place,
						from: from,
						to: to
					}
				})

			})


			// Re-check education on other fields...


			// Associations

			var associations = [];

			bio.forEach(function (b){

					d3.keys(abbreviations).forEach(function (a){

						var abbreviationRegExp = new RegExp(
              	'^(' +
              	a.replace(/\.$/,"").replace(/\[/,"\\[").replace(/\]/,"\\]") +
              	'(?:\\s|$))' +
              	'(.*)?'
              )

            var abbr =  abbreviationRegExp.exec(b.replace(/\.$/,""));

            if (abbr) {

            	associations.push({
            		raw: abbr[0],
            		group: abbr[1].trim(),
            		groupName: abbreviations[a],
            		info: abbr[2]
            	})

            }

					})

			})

			// References

			var references = [];

			// first one from the name
			var fromName = bio[0].match(/\,\ssee\s(.*)?/);

			if (fromName) {
				references.push({
					raw: fromName[0],
					reference: fromName[1].trim()
				})
			}

			// the others...
			bio.forEach(function (b){
				var see = b.match(/^see\s(.*)?/);
				if (see) {
					references.push({
						raw: see[0],
						reference: see[1].trim()
					})
				}

			})


			// Gender
      if(!parseName(bio[0]).match(/\sand\s/) && parseName(bio[0]).toLowerCase().match(/mrs\s/)) gender = "female";

      // Name
      var aliases = parseAlias(bio[0]);
      var name = aliases[0];


      var notesLink = [];


      // NOTES!!!
      notes = notes.join("");

      titles.forEach(function (title){
        var re = new RegExp(
          '[0-9]+' +
          '\\.\\s' +
          title.toLowerCase().replace(/\./,"\\.").replace(/\*/,"\\*")
        );
        var matches = re.exec(notes.toLowerCase())
        
        if(matches) notesLink.push({
            title: title,
            index: matches.index,
          })
      })
      


      // =====
      // Tours
      // =====

      tours = tours.map(function (d){

        var tourLinks = [];

        var tourDatesRegExp = new RegExp((
          '(-)?(c\\.)?(?:\\s)?([0-9]{4})(/[0-9]{1,4})?(?:\\[)?(?:\\()?(\\?)?(?:\\])?(?:\\))?(?:\\s)?(?:-)?(?:\\s)?(c\\.)?(?:\\s)?([0-9]{1,4})?(/[0-9]{1,4})?(?:\\?)?(-)?(?:\\])?' +
          '(.*)?'
          ),"gi")

        var text = d.match(/^\[.*\]$/) ? d.replace(/^\[|\]$/g,"") : d;
        var dates =  tourDatesRegExp.exec(text);

        var cities = dates[10];
        var trips;
        var groups = [];

        var startDate = dates[3],
            endDate = dates[7] ? dates[3].substring(0,4 - dates[7].length) + dates[7] : dates[3];

        if (cities) {

          // let's keep everything just before the first period (outside parens)
          cities = cities.replace(/\[.*?\]/g,",")
          cities = cities.match(/(?:[^(\.|\:)(]|\([^)]*\))+/g)[0];

          cities = cities
                    .match(/(?:[^;(]|\([^)]*\))+/g) || [];


          var cityDate = new RegExp(/\((.*?)\)/);
          var lastYear = startDate;


          cities = cities.map(function (city){

            city = city.replace(/(with visits to)/g,"with visit to");
            
            var all = city.split(/with visit to/);

            var parents = all[0],
                children = all[1] || "";


            parents = parents.replace(/\[.*?\]/g,",")
                      .replace(/( and )/g,",")
                      .match(/(?:[^,(]|\([^)]*\))+/g) || [];


            parents = parents.map(function (city,i){

              city = city.replace(/^[0-9-]+(?=\s)/,"").replace(/^ +/gm, '');
              
              var date = cityDate.exec(city);

              if (date) date = date[1].replace(/(by)/,"");

              var interval = parseCityDates(date, lastYear);
              lastYear = interval[2]

              var fromInterval = interval[0] ? interval[0].match(/([0-9]{1,4})?(?:-)?([0-9]{1,2})?(?:-)?([0-9]{1,2})?/) : [null,null,null];
              var toInterval = interval[1] ? interval[1].match(/([0-9]{1,4})?(?:-)?([0-9]{1,2})?(?:-)?([0-9]{1,2})?/) : [null,null,null];



              // geocoding
              var cityObject = {
                text : city,
                index : i,
                place : city.match(/^(?![A-z])/) ? 'Italy' : city.split(' (')[0].trim(),
                forced : city.match(/^(?![A-z])/) != null,
                from : {
                  raw: interval[0],
                  year: parseInt(fromInterval[1]) || 0,
                  month: parseInt(fromInterval[2]) || 0,
                  day: parseInt(fromInterval[3]) || 0
                },
                to : {
                  raw: interval[1],
                  year: parseInt(toInterval[1]) || 0,
                  month: parseInt(toInterval[2]) || 0,
                  day: parseInt(toInterval[3]) || 0,
                }
              }

              if (coordinates.hasOwnProperty(cityObject.place)) {
                cityObject.coordinates = coordinates[cityObject.place];
              }

              return cityObject;

            })
            .filter(function (city){ return city.text.length>2; })


            children = children.replace(/\[.*?\]/g,",")
                      .replace(/( and )/g,",")
                      .match(/(?:[^,(]|\([^)]*\))+/g) || [];


            //lastYear = parents[parents.length-1].from.slice(0,4);

            children = children.map(function (city,i){

              city = city.replace(/^[0-9-]+(?=\s)/,"").replace(/^ +/gm, '');
              
              var date = cityDate.exec(city);

              if (date) date = date[1].replace(/(by)/,"");

              var interval = parseCityDates(date, lastYear);
              lastYear = interval[2]

              var fromInterval = interval[0] ? interval[0].match(/([0-9]{1,4})?(?:-)?([0-9]{1,2})?(?:-)?([0-9]{1,2})?/) : [null,null,null];
              var toInterval = interval[1] ? interval[1].match(/([0-9]{1,4})?(?:-)?([0-9]{1,2})?(?:-)?([0-9]{1,2})?/) : [null,null,null];

              var cityObject2 = {
                text : city,
                index : i,
                place : city.split(' (')[0].trim(),
                from : {
                  raw: interval[0],
                  year: parseInt(fromInterval[1]) || 0,
                  month: parseInt(fromInterval[2]) || 0,
                  day: parseInt(fromInterval[3]) || 0
                },
                to : {
                  raw: interval[1],
                  year: parseInt(toInterval[1]) || 0,
                  month: parseInt(toInterval[2]) || 0,
                  day: parseInt(toInterval[3]) || 0,
                }
              }

              if (coordinates.hasOwnProperty(cityObject2.place)) {
                cityObject2.coordinates = coordinates[cityObject2.place];
              }

              return cityObject2;

            })
            .filter(function (city){ return city.text.length>2; })

            if (parents.length) parents[parents.length-1].children = children;

            // let's check for "see..."
            if (parents.length && parents[0].text.match(/^(see )/g)) {
              tourLinks.push(parents[0].text.match(/^(see )(.*)?/)[2])
              return [];
            }

            return parents;
            
          })

        }
         
        // check if contains /

        var startDate2 = dates[4] ? startDate.substring(0,4 - dates[4].slice(1).length) + dates[4].slice(1) : startDate;
        var endDate2 = dates[8] ? endDate.substring(0,4 - dates[8].slice(1).length) + dates[8].slice(1) : endDate;

        return {
          tour : d,
          tourLinks : tourLinks,
          cities : [].concat.apply([], cities),
          startDate : {
            range: dates[4] != null,
            from: parseInt(startDate) || 0,
            to: parseInt(startDate2) || 0
          },
          endDate : {
            range: dates[8] != null || (dates[7] == null && dates[4] != null),
            from: parseInt(endDate) || 0,
            to: dates[7] ? parseInt(endDate2) || 0 : parseInt(startDate2) || 0
          }
        }


      })

      var bioDates = parseBioDates(bio[0]) || {}
      // each entry
      var person = new Entry({
        name: name,
        aliases: aliases,
        gender: gender,
        isGroup : parseName(bio[0]).match(/\sand\s/) != undefined,
        parents: rel[8] || null,
        successions: suc,
        education: educ,
        references : references,
        associations: associations,
        bio: bio,
        narrative : narration.join(""),
        notes: notes,//.join(""),
        noteReferences: notesLink,
        occupations: occupations.map(function(o){ return { title: o.toProperCase()}; }),
        birthDate: bioDates.born || null,
        deathDate: bioDates.dead || null,
        flourishedStart: bioDates.flourishedStart || null,
        flourishedEnd: bioDates.flourishedEnd || null        
      });

      // marriages
      mar.forEach(function (m){
        person.marriages.push({
          sequence: parseInt(m.marriage),
          year: parseInt(m.year) || 0,
          spouse: m.spouse
        })
      })

      tours.forEach(function (tour){

        // each tour
        var t = new Tour({
          startDate: tour.startDate,
          endDate: tour.endDate,
          raw: tour.tour,
          entry: person._id
        })

        // each travel 
        tour.cities.forEach(function (city){

          var c = new Visit({
            raw: city.text,
            sequence: city.index,
            startDate: city.from,
            endDate: city.to,
            place: city.place,
            coordinates: city.coordinates,
            entry: person._id,
            entryName: person.name,
            tour: t._id
          })

          if (city.children) {
            city.children.forEach(function (visit){

              var v = new Visit({
                raw: visit.text,
                sequence: visit.index,
                startDate: visit.from,
                endDate: visit.to,
                place: visit.place,
                coordinates: visit.coordinates,
                entry: person._id,
                entryName: person.name,
                parent: c._id,
                tour: t._id
              })

              v.save(function (err) {
                if (err) {
                  console.log(err)
                  return;
                }
              })

              c.visits.push(v);
              t.visits.push(v);

            })

          }


          c.save(function (err) {
            if (err) {
              console.log(err)
              return;
            }
          })
          t.visits.push(c);

        })

        t.save();
        person.tours.push(t);

      })



      person.save(function (err) {
        if (err) {
          console.log(err)
          return;
        }
      })

      parseAlias(bio[0]);

      return {
      //  text : entry,
        bio : bio,//.join("; "),
      //  relations : rel,
      	gender: gender,
      	isGroup : parseName(bio[0]).match(/\sand\s/) != undefined,
        marriages : mar,
      	parent : rel || null,
        successions : suc,
        references : references,
        associations: associations,
        education: educ,
        aliases: aliases,
        name : name,
      //  memberOfParliament : member,
        bioDates : parseBioDates(bio[0]),
      //  tours : tours,  
        notes : notes,//.join(""),
        notesLink: notesLink,
        narrative : narration.join(""),
        occupations : occupations
      }

    })


    res.json({
      count : entries.length,
      entries : entries.slice(0,500)
    });

  });

};

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function sanitize(obj){

  var san = {};
  if (typeof obj != 'object') san = obj;
  for (var k in obj) {

    // $regex
    if (k == '$regex') san[k] = new RegExp(escapeRegExp(obj[k]),"i");
    else san[k] = sanitize(obj[k]);

  }

  return san;

}

exports._search = function (req, res) {
  
  console.log(JSON.stringify(sanitize(req.body)))

  Entry
    .find(sanitize(req.body))
    .limit(10)
    //.limit(10)
    .exec(function (err, response) {
      if (err) {
        res.json({
          error:err
        })
        return;
      }
      res.json({
        response:response
      });
    })

}


exports.search = function (req, res) {
  
  console.log(req.body)

  Entry
    .count(sanitize(req.body.query), function (err, count){
      
      if (err) {
        res.json({ error: err })
        return;
      }

      Entry
        .aggregate()
        .match(sanitize(req.body.query))
        .limit(req.body.limit || 20)
        .skip(req.body.skip || 0)
        .group(
          {
            _id: '$_id',
            name : { $addToSet : "$name" },
            bio: { $addToSet : "$bio" }
          }
        )
        .sort(
          { bio: 1 }
        )
        .exec(function (err, response) {
          if (err) {
            res.json({ error: err })
            return;
          }
          res.json({
            count: count,
            response:response
          });
        })

    })

  



  /*Entry
    .find(sanitize(req.body))
    .limit(10)
    //.limit(10)
    .exec(function (err, response) {
      if (err) {
        res.json({
          error:err
        })
        return;
      }
      res.json({
        response:response
      });
    })*/

}
