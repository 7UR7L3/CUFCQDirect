/*
https://public.tableau.com/profile/fcq.office#!/vizhome/FCQResultsViewer/FCQResultsViewer?Instructor%20Name=Aaeng%5C,%20Aaron
https://public.tableau.com/profile/fcq.office#!/vizhome/FCQResultsViewer/FCQResultsTable?Instructor%20Name=Aaeng%5C,%20Aaron

https://public.tableau.com/profile/api/fcq.office#!/vizhome/FCQResultsViewer/FCQResultsTable

actually too complicated.. https://stackoverflow.com/questions/52226270/web-scraping-a-tableauviz-into-an-r-dataframe
and other results for `scrape tableau site:stackoverflow.com`.. looks like a pita.

---

via
https://public.tableau.com/profile/fcq.office#!/vizhome/FCQResultsViewerDownloads/FCQDownloads
-> https://www.colorado.edu/fcq/node/181/attachment is fall 2006 - summer 2010
-> https://www.colorado.edu/fcq/node/179/attachment is fall 2010 - present

instructor rating, course rating
instructor rating for course
standard deviation for all ratings
lil graph indication of improvement or not for all
curve for instructor with course highlighted (merge responses for instructor and instructor for course?)
table view of each too more prominently (graph is on the side)


actually maybe just the instructor number with a mini graph on the side and if you hover it expands the graph and shows all the different scores as different coloured lines on a line chart with the averages for each metric and the lil standard deviation markers :D
actually yeah clicking should bring up both a graph view and a table view of everything covering like most of the screen cause why not
and then maybe toggle boxes to show/hide each metric, with settings to toggle default metric visibility (like i never care about respect and shit ig)

work out a loading spinner if the async doesn't fix the terrible lag

settings to fix the fcq dump file(s) used, either local or by url
settings to clear cache of fcq dump file(s) and reload the fcq data
setting to either load fcq data on visible or load on hover
setting for format string for i guess every string that's used, with a list of what variables they can put in the format string, pulling from any of the short info, detailed info, or fcq records
setting to limit to the past n years of fcq data (saves storage of cached json)
maybe some view options idfk
setting to query heroku for records of a given instructor name instead of dealing with the thicc json locally at all

add course specific fcq breakdown too, not just the instructor one

preview of next pane on hover if i'm having to load them anyway

trim the json that gets saved
maybe csv would be lighter weight and maybe there's a js lib that can give a decent view of a csv for searching and shit?

dropdown to search manually in iframe if it fails and button to report failure? idk

add my own site that does its own queries of the fose api and presents more info in a wider fullscreen pane with thiccer results that you can hide. so that you don't need the extension. would have to find something to mimic the unlimited storage with indexeddb or work out server queries for the profs
*/

function loadScriptSync (src) { // thanks https://stackoverflow.com/a/21550322
    var s = document.createElement('script');
    s.src = src;
    s.type = "text/javascript";
    s.async = false;                                 // <-- this is important
    document.getElementsByTagName('head')[0].appendChild(s);
}


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
var fcqData = fcqXlsxs
				.map( xlsx => (wb=XLSX.read( new Uint8Array( xlsx ), { type: "array" } )).SheetNames
													.map( sn => XLSX.utils.sheet_to_row_object_array( wb.Sheets[ sn ] ) ) );
console.log( "fcqData:", fcqData );



// var workbook = XLSX.read(data, { type: 'binary' }); // thanks https://github.com/YDulanjani/ConvertExcelToJSON
// workbook.SheetNames.forEach(function(sheetName)
// {
//   var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
//   // var json_object = JSON.stringify(XL_row_object);
//   // document.getElementById("jsonObject").innerHTML = json_object;
//   console.log(XL_row_object)
//   lit.push( XL_row_object );
// })


// console.log( "xlsx parser loaded", XLSX );



// // thanks https://stackoverflow.com/a/53508215
// data = data.map( row => Object.fromEntries( Object.keys(row).map( k => [ data[1][k], row[k] ] ) ) );


// data.filter( row => "Teresa Chapman".split(" ").every( n => (row["Instructor Name"]||"").includes(n) ) )
