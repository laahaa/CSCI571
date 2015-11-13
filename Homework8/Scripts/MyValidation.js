$.validator.addMethod("NoSpace",function(value,element){
    return this.optional(element) || value.trim().length !== 0;
});
// three global facebook variable for the post window..
var facebookSummary = '';
var facebookTemp = '';
var facebookPic = '';
//validator function -> submitHandler -> ajax request
$().ready(function(){
    var validator = $("#FormID").validate({
        rules:{
            StreetAddress:{
                NoSpace :true,
                required:true
            },
            City: {
                NoSpace :true, //addMethod
                required:true
            },
            State:{
                required:true
            }
        },
        messages:{
            StreetAddress:"<p class='errorMessage'>Please enter the street address</p>",
            City:"<p class='errorMessage'>Please enter the city</p>",
            State:"<p class='errorMessage'>Please select a state</p>"
        },

        submitHandler:function(form){
            var StreetAddress = $("#StreetAddress").val();
            var City          = $("#City").val();
            var State         = $("#State").val();
            var Degree;
            if($("#Fahrenheit").is(":checked")){
                Degree = $("#Fahrenheit").val();
            }
            else{
                Degree = $("#Celsius").val();
            }
            $.ajax({
                url  : "http://myfirstapplication14187-env.elasticbeanstalk.com",
                type : "GET",
                data : {
                    "StreetAddress" : StreetAddress,
                    "City"          : City,
                    "State"         : State,
                    "Degree"        : Degree
                },
                dataType : 'json',
                success:function(response){
                    var phpReturn = JSON.parse(response);
                    //console.log(phpReturn);
                    ShowWeather(phpReturn);
                }
            });
        }
    })
 });

