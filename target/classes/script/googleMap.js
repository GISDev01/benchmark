var drawingManager;
var selectedShape;
var allShape = [];
var sendChartData;
var receiveChartData;
var map;
var chart;

var options = {
  chart: {
    title: 'Wyniki'
  },
  backgroundColor: { fill:'transparent' },
  crosshair: {
      color: '#000',
      trigger: 'selection'
    }
};



function clearSelection () {
    if (selectedShape) {       
        selectedShape = null;
    }
}
function setSelection (shape) {
    selectedShape = shape;
}
function deleteAllShape () {
    if (allShape.length != 0) {
        for(i = 0; i<allShape.length; i++){
            allShape[i].setMap(null);            
        }
    }
}

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: -34.397, lng: 150.644},
      zoom: 8
    });

    drawingManager = new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.POLYGON,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: ['polygon']
          },
        polygonOptions: {
            strokeWeight: 0,
            fillOpacity: 0.5,
            editable: true,
            draggable: true
        },
        map: map
    });
    
    google.maps.event.addListener(drawingManager, 'overlaycomplete', function (e) {
        var newShape = e.overlay;
        newShape.type = e.type;

        allShape.push(newShape);

        
        if (e.type !== google.maps.drawing.OverlayType.MARKER) {
            drawingManager.setDrawingMode(null);
            google.maps.event.addListener(newShape, 'click', function (e) {
                if (e.vertex !== undefined) {
                    if (newShape.type === google.maps.drawing.OverlayType.POLYGON) {
                        var path = newShape.getPaths().getAt(e.path);
                        path.removeAt(e.vertex);
                        if (path.length < 3) {
                            newShape.setMap(null);
                        }
                    }
                }
                setSelection(newShape);
            });
            setSelection(newShape);
        }
        else {
            google.maps.event.addListener(newShape, 'click', function (e) {
                setSelection(newShape);
            });
            setSelection(newShape);
        }    
    });
    google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
    google.maps.event.addListener(map, 'click', clearSelection);
    google.maps.event.addDomListener(document.getElementById('delete-button'), 'click', deleteAllShape);

}

//=========================

google.charts.load('current', {'packages':['line']});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    chart = new google.charts.Line(document.getElementById('chart'));
    var data = new google.visualization.DataTable();
    sendChartData = new google.visualization.DataTable();
    receiveChartData = new google.visualization.DataTable();
    setUpColums(sendChartData);
    setUpColums(receiveChartData);
    
    data.addColumn('string', 'punkty');
    data.addColumn('number', 'MySQL');
    data.addColumn('number', 'PostGIS');
    data.addColumn('number', 'Neo4j');
    data.addColumn('number', 'Cassandra');
    data.addColumn('number', 'OrientDb');
    data.addColumn('number', 'MongoDb');
    data.addRows([
      ['1',  1, 1, 1, 1, 1, 1]
    ]);


chart.draw(data, google.charts.Line.convertOptions(options));
}

//===============

$(document).ready(function() {
    getPolygonNames();
    $("#save-coordinate-button").on("click", function(){
        if($("#shape-name").val() != ""){
            var polygonLatLng = getPolygonCoords();
            var numberOfPoint = JSON.parse(polygonLatLng).length;
            sendCoordinateAndDisplayTimeOfSave(polygonLatLng, numberOfPoint);
        } else {
            $("#input-alert").css("background-color", "red")
        }
    });
    
    $("#get-coordinate-button").click(function(){
        var shapeName = $("#selected-coordinate").val();
        getCoordinateFromServer(shapeName);
    });
    
    $("#shape-name").keyup(function(){
        $("#input-alert").css("background-color", "white")
    });
    
    $("#disp-send-result").click(function(){
        refreshChart(sendChartData);
    });
    $("#disp-receive-result").click(function(){
        refreshChart(receiveChartData);
    });
    
    
});
function getCoordinateFromServer(shapeName){
    $.ajax({
          type:'get',//TODO: url with shapeName: coordinate/{shapeName}
          url:'https://383417f1-9ce5-491b-bb4d-80de5d1a4f8d.mock.pstmn.io/coordinate/',
          dataType:'json',
          success:function(data){
              console.log(data);
              var numberOfPoint = data.coordinates.length;
              var row = prepareDataForDisplay(data,numberOfPoint);
              dislayOnReceiveChart(row);
              var coordinates = jsonToGoogleCoordinateObj(data.coordinates);
              drawShapeOnMap(coordinates);
          }
    });
}

