# CUFCQDirect
Chrome extension to directly embed FCQ instructor/class scores in https://classes.colorado.edu/ results.

![mk1 ugly proof screenshot](mk1uglyproof.png?raw=true "Mk1 Ugly Proof")
(for now... it has a lot more information, just isn't crammed into pixels for eye yet)

### how
- pulls fcq results from hardcoded source xlsx links found here https://public.tableau.com/profile/fcq.office#!/vizhome/FCQResultsViewerDownloads/FCQDownloads
- converts spreadsheets to json with https://github.com/SheetJS/sheetjs and merges them into the same format (i chose the more recent format even though it's worse)
- caches json (~450MB) with unlimitedStorage https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage
- lowkey hammers the classes.colorado.edu fose api to get the full details for each visible result to get the full instructor names
- filters fcq records by instructor name

### TODO
- see fcqview.js (i'm gonna forget to update this damn readme when i clean up the repo)
- clean up the repo lol
- ui/ux
- d3 pretty line graph and table pop up
- polish extension to be like a legit extension with settings and things
- i don't have a single clue why it doesn't work in firefox and why the firefox extension debugging dev tools experience is so garbage (though i didn't try very hard)
