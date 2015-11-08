$.validator.addMethod("NoSpace",function(value,element){
    return this.optional(element) || value.trim().length !== 0;
});

$().ready(function(){
    var validator = $("#FormID").validate({
        rules:{
            StreetAddress:{
                NoSpace :true,
                required:true
            },
            City: {
                NoSpace :true,
                required:true
            },
            State:{
                required:true
            }
        },
        messages:{
            StreetAddress:"Please enter the street address",
            City:"Please enter the city",
            State:"Please select a state"
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
                url  : "forecastEight.php",
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
                    console.log(phpReturn);
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
    var iconValue        = phpReturn.currently.icon;
        var iconMap      = new Object();
    var weatherCondition = phpReturn.currently.summary;
    var $city            = $("#City").val();
    var $state           = $("#State").val();
    var temperature      = phpReturn.currently.temperature;
    var IntTemperature   = Math.round(temperature);
    var lowTemperature   = phpReturn.daily.data[0].temperatureMin;
    var highTemperature  = phpReturn.daily.data[0].temperatureMax;
    var precipitation    = phpReturn.currently.precipIntensity;
    var precipDisplay    = "";
    var chanceOfRain     = phpReturn.currently.precipProbability;
    var OutputChanceOfR  = chanceOfRain*100 + "%";
    var windSpeed        = phpReturn.currently.windSpeed;
    var OutputWindSpeed  = windSpeed.toFixed(2);
    var dewPoint         = phpReturn.currently.dewPoint;
    var OutputDewPoint   = dewPoint.toFixed(2);
    var humidity         = phpReturn.currently.humidity;
    var OutputHumidity   = Math.round(humidity) + "%";
    var visibility       = phpReturn.currently.visibility;
    var OutputVisibility = visibility.toFixed(2);
    var sunrise          = phpReturn.daily.data[0].sunriseTime;
    var sunset           = phpReturn.daily.data[0].sunsetTime;
    var NormalSunrise    = new Date(sunrise*1000);
    var NormalSunset     = new Date(sunset*1000);
    var RiseHour         = NormalSunrise.getHours();
    if(RiseHour < 10){
        RiseHour = '0' + RiseHour;
    }
    var RiseMinute       = NormalSunrise.getMinutes();
    if(RiseMinute < 10){
        RiseMinute = '0' + RiseMinute;
    }
    var SetHour          = NormalSunset.getHours()-12;

    if(SetHour < 10){
        SetHour = '0' + SetHour;
    }
    var SetMinute        = NormalSunset.getMinutes();
    if(SetMinute < 10){
        SetMinute = '0' + SetMinute;
    }
    var SunriseTime      = RiseHour + ":" + RiseMinute +" AM";
    var SunsetTime       = SetHour + ":" + SetMinute +" PM";

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

    if($("#Fahrenheit").is(":checked")){
        var degree          = $("#Fahrenheit").val();
        var unit            = "&#176;F";
        var unitOnlyLetter  = "F";
        var windSpeed_unit  = "mph";
        var visibility_unit = "mi";
        var pressure_unit   = "mb";
    }
    else{
        degree          = $("#Celsius").val();
        unit            = "&#176;C";
        unitOnlyLetter  = "F";
        windSpeed_unit  = "m/s";
        visibility_unit = "km";
        pressure_unit   = "hPa";
    }

    if(degree == "Celsius"){
        precipitation /=25.4;
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

    //build the map
    //Center of map
    var mapCenter = new OpenLayers.LonLat(longtitude,latitude);
    var map = new OpenLayers.Map("basicMap");

    //setCenter has a 'typeError' in OpenLayer.js
    //map.setCenter(mapCenter);
    //have to change a lot....learn from source code..
    // Create OSM overlays
    var mapnik = new OpenLayers.Layer.OSM();
    //add cloud layer
    var layer_cloud = new OpenLayers.Layer.XYZ(
        "clouds",
        "http://${s}.tile.openweathermap.org/map/clouds/${z}/${x}/${y}.png",
        {
            isBaseLayer: false,
            opacity: 0.7,
            sphericalMercator: true
        }
    );
    //add precipitation layer
    var layer_precipitation = new OpenLayers.Layer.XYZ(
        "precipitation",
        "http://${s}.tile.openweathermap.org/map/precipitation/${z}/${x}/${y}.png",
        {
            isBaseLayer: false,
            opacity: 0.7,
            sphericalMercator: true
        }
    );
    map.addLayers([mapnik, layer_precipitation, layer_cloud]);

    // set the div of result..
    var TabPart   = "";
    var LeftPart  = "";
    var RightNowTable = "";
    var Next24HoursTable = "";
    var Next7DaysModal = "";

    RightNowTable +=
    "<div class='col-md-6' id='DivRightNowL6ID'>" +
        "<div class='row' id='DivIconAndWeatherID'>" +
            "<div class='col-md-6' id='DivIconID'>" +
                "<img alt='"+iconValue+"' id='DisplayedIconID' src='http://cs-server.usc.edu:45678/hw/hw8/images/" + iconName +"'>" +
            "</div>" +
            "<div class='col-md-6' id='Div3PartsID'>" +
                "<div id='Div3UpID'>" +
                    "<p id='PWeatherConditionID'>" + weatherCondition + ' in ' +$city + ', ' + $state + "</p>" +
                "</div>"+
                "<div id='Div3MiddleID'>" +
                    "<p id='P3MiddleID'><b id='BigNumberID'>" + IntTemperature +"</b><span>" +"&#176; " + unitOnlyLetter + "</span>" + "</p>" +
                "</div>" +
                "<div id='Div3BottomID'>" +
                    "<p><span style='color: blue'>" + "L:" + lowTemperature + "&#176;</span>" + " | " + "<span style='color: green'>" +"H:" + highTemperature + "&#176;</span></p>" +
                "</div>" +
            "</div>" +
        "</div>" +
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
        // following div to add map ...need to watch the source code..
    "<div class='col-md-6' id='DivMapR6ID'>" +
        "<div id='OpenLayerMap' class='rightMap'>" +
            "Here is a Map.." +
        "</div>" +
    "</div>";

    //second tab content
    var time = new Array(24);
    var DateTime = "";
    var DateTimeHour = "";
    var DateTimeMinute = "";
    var summaryArray = new Array(24);
    var SummaryIconArray = new Array(24);
    var cloudCoverArray = new Array(24);
    var tempArray = new Array(24);
    var viewDetails = "<span class='glyphicon glyphicon-plus'></span>";
    var windArray = new Array(24);
    var HumidityArray = new Array(24);
    var VisibilityArray = new Array(24);
    var PressureArray = new Array(24);

    var LoopPartArray = new Array(24);

    for(var i = 0; i < 6; i++ ){
        time[i] = phpReturn.hourly.data[i+1].time;
        DateTime = new Date(time[i]*1000);
        DateTimeHour = DateTime.getHours();
        if(DateTimeHour < 10){
            DateTimeHour = '0' + DateTimeHour;
        }
        DateTimeMinute = DateTime.getMinutes();
        if(DateTimeMinute < 10 && DateTimeHour < 12){
            DateTimeMinute = '0' + DateTimeMinute + " AM";
        }
        else{
            DateTimeMinute = '0' + DateTimeMinute + " PM";
        }
        summaryArray[i] = phpReturn.hourly.data[i+1].icon;
        SummaryIconArray[i] = get(summaryArray[i]);
        cloudCoverArray[i] = Math.round(phpReturn.hourly.data[i+1].cloudCover * 100);
        tempArray[i] = (phpReturn.hourly.data[i+1].temperature).toFixed(2);
        windArray[i] = phpReturn.hourly.data[i+1].windSpeed;
        HumidityArray[i] = phpReturn.hourly.data[i+1].humidity * 100;
        VisibilityArray[i] = phpReturn.hourly.data[i+1].visibility;
        PressureArray[i] = phpReturn.hourly.data[i+1].pressure;

        LoopPartArray[i] +=
            "<tr>" +
                "<td>" +
                    DateTimeHour + ":" + DateTimeMinute +
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
    "<div class='tab-content container' id='DivNext24HoursTabID'>" +
        "<div role='tabpanel' class='tab-pane active' id='Next24Hours'>" +
            "<table class='table table-responsive' id='Table24HoursID'>" +
                "<thead>" +
                    "<tr id='Tr24TableID'>" +
                        "<th class='headFor24'>" +
                            "Time" +
                        "</th>" +
                        "<th class='headFor24'>" +
                            "Summary" +
                        "</th>" +
                        "<th class='headFor24'>" +
                            "Cloud" + " " + "Cover" +
                        "</th>" +
                        "<th class='headFor24'>" +
                            "Temp" + " (" + unit + ")" +
                        "</th>" +
                        "<th class='headFor24'>" +
                            "View"+ " " + "Details" +
                        "</th>" +
                    "</tr>" +
                    "<tr name='DivideTheadAndTbody'>" +
                        "<td>" +
                            "<div>" +

                            "</div>" +
                        "</td>" +
                    "</tr>" +
                "</thead>" +
                "<tbody id='TbodyBiggerID'>" + LoopPartArray + "</tbody>" + "</table>" + "</div>";


    Next7DaysModal +=
        "";
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
                "<a href='#Next 7 Days' role='tab' aria-controls='Next 7 Days' data-toggle='tab'>Next 7 Days</a>" +
            "</li>" +
        "</ul>";
    LeftPart +=
        "<div class='row'>" +
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
}