function drawShapeOnMap(coordinates){
    var newShape = new google.maps.Polygon({
        paths: coordinates,
        strokeWeight: 0,
        fillOpacity: 0.5,
        editable: true,
        draggable: true
    });
    newShape.setMap(map);
    allShape.push(newShape);
}

function jsonToGoogleCoordinateObj(json){
    var length = json.length;
    var coordinates = [];
    for(i=0; i<length; i++){
        coordinates.push({
            lat: parseFloat(json[i].lat),
            lng: parseFloat(json[i].lng)
        });
    }
    return coordinates;
}

function getPolygonCoords() {
    var len = selectedShape.getPath().getLength();
    var shapeLatLng = [];
    for (var i = 0; i < len; i++) {
        var latlng = selectedShape.getPath().getAt(i).toUrlValue(5);
        latlng = latlng.split(',');
        shapeLatLng.push({
            lat: latlng[0],
            lng: latlng[1]
        });
    }
    return JSON.stringify(shapeLatLng);
}

function sendCoordinateAndDisplayTimeOfSave(shapeLatLng, numberOfPoint){
    console.log(shapeLatLng);
   $.ajax({//TODO: url with name: coordinate/{shapeName}
    url: 'https://383417f1-9ce5-491b-bb4d-80de5d1a4f8d.mock.pstmn.io/coordinate/',
    dataType: 'json',
    type: 'post',
    contentType: 'application/json',
    data: shapeLatLng,
    processData: false,
    success: function( data, textStatus, jQxhr ){
        console.log(data);
        var row = prepareDataForDisplay(data, numberOfPoint);
        displayOnSendChart(row);
        getPolygonNames();
    },
    error: function( jqXhr, textStatus, errorThrown ){
        console.log( errorThrown );
    }
});
}

function prepareDataForDisplay(saveTime, numberOfPoint){
    return [numberOfPoint.toString(),
               parseFloat(saveTime.mySQL),
               parseFloat(saveTime.postGIS),
               parseFloat(saveTime.neo4j),
               parseFloat(saveTime.cassandra),
               parseFloat(saveTime.orientDb),
               parseFloat(saveTime.MongoDb)];
}

function displayOnSendChart(row){
    sendChartData.addRow(row);
    refreshChart(sendChartData);
}

function dislayOnReceiveChart(row){
    receiveChartData.addRow(row);
    refreshChart(receiveChartData);
}

function refreshChart(chartData){
    chart.draw(chartData, google.charts.Line.convertOptions(options));
}

function getPolygonNames(){
    $.ajax({
          type:'get',
          url:'https://383417f1-9ce5-491b-bb4d-80de5d1a4f8d.mock.pstmn.io/coordinateName',
          dataType:'json',
          success:function(data){
              console.log("nazwy:");
              console.log(data);
              $.each(data, function(k, obj){
                  $("#selected-coordinate").append( $('<option>', { text: obj.name }));
              });
          }
      });
}

function setUpColums(data){
    data.addColumn('string', 'punkty');
    data.addColumn('number', 'MySQL');
    data.addColumn('number', 'PostGIS');
    data.addColumn('number', 'Neo4j');
    data.addColumn('number', 'Cassandra');
    data.addColumn('number', 'OrientDb');
    data.addColumn('number', 'MongoDb');
}