//Two parts, left and right..
function ShowWeather(phpReturn){
    var longtitude = phpReturn.longitude;
    var latitude   = phpReturn.latitude;
    //for current weather table
    var timezone         = phpReturn.timezone;
    var iconValue        = phpReturn.currently.icon;
        var iconMap      = new Object();
    var weatherCondition = phpReturn.currently.summary;
    facebookSummary      = weatherCondition;
    var $city            = $("#City").val();
    var $state           = $("#State").val();
    var temperature      = phpReturn.currently.temperature;
    facebookTemp         = temperature;
    var IntTemperature   = Math.round(temperature);
    var lowTemperature   = phpReturn.daily.data[0].temperatureMin;
    var highTemperature  = phpReturn.daily.data[0].temperatureMax;
    var precipitation    = phpReturn.currently.precipIntensity;
    var precipDisplay    = "";
    var chanceOfRain     = phpReturn.currently.precipProbability;
    var OutputChanceOfR  = Math.round(chanceOfRain*100) + "%";
    var windSpeed        = phpReturn.currently.windSpeed;
    var OutputWindSpeed  = windSpeed.toFixed(2);
    var dewPoint         = phpReturn.currently.dewPoint;
    var OutputDewPoint   = dewPoint.toFixed(2);
    var humidity         = phpReturn.currently.humidity;
    var OutputHumidity   = Math.round(humidity * 100) + "%";
    var visibility       = phpReturn.currently.visibility;
    var OutputVisibility = visibility.toFixed(2);
    var sunrise          = phpReturn.daily.data[0].sunriseTime;
    var sunset           = phpReturn.daily.data[0].sunsetTime;
    var SunriseTime      = moment.unix(sunrise).tz(timezone).format('hh:mm A');
    var SunsetTime       = moment.unix(sunset).tz(timezone).format('hh:mm A');
// hashmap of icon value to icon url
    iconMap["clear-day"]           = 'clear.png';
    iconMap["clear-night"]         = 'clear_night.png';
    iconMap["rain"]                = 'rain.png';
    iconMap["snow"]                = 'snow.png';
    iconMap["sleet"]               = 'sleet.png';
    iconMap["wind"]                = 'wind.png';
    iconMap["fog"]                 = 'fog.png';
    iconMap["cloudy"]              = 'cloudy.png';
    iconMap["partly-cloudy-day"]   = 'cloud_day.png';
    iconMap["partly-cloudy-night"] = 'cloud_night.png';
    function get(k){
        return iconMap[k];
    }
    var iconName = get(iconValue);
    facebookPic = iconName;
    var degree          = "";
    var unit            = "";
    var unitOnlyLetter  = "";
    var windSpeed_unit  = "";
    var visibility_unit = "";
    var pressure_unit   = "";

    if($("#Fahrenheit").is(":checked")){
        degree          = $("#Fahrenheit").val();
        unit            = "&#176;F";
        unitOnlyLetter  = "F";
        windSpeed_unit  = "mph";
        visibility_unit = "mi";
        pressure_unit   = "mb";
    }
    else{
        degree          = $("#Celsius").val();
        unit            = "&#176;C";
        unitOnlyLetter  = "C";
        windSpeed_unit  = "m/s";
        visibility_unit = "km";
        pressure_unit   = "hPa";
    }
    facebookTemp = facebookTemp + unit;
    if(degree == "Celsius"){
        precipitation /= 25.4;
    }
    if(precipitation >= 0 && precipitation < 0.002){
        precipDisplay = "None";
    }
    else if(precipitation >= 0.002 && precipitation < 0.017){
        precipDisplay = "Very Light";
    }
    else if(precipitation >= 0.017 && precipitation < 0.1){
        precipDisplay = "Light";
    }
    else if(precipitation >= 0.1 && precipitation < 0.4){
        precipDisplay = "Moderate";
    }
    else{
        precipDisplay = "Heavy";
    }

    // set the div of result..
    var TabPart   = "";
    var LeftPart  = "";
    var RightNowTable = "";
    var Next24HoursTable = "";
    var Next7DaysModal = "";

    //build the map
    function init()
    {
        var args = OpenLayers.Util.getParameters();
        var layer_name = "rain";
        var lat = latitude;
        var lon = longtitude;
        var zoom = 10;
        var opacity = 0.3;

        if (args.l)	layer_name = args.l;
        if (args.lat)	lat = args.lat;
        if (args.lon)	lon = args.lon;
        if (args.zoom)	zoom = args.zoom;
        if (args.opacity)	opacity = args.opacity;

        var map = new OpenLayers.Map("map",
            {
                units:'m',
                projection: "EPSG:900913",
                displayProjection: new OpenLayers.Projection("EPSG:4326")
            });

        var osm = new OpenLayers.Layer.XYZ(
            "osm",
            "http://c.tile.openweathermap.org/map/osm/${z}/${x}/${y}.png",
            {
                numZoomLevels: 18,
                sphericalMercator: true
            }
        );

        var mapnik = new OpenLayers.Layer.OSM();

        var opencyclemap = new OpenLayers.Layer.XYZ(
            "opencyclemap",
            "http://a.tile3.opencyclemap.org/landscape/${z}/${x}/${y}.png",
            {
                numZoomLevels: 18,
                sphericalMercator: true
            }
        );
//add cloud and precipitation layers
        var layer_cloud = new OpenLayers.Layer.XYZ(
            "clouds ",
            "http://c.tile.openweathermap.org/map/"+"clouds"+"/${z}/${x}/${y}.png",
            {
			    numZoomLevels: 10,
                isBaseLayer: false,
                opacity: 0.7,
                sphericalMercator: true,
                tileOptions:{crossOriginKeyword:null}
            }
        );
        var layer_precipitation = new OpenLayers.Layer.XYZ(
            "precipitation",
            "http://c.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png",
            {
                numZoomLevels:10,
                isBaseLayer: false,
                opacity: 0.7,
                sphericalMercator: true,
                tileOptions:{crossOriginKeyword:null}
            }
        );

        var centre = new OpenLayers.LonLat(lon, lat).transform(new OpenLayers.Projection("EPSG:4326"),
            new OpenLayers.Projection("EPSG:900913"));
        map.addLayers([mapnik, osm, opencyclemap, layer_cloud]);
        map.addLayers([mapnik, osm, opencyclemap, layer_precipitation]);
        map.setCenter(centre, zoom);
        var ls = new OpenLayers.Control.LayerSwitcher({'ascending':false});
        map.addControl(ls);

        map.events.register("mousemove", map, function (e) {
            var position = map.getLonLatFromViewPortPx(e.xy).transform(new OpenLayers.Projection("EPSG:900913"),
                new OpenLayers.Projection("EPSG:4326"));

            $("#mouseposition").html("Lat: " + Math.round(position.lat*100)/100 + " Lon: " + Math.round(position.lon*100)/100 +
                ' zoom: '+ map.getZoom());
        });
    }

    RightNowTable +=
    "<div class='col-md-6' id='DivRightNowL6ID'>" +
        "<div class='row' id='DivIconAndWeatherID'>" +
            "<div class='col-md-6' id='DivIconID'>" +
                "<img alt='"+iconValue+"' id='DisplayedIconID' src='http://cs-server.usc.edu:45678/hw/hw8/images/" + iconName +"'>" +
            "</div>";
    RightNowTable +=
            "<div class='col-md-6' id='Div3PartsID'>" +
                "<div id='Div3UpID'>" +
                    "<p id='PWeatherConditionID'>" + weatherCondition + ' in ' +$city + ', ' + $state + "</p>" +
                "</div>"+
                "<div id='Div3MiddleID'>" +
                    "<p id='P3MiddleID'><b id='BigNumberID'>" + IntTemperature +"</b><span>" +"&#176; " + unitOnlyLetter + "</span>" + "</p>" +
                "</div>" +
                "<div id='Div3BottomID'>" +
                    "<span style='color: blue'>" + "L: " + lowTemperature + "&#176;</span>" + " | " + "<span style='color: green'>" +"H: " + highTemperature + "&#176;</span>" +
                    "<button class='btn' id='facebookButton' onclick='FacebookPost()'>" +
                        "<img id='facebookLogo' src='http://cs-server.usc.edu:45678/hw/hw8/images/fb_icon.png'>" +
                    "</button>"+
                "</div>" +
            "</div>" +
        "</div>" ;
    RightNowTable +=
        "<table class='table table-striped'>" +
            "<tr>" +
                "<td class='leftTd'>" +
                    "Precipitation" +
                "</td>" +
                "<td class='makeRightLeft'>" +
                    precipDisplay +
                "</td>" +
            "</tr>" +
            "<tr class='danger'>" +
                "<td class='leftTd'>" +
                    "Chance of Rain" +
                "</td>" +
                "<td>" +
                    OutputChanceOfR +
                "</td>" +
            "</tr>" +
            "<tr>" +
                "<td class='leftTd'>" +
                    "Wind Speed" +
                "</td>" +
                "<td>" +
                    OutputWindSpeed + " " + windSpeed_unit +
                "</td>" +
            "</tr>" +
            "<tr class='danger'>" +
                "<td class='leftTd'>" +
                    "Dew Point" +
                "</td>" +
                "<td>" +
                    OutputDewPoint + unit +
                "</td>" +
            "</tr>" +
            "<tr>" +
                "<td class='leftTd'>" +
                    "Humidity" +
                "</td>" +
                "<td>" +
                    OutputHumidity +
                "</td>" +
            "</tr>" +
            "<tr class='danger'>" +
                "<td class='leftTd'>" +
                    "Visibility" +
                "</td>" +
                "<td>" +
                    OutputVisibility + " " +visibility_unit +
                "</td>" +
            "</tr>" +
            "<tr>" +
                "<td class='leftTd'>" +
                    "Sunrise" +
                "</td>" +
                "<td>" +
                    SunriseTime +
                "</td>" +
            "</tr>" +
            "<tr class='danger'>" +
                "<td class='leftTd'>" +
                    "Sunset" +
                "</td>" +
                "<td>" +
                    SunsetTime +
                "</td>" +
            "</tr>" +
        "</table>" +
    "</div>" +
        // following div to add map
    "<div class='col-md-6' id='DivMapR6ID'>" +
        "<div id='map'>" +
        "</div>" +
    "</div>";

    //second tab content
    var time = new Array(24);
    var summaryArray = new Array(24);
    var SummaryIconArray = new Array(24);
    var cloudCoverArray = new Array(24);
    var tempArray = new Array(24);
    var viewDetails = "<span class='glyphicon glyphicon-plus'></span>";
    var windArray = new Array(24);
    var HumidityArray = new Array(24);
    var VisibilityArray = new Array(24);
    var PressureArray = new Array(24);

    var LoopPartArray = [];
    for(var i = 0; i < 24; i++ ){
        time[i] = phpReturn.hourly.data[i+1].time;
        var DateTimeHourMinute = moment.unix(time[i]).tz(timezone).format('hh:mm A');
        summaryArray[i] = phpReturn.hourly.data[i+1].icon;
        SummaryIconArray[i] = get(summaryArray[i]);
        cloudCoverArray[i] = Math.round(phpReturn.hourly.data[i+1].cloudCover * 100);
        tempArray[i] = (phpReturn.hourly.data[i+1].temperature).toFixed(2);
        windArray[i] = (phpReturn.hourly.data[i+1].windSpeed).toFixed(2);
        HumidityArray[i] = Math.round(phpReturn.hourly.data[i+1].humidity * 100);
        VisibilityArray[i] = (phpReturn.hourly.data[i+1].visibility).toFixed(2);
        PressureArray[i] = phpReturn.hourly.data[i+1].pressure;
        LoopPartArray[i] = "";
        LoopPartArray[i] +=
            "<tr>" +
                "<td>" +
                    DateTimeHourMinute +
                "</td>" +
                "<td>" +
                    "<img class='Next24HoursImg' alt='" + summaryArray[i] +"'src='http://cs-server.usc.edu:45678/hw/hw8/images/" + SummaryIconArray[i] +"'>" +
                "</td>" +
                "<td>" +
                    cloudCoverArray[i] + "%" +
                "</td>" +
                "<td>" +
                    tempArray[i] +
                "</td>" +
                "<td>" +
                    "<a href='#collapse" + i +"' data-toggle='collapse' aria-expanded='false'>" +viewDetails + "</a>" +
                "</td>" +
            "</tr>" +
            "<tr id='collapse"+ i +"' class='collapse out'>" +
                "<td id='TdCollapseID' colspan='5'>" +
                    "<div class='collapsePart'>" +
                        "<table class='TableCollapseResponsiveID table table-responsive'>" +
                            "<thead>" +
                                "<tr class='TrViewDetailsShowID'>" +
                                    "<th>" +
                                        "Wind" +
                                    "</th>" +
                                    "<th>" +
                                        "Humidity" +
                                    "</th>" +
                                    "<th>" +
                                        "Visibility" +
                                    "</th>" +
                                    "<th>" +
                                        "Pressure" +
                                    "</th>" +
                                "</tr>" +
                            "</thead>" +
                            "<tbody>" +
                                "<tr class='TrViewDetailsBodyID'>" +
                                    "<td>" +
                                        windArray[i] + windSpeed_unit +
                                    "</td>" +
                                    "<td>" +
                                        HumidityArray[i] + "%" +
                                    "</td>" +
                                    "<td>" +
                                        VisibilityArray[i] + visibility_unit +
                                    "</td>" +
                                    "<td>" +
                                        PressureArray[i] + pressure_unit +
                                    "</td>" +
                                "</tr>" +
                            "</tody>" +
                        "</table>" +
                    "</div>" +
                "</td>" +
            "</tr>";
    }

    Next24HoursTable +=
    "<div class='tab-content' id='DivNext24HoursTabID'>" +
        "<div role='tabpanel' class='tab-pane active' id='Next24Hours'>" +
            "<table class='table table-responsive' id='Table24HoursID'>" +
                "<thead>" +
                    "<tr id='Tr24TableID'>" +
                        "<th class='headFor24' style='vertical-align: top'>" +
                            "Time" +
                        "</th>" +
                        "<th class='headFor24' style='vertical-align: top'>" +
                            "Summary" +
                        "</th>" +
                        "<th class='headFor24' style='vertical-align: top'>" +
                            "Cloud" + " " + "Cover" +
                        "</th>" +
                        "<th class='headFor24' style='vertical-align: top'>" +
                            "Temp" + " (" + unit + ")" +
                        "</th>" +
                        "<th class='headFor24' style='vertical-align: top'>" +
                            "View"+ " " + "Details" +
                        "</th>" +
                    "</tr>" +
                    "<tr name='DivideTheadAndTbody'>" +
                        "<td>" +
                            "<div>" +
                                //leave for blank line..
                            "</div>" +
                        "</td>" +
                    "</tr>" +
                "</thead>" +
                "<tbody id='TbodyBiggerID'>" + LoopPartArray.join("") + "</tbody>" + "</table>" + "</div>" + "</div>";

    //the third tab
    var monthNameArray = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    var Loop7DaysPart = new Array(7);
    for(var j = 0; j < 7; j++){
        var dailyData = phpReturn.daily.data[j+1];
        var weekTime = dailyData.time;
        var day_value = moment.unix(weekTime).tz(timezone).format('dddd');
        var monthDate_value = moment.unix(weekTime).tz(timezone).format('MMM D');

        var iconTab3 = dailyData.icon;
        var iconImageTab3 = get(iconTab3);
        var minTempTab3 = Math.round(dailyData.temperatureMin);
        var maxTempTab3 = Math.round(dailyData.temperatureMax);
        var originSunriseTime = dailyData.sunriseTime;
        var originSunsetTime = dailyData.sunsetTime;
        var Sunrise_7days = moment.unix(originSunriseTime).tz(timezone).format('hh:mm A');
        var Sunset_7days  = moment.unix(originSunsetTime).tz(timezone).format('hh:mm A');
        var humidity_Modal= dailyData.humidity;
        var OutputHumidity_Modal = Math.round(humidity_Modal * 100) + "%";
        var windspeed_Modal = (dailyData.windSpeed).toFixed(2);
        var visibility_Modal = dailyData.visibility;
        var OutputVisibility_Modal = "";
        if(visibility_Modal == null){
            OutputVisibility_Modal = "N.A";
        }
        else{
            OutputVisibility_Modal = visibility_Modal.toFixed(2) + visibility_unit;
        }
        var pressure_Modal = (dailyData.pressure).toFixed(2);
        Loop7DaysPart[j] = "";
    //each modal has 1 column
        Loop7DaysPart[j] += "<div class='col-md-1 sevenModalsMd1'>";
    //div trigger modal
        Loop7DaysPart[j] +=     "<div class='SevenModalsClass img-rounded' data-toggle='modal' data-target='#Modal" + j + "' id='SevenModal" + j +"ID'>";
        Loop7DaysPart[j] +=         "<table class='SevenModalTable'><tbody style='padding-right: 0px'>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<p class='pDateInMadal'>" + day_value + "</p>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<p class='pDateInMadal'>" + monthDate_value + "</p>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<img class='Next7DaysImg'  src='http://cs-server.usc.edu:45678/hw/hw8/images/" + iconImageTab3 + "' alt='"+ iconTab3 + "'>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<p class='pTextOfTempInMadal'>Min</p><p class='pTextOfTempInMadal'>Temp</p>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<p class='pNumOfTempInMadal'>" + minTempTab3 + "<span>" +"&#176; " + "</span>" + "</p>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<p class='pTextOfTempInMadal'>Max</p><p class='pTextOfTempInMadal'>Temp</p>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=             "<tr><td>";
        Loop7DaysPart[j] +=                 "<p class='pNumOfTempInMadal'>" + maxTempTab3 + "<span>" +"&#176; " + "</span>" + "</p>";
        Loop7DaysPart[j] +=             "</td></tr>";
        Loop7DaysPart[j] +=         "</tbody></table>";
        Loop7DaysPart[j] +=     "</div>";
    //Modal part
        Loop7DaysPart[j] +=     "<div class='modal fade' id='Modal" + j +"' tabindex='-1' role='dialog' aria-labelledby='SevenModalLabel'>";
        Loop7DaysPart[j] +=         "<div class='modal-dialog' role='document'>";
        Loop7DaysPart[j] +=             "<div class='modal-content'>";
        Loop7DaysPart[j] +=                 "<div class='modal-header'>";
        Loop7DaysPart[j] +=                     "<button type='button' class='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>";
        Loop7DaysPart[j] +=                     "<h4 class='modal-title' id='OneDayModalLabel'" + j + "'>" + "Weather in " + $city + " on " + monthDate_value + "</h4>";
        Loop7DaysPart[j] +=                 "</div>";
        Loop7DaysPart[j] +=                 "<div class='modal-body'>";
        Loop7DaysPart[j] +=                     "<div class='row' style='text-align: center'>";
        Loop7DaysPart[j] +=                         "<div class='col-md-12'>" +
                                                        "<img class='Next7DaysModalImg'  src='http://cs-server.usc.edu:45678/hw/hw8/images/" + iconImageTab3 + "' alt='"+ iconTab3 + "'>" +
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='blackyellow col-md-12'>" +
                                                        "<p style='font-size: 28px'>" + day_value + ": " + "<span style='color: orange'>" + iconTab3 + " throughout the day." + "</span>" + "</p>" +
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='col-md-4'>" +
                                                        "<p class='ModalTitleText'>Sunrise Time</p>" + "<p>" + Sunrise_7days + "AM</p>" +
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='col-md-4'>" +
                                                        "<p class='ModalTitleText'>Sunset Time</p>" + "<p>" + Sunset_7days + "PM</p>" +
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='col-md-4'>" +
                                                        "<p class='ModalTitleText'>Humidity</p>" + "<p>" + OutputHumidity_Modal + "</p>"+
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='col-md-4'>" +
                                                        "<p class='ModalTitleText'>Wind Speed</p>" + "<p>" +windspeed_Modal + windSpeed_unit + "</p>"+
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='col-md-4'>" +
                                                        "<p class='ModalTitleText'>Visibility</p>" + "<p>" + OutputVisibility_Modal + "</p>" +
                                                    "</div>";
        Loop7DaysPart[j] +=                         "<div class='col-md-4'>" +
                                                        "<p class='ModalTitleText'>Pressure</p>" + "<p>" + pressure_Modal + pressure_unit + "</p>" +
                                                    "</div>";
        Loop7DaysPart[j] +=                     "</div>";
        Loop7DaysPart[j] +=                 "</div>";
        Loop7DaysPart[j] +=                 "<div class='modal-footer'>";
        Loop7DaysPart[j] +=                     "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>";
        Loop7DaysPart[j] +=                 "</div>";
        Loop7DaysPart[j] +=             "</div>";
        Loop7DaysPart[j] +=         "</div>";
        Loop7DaysPart[j] +=     "</div>";
    //column ends
        Loop7DaysPart[j] += "</div>";
    }

    Next7DaysModal +=
        "<div class='tab-content' id='DivNext7DaysTabID'>" +
            "<div role='tabpanel' class='tab-pane active' id='Next7Days'>" +
                "<div id='Div7DaysContainer'>" +
                    "<div id='Div7DaysRow' class='row'>" +
                        "<div id='DivLeftEmpty2ID' class='col-md-2'>" +
                        "</div>";
    Next7DaysModal += Loop7DaysPart.join("");
            //need to add 7 div
    Next7DaysModal +=
                    "</div>" +
                "</div>" +
            "</div>" +
        "</div>";

//start tab part
    TabPart +=
        "<ul class='nav nav-tabs' role='tablist'>" +
            "<li role='presentation' class='active'>" +
                "<a href='#RightNow' role='tab' aria-controls='Right Now' data-toggle='tab'>Right Now</a>" +
            "</li>" +
            "<li role='presentation'>" +
                "<a href='#Next24Hours' role='tab' aria-controls='Next 24 Hours' data-toggle='tab'>Next 24 Hours</a>" +
            "</li>" +
            "<li role='presentation'>" +
                "<a href='#Next7Days' role='tab' aria-controls='Next 7 Days' data-toggle='tab'>Next 7 Days</a>" +
            "</li>" +
        "</ul>";
    LeftPart +=
        "<div class='row' id='DivRowBelowUlID'>" +
                //Followed by Tab panes div
            "<div class='tab-content'>" +
                "<div role='tabpanel' class='tab-pane active' id='RightNow'>" +
                    RightNowTable +
                "</div>" +
                "<div role='tabpanel' class='tab-pane' id='Next24Hours'>" +
                    Next24HoursTable +
                "</div>" +
                "<div role='tabpanel' class='tab-pane' id='Next7Days'>" +
                    Next7DaysModal +
                "</div>" +
            "</div>" +
        "</div>";
    $("#DivLeftPartID").html(TabPart+LeftPart);
    $("body").attr('onload',init());
}