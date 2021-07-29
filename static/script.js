var airportData = convertData(airportJson);
var state = {
	'querySet': airportData,
	'page': 1,
	'rows':4,
}
console.log(localStorage.getItem('types') == "")
var selectedTypes=(localStorage.getItem('types') == "") ? [] :JSON.parse(localStorage.getItem('types'));  //  caching 
var currentSearch = "";
var searchable = ['name','iata','icao','latitude','longitude']
var allTypes = ['small','medium','large','heliport','closed','in your favourite']
var tableHeader = ['Name','ICAO','IATA','Elevation (meters)','Lat.','Long.','Type']

buildTypeFilter(); // pre-selected display 

buildHeaders();
buildTable();

function decimToDMS(type,number){
	var sign,deg,min,sec;
	sign = (type == 'lat' && Math.sign(number) == -1)? 
	'S' : (type == 'lat' && Math.sign(number) == 1)?'N':
	(type == 'long' && Math.sign(number) == -1)? 'W':'E';		
	deg = Math.trunc(number);	
	min = Math.abs(((number - deg) * 60))	
	dms = sign + Math.abs(deg)+"\u00B0"+min.toFixed(2)+ "'" 
	return dms;
}

function convertData(airportJson){
	var index=0;
	for(index in airportJson){
		airportJson[index]['longitude'] = decimToDMS('long',airportJson[index]['longitude'])
		airportJson[index]['latitude'] = decimToDMS('lat',airportJson[index]['latitude'])
	}
	return airportJson;
}

function buildTypeFilter(){
	var arrData = selectedTypes
	var divType = $('#type-filter');
	var index = 0;
	var isChecked,htmlType = "";
	divType.html('');
	for(index in allTypes){
		if(arrData.includes(allTypes[index])){
			isChecked = "checked";
		}
		htmlType ='<input type="checkbox" '+isChecked+' name="'+allTypes[index]+'" onchange="typeChange(this)"/><label>'+allTypes[index]+'</label>'
		divType.append(htmlType);		
		isChecked = "";
	}
	
}

function pagination(querySet,page,rows){	
	var trimStart = (page-1) * rows;
	var trimEnd = trimStart + rows
	var trimmedData = querySet.slice(trimStart,trimEnd)
	var pages = Math.ceil(querySet.length/rows);
	var range = (trimStart + 1)+" - "+trimEnd;
	
	if(state.page == pages){
		range =  (trimStart + 1) +"-"+ querySet.length;
	}
	if(querySet.length == 0){
		range =  0
	}	
	return {
		'querySet':trimmedData,
		'range': range,
		'result':querySet.length,
	}
}

function typeChange(type){
	state.page = 1;
	var typeName = type.name;
	var typeStatus = type.checked;
	var index
	if(typeStatus){
		selectedTypes.push(typeName);
	}
	else{
		index = selectedTypes.indexOf(typeName);
		if (index >= 0) {
			selectedTypes.splice( index, 1 );
		}
	}
	localStorage.setItem('types',JSON.stringify(selectedTypes))
	buildTable();
}

function filter(event){
	state.page = 1;
	currentSearch = event.value;
	buildTable();	
}
function search(filtereddata){
	var searchResult=[];
	if(currentSearch == ""){
		searchResult = filtereddata;
	}
	else{
		for (var i=0 ; i < filtereddata.length ; i++)
		{
			for(var j=0 in searchable){
				if((filtereddata[i][searchable[j]]) != null){
					if (((filtereddata[i][searchable[j]]).toLowerCase()).includes(currentSearch.toLowerCase())) {
						searchResult.push(filtereddata[i]);
					}
				}			
			}		
		}
	}
	return {
		'querySet':searchResult,
	}
}

function filterByType(dataset){
	var types = selectedTypes
	var filteredArray = [];
	if(types.length == 0){
		filteredArray = dataset;
	}
	else{
		filteredArray = dataset.filter((o) => types.includes(o.type));
	}
	return {
		'querySet':filteredArray,
	}
}

function buildTable(isDownload = false){
	var filteredData = filterByType(state.querySet);
	var searchedData = search(filteredData.querySet)
	var myData = pagination(searchedData.querySet,state.page,state.rows)
	var currentPage = state.page;
	var myList = myData.querySet;
	if(isDownload==true)
	{
		download(searchedData.querySet);
	}
	hideShowPrev(currentPage);
	hideShowNext(currentPage,myData.result);	
	displayTable(myList,myData.range,myData.result)
	
}

function buildHeaders(){
	var tableHead = $('#table-head');
	var index= 0;
	var header = ""
	tableHead.html("");
	
	for( index in tableHeader){
		header += `<th>${tableHeader[index]}</th>` 
		
	}
	tableHead.append(header)
}
function displayTable(tabledata,range,records){
	var table = $('#table-body');
	var row = ""
	var index=0;
	var lat,lon;
	table.html('')
	for(index in tabledata){
		row=`<tr>
		<td>${tabledata[index].name}</td>
		<td>${tabledata[index].icao}</td>
		<td>${tabledata[index].iata}</td>
		<td>${tabledata[index].elevation}</td>
		<td>${tabledata[index].latitude}</td>
		<td>${tabledata[index].longitude}</td>
		<td>${tabledata[index].type}</td>
		</tr>`
		table.append(row)			
	}
	$('#display').text(range)
	$('#result').text(records)
}

function hideShowPrev(currentPage){
	if(currentPage == 1){
		$('#prev-arrow').addClass('no-event')
	}
	else{
		$('#prev-arrow').removeClass('no-event')
	}
}
function hideShowNext(currentPage,results){
	var totalPages = results / state.rows;
	if(totalPages <= currentPage){
		$('#next-arrow').addClass('no-event')
	}
	else{
		$('#next-arrow').removeClass('no-event')
	}
}
function prevSet(){
	var currentPage = state.page;
	state.page = currentPage - 1;
	buildTable();
}
function nextSet(){
	var currentPage = state.page;
	state.page = currentPage + 1;
	buildTable();
}
function download(jsondata){
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(jsondata));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href", dataStr );
	dlAnchorElem.setAttribute("download", "airport.json");
	dlAnchorElem.click();
}
function displayRecords(elem){
	state.rows = Number(elem.value);
	buildTable();
}


