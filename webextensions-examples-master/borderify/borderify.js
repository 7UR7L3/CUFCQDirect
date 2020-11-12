(async function(){

function extensionStorageGet( key )
{
	return new Promise( function(resolve, reject){ chrome.storage.local.get( key, resolve ); } );
}


fcqData = await extensionStorageGet( "fcqJSON" ); // TODO make this async, the lag hijacks the site and it's shitty; spin wait at top of mutation observer callback for fcqData to get defined
fcqData = "fcqJSON" in fcqData ? fcqData["fcqJSON"] : null;

if( !fcqData )
{
	console.log( "fcqData wasn't cached; pulling fcqs" );

	var fcqUrls =
	[
		"https://cors-anywhere.herokuapp.com/https://www.colorado.edu/fcq/node/181/attachment",
		"https://cors-anywhere.herokuapp.com/https://www.colorado.edu/fcq/node/179/attachment"
	];

	console.log( "loading fcq spreadsheets" );
	var fcqXlsxs = await Promise.all( fcqUrls.map( url => fetch( url ).then( xlsx => xlsx.arrayBuffer() ) ) );

	console.log( "loading xlsx parser" );
	eval( await fetch( "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.16.8/xlsx.full.min.js" ).then( r => r.text() ) );

	console.log( "parsing XLSXs" );
	fcqData = fcqXlsxs
				.map( xlsx => (wb=XLSX.read( new Uint8Array( xlsx ), { type: "array" } )).SheetNames
								.map( sn => XLSX.utils.sheet_to_row_object_array( wb.Sheets[ sn ] ) ) );

	// rip out sheets that aren't the thicc instructor fcq sheet
	fcqData = fcqData.map( dump => dump.filter( sheet => Object.values( sheet[1] ).includes( "Instructor Name" ) )[0] );

	// update old column headers to new column headers
	for( var table of fcqData )
	{
		if( Object.values( table[1] ).includes( "Course" ) && !Object.values( table[1] ).includes( "AvgCourse" ) ) continue;

		function rename( oldKey )
		{
			if( oldKey == "Year" )                  return "Year";
			if( oldKey == "Campus" )                return "Campus";
			if( oldKey == "College" )               return "College";
			if( oldKey == "Class Division" )        return "Crse Lvl";
			if( oldKey == "Department" )            return "Dept";
			if( oldKey == "Subject" )               return "Sbjct";
			if( oldKey == "Course" )                return "Crse";
			if( oldKey == "Section" )               return "Sect";
			if( oldKey == "Instructor Name" )       return "Instructor Name";
			if( oldKey == "Instr Group" )           return "Instr Grp";
			if( oldKey == "Class Type" )            return "Crse Type";
			if( oldKey == "Online" )                return "Onlin";
			if( oldKey == "# Stu Enrolled" )        return "Enroll";
			if( oldKey == "# Stu Responses" )       return "# Resp";
			if( oldKey == "Response Rate" )         return "Resp Rate";
			if( oldKey == "Course Title" )          return "Crse Title";
			if( oldKey == "AvgHrsPerWk" )           return "HrsPerWk";
			if( oldKey == "AvgPriorInterest" )      return "Interest";
			if( oldKey == "AvgChallenge" )          return "Challenge";
			if( oldKey == "AvgLearned" )            return "Learned";
			if( oldKey == "AvgCourse" )             return "Course";
			if( oldKey == "AvgInstrEffectiveness" ) return "Effect";
			if( oldKey == "AvgInstrAvailability" )  return "Avail";
			if( oldKey == "AvgInstrRespect" )       return "Respect";
			if( oldKey == "AvgInstructor" )         return "Instr";
			if( oldKey == "StdDev_Course" )         return "SD Crse";
			if( oldKey == "StdDev_Instr" )          return "SD Instr";

			return oldKey;
		}

		table[1] = Object.fromEntries( Object.entries( table[1] ).map( e => [ e[0], rename( e[1] ) ] ) );
	}

	// map record property names to their descriptive headers (from row 1)
	fcqData = fcqData.map( dump =>
		dump.map( row => Object.fromEntries( Object.keys(row).map( k => [ dump[1][k], row[k] ] ) ) ) ); // thanks https://stackoverflow.com/a/53508215

	// rip out non-data header rows
	fcqData = fcqData.map( dump => dump.slice(2) );

	// merge dumps
	fcqData = fcqData.flat();

	chrome.storage.local.set( { "fcqJSON": fcqData } );
}
else
	console.log( "fcqData successfully retrieved from cache	" );


console.log( "fcqData:", fcqData );


/*
	now get all instructors' full names by querying for the full information of every (visible?) search result
*/

// get undetailed results of search
// await fetch( "https://classes.colorado.edu/api/?page=fose&route=search&keyword=geog",
// 	{
// 		"method": "POST",
// 		"body": JSON.stringify(
// 			{
// 				other: { srcdb: document.querySelector( "#crit-srcdb" ).value },
// 				criteria: [ { field: "keyword", value: "geog" } ]
// 			} )
// 	}
// ).then( r => r.json() );

// grab crns from undetailed results

// get detailed result of specific section of search result
// await fetch( "https://classes.colorado.edu/api/?page=fose&route=details",
// 	{
// 		"method": "POST",
// 		"body": JSON.stringify(
// 			{
// 				group: "code:GEOG 1001",
// 				key: "crn:19475",
// 				srcdb: document.querySelector( "#crit-srcdb" ).value,
// 				matched: "crn:19475,20754,20755,20756,20757,20758,20759,41024,41557"
// 			} )
// 	}
// ).then( r => r.json() );




const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length; // thanks https://stackoverflow.com/a/18234568





// Create an observer instance linked to the callback function
const panelobserver = new MutationObserver(async function(mutationsList, observer) {
    // // Use traditional 'for loops' for IE 11
    // for(const mutation of mutationsList) {
    //     if (mutation.type === 'childList') {
    //         console.log('A child node has been added or removed.');
    //     }
    //     else if (mutation.type === 'attributes') {
    //         console.log('The ' + mutation.attributeName + ' attribute was modified.');
    //     }
    // }
    // while( document.querySelectorAll( ".result" ).length == 0 )
    // 	await new Promise(r => setTimeout(r, 200));
    // updateVisibleResults();
    for( mutation of mutationsList )
    	if( mutation.target.classList.contains( "panel__content" ) )
    		updateVisibleResults();
		    // console.log( "yes", mutationsList );
});

// Start observing the target node for configured mutations
panelobserver.observe(document.querySelector('.panels'), { attributes: false, childList: true, subtree: true });







// add visibility callbacks to all search results (make sure this gets called every time a new search result pops up)
crnDetailMemo = {};
function updateVisibleResults()
{
	// handledResults = {};
	for( var result of document.querySelectorAll( ".result" ) )
	{
	    var observer = new IntersectionObserver(async function(entries) {
	        if(entries[0].isIntersecting === true) // element and viewport are overlapping; element became visible
	        {
	        	resData = entries[0].target.querySelector("a").dataset;
	            console.log( "should load instructors for crns", resData.matched );

	            // if( JSON.stringify( resData ) in handledResults ) return;
	            // handledResults[ JSON.stringify( resData ) ] = true;
	            if( Object.keys( entries[0].target.dataset ).includes( "processedFcqs" ) ) return;
	            entries[0].target.dataset.processedFcqs = true;

	            for( crn of resData.matched.substring( "crn:".length ).split( "," ) )
	            {
	            	var crnDetails;
	            	if( crn in crnDetailMemo ) crnDetails = crnDetailMemo[crn];
	            	else
	            	{
						crnDetails = await fetch( "https://classes.colorado.edu/api/?page=fose&route=details",
							{
								"method": "POST",
								"body": JSON.stringify(
									{
										group: resData.group,
										key: "crn:" + crn,
										srcdb: resData.srcdb,
										matched: resData.matched
									} )
							}
						).then( r => r.json() );
						crnDetailMemo[crn] = crnDetails;
					}

					console.log( crnDetails );

					for( var inst of new DOMParser().parseFromString( crnDetails.instructordetail_html, "text/html" ).querySelectorAll( "a" ) )
					{
						// var instName = new DOMParser().parseFromString( crnDetails.instructordetail_html, "text/html" ).querySelector( "a" ).innerText;
						var instName = (decodeURI(inst.href).match( /&iname=(.*)$/ )[1]||"").replaceAll( " ", "" );

						console.log( instName );

						// console.log( fcqData.filter( row => instName.split(" ").every( n => (row["Instructor Name"]||"").includes(n) ) ) );
						instRecords = fcqData.filter( row => (row["Instructor Name"]||"").replaceAll(" ", "").startsWith(instName) );
						console.log( instRecords );

						var ratingDiv = document.createElement( "div" );
						ratingDiv.title = instRecords.map( r => `${r["Year"]} - ${r["Sbjct"]}${r["Crse"]} ${r["HrsPerWk"]} ${r["Interest"]} ${r["Challenge"]} ${r["Learned"]} ${r["Course"]}+/-${r["SD Crse"]} ${r["Effect"]} ${r["Avail"]} ${r["Respect"]} ${r["Instr"]}+/-${r["SD Instr"]} ( ${r["Crse Title"]} )` ).join( "&#13;" );
						
						// TODO: fix NaN bug. idk when or why it happens but bleh
						ratingDiv.innerText = crnDetails.schd + " | " + instName + ": " + average( instRecords.map( row => row[ "Instr" ] ) ) + " !";
						entries[0].target.appendChild( ratingDiv );
					}
				}
	        }
	    }, { threshold: [0] });

	    observer.observe(result);
	}
}


})();
