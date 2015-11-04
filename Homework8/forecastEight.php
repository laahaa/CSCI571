<?php
    $streetAddress = $_GET["StreetAddress"];
    $city = $_GET["City"];
    $state = $_GET["State"];
    $degree = $_GET["Degree"];
    if($degree == "Fahrenheit"){
        $units_value = "us";
        $unit = "&#176;F";
        $windSpeed_unit = "mph";
        $visibility_unit = "mi";
    }
    else if($degree == "Celsius"){
        $units_value = "si";
        $unit = "&#176;C";
        $windSpeed_unit = "m/s";
        $visibility_unit = "km";
    }
    $enstreetAddress = urlencode($streetAddress);
    $encity = urlencode($city);
    $enstate = urlencode($state);
    $URL = "https://maps.google.com/maps/api/geocode/xml?address=$enstreetAddress,$encity,$enstate&key=AIzaSyAnjWrqvTMsiGTVSLZ2OCFbTP7oE-t4Eqs";
    $urlContent = file_get_contents($URL);
    $xmlFile = simplexml_load_string($urlContent);
    $latitude = $xmlFile->result->geometry->location->lat;
    $longitude = $xmlFile->result->geometry->location->lng;

    $forecastURL = "https://api.forecast.io/forecast/9a62281bfd08a550fd42ac58f6419c86/$latitude,$longitude?units=$units_value&exclude=flags";
    $forecastURLContent = file_get_contents($forecastURL);

    $forecastJson = json_encode($forecastURLContent); //in HW6 is decode..

//    echo $latitude;
    echo ($forecastJson);
//    echo json file..
?>