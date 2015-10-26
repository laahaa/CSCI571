<!DOCTYPE html>
<html>
    <head>
        <style type="text/css">
            div.whole{
                margin-top: 5px;
            }
            div.header{
                margin: auto;
                text-align: center;
                margin-top: 20px;
            }
            h1.title{
                margin: auto;
            }
            div.content{
                margin-top: 22px;
                border: solid;
                border-width: 2px;
                width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            table.table{
                width: auto;
                border: hidden;
                padding-top: 10px;
            }
            p.info{
                padding-left: 20px;
                margin-top: 1px;
                margin-bottom: 2px;
            }
            p.sp{
                padding-left: 20px;
                font-style:italic;
            }
            td.link{
                text-align: center;
                height: 15px;
            }
            p.thelink{
                margin-top: 1px;
                margin-bottom: 12px;
            }
            div.search{
                margin-top: 40px;
                border: solid;
                border-width: 2px;
                width: 500px;
                margin-left: auto;
                margin-right: auto;
            }
            table.result{
                width: 500px;
                border: hidden;
                padding-top: 20px;
                padding-bottom: 26px;
            }
            tr.result{
                height: auto;
                text-align: center;
            }
            tr.result b{
                font-size: 20px;
            }
            tr.result img{
                width: 114px;
            }
            td.left{
                text-align: center;
            }
        </style>
        <script type="text/javascript">
            function inputValidation() {
                var street_address = document.getElementById("StreetAddress").value;
                var city = document.getElementById("City").value;
                var state = document.getElementById("State");
                var index = state.selectedIndex;
                var stateOpt = state.options[index].value;
                if (street_address == ""){
                    alert("Please enter value for Street Address");
                    return false;
                }
                if (city == ""){
                    alert("Please enter value for City");
                    return false;
                }
                if(stateOpt == ""){
                    alert("Please Select your state");
                    return false;
                }
            }
            function clearInput(){
                var street_address = document.getElementById("StreetAddress");
                street_address.removeAttribute("value");
                var city = document.getElementById("City");
                city.removeAttribute("value");
                var state = document.getElementById("State");
                var stateOpt =state.options[state.selectedIndex];
                stateOpt.removeAttribute("selected");
                var stateDefault = state.options[0];
                stateDefault.setAttribute("selected","");
                var temperature_F = document.getElementById("Fahrenheit");
                var temperature_C = document.getElementById("Celsius");
                temperature_C.removeAttribute("checked");
                var searchResult = document.getElementById("searchResult");
                var sR_parent = searchResult.parentNode;
                sR_parent.removeChild(searchResult);
            }
        </script>
    </head>
    <body>
    <?php
    $streetAddress="";
    $city = "";
    $state = "";
    $Fahrenheit_status = "checked";
    $Celsius_status = "unchecked";
    if(isset($_POST["submit"])) {
        $streetAddress = $_POST["StreetAddress"];
        $city = $_POST["City"];
        $state = $_POST["State"];
        $degree = $_POST["temperature"];
        if($degree == "Fahrenheit"){
            $Fahrenheit_status = "checked";
            $units_value = "us";
            $unit = "&#176;F";
            $windSpeed_unit = "mph";
            $visibility_unit = "mi";
        }
        else if($degree == "Celsius"){
            $Celsius_status = "checked";
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
        $forecastJson = json_decode($forecastURLContent);
        $timeZone = $forecastJson->timezone;
        date_default_timezone_set($timeZone);
        $Weather_Condition = $forecastJson->currently->summary;
        $Temperature = $forecastJson->currently->temperature;
        $temperature = round($Temperature);
        $Icon_Value = $forecastJson->currently->icon;
        $IconArray = array(
            "clear-day"=>"clear.png",
            "clear-night"=>"clear_night.png",
            "rain"=>"rain.png",
            "snow"=>"snow.png",
            "sleet"=>"sleet.png",
            "wind"=>"wind.png",
            "fog"=>"fog.png",
            "cloudy"=>"cloudy.png",
            "partly-cloudy-day"=>"cloud_day.png",
            "partly-cloudy-night"=>"cloud_night.png"
        );
        $Precipitation = $forecastJson->currently->precipIntensity;
        $precipitation = "0";
        if($degree == "Celsius"){
            $Precipitation /=25.4;
        }
        if($Precipitation < 0.002 && $Precipitation >= 0){
            $precipitation = "0";
        }
        else if($Precipitation >= 0.002 && $Precipitation < 0.017){
            $precipitation = "0.002";
        }
        else if($Precipitation >= 0.017 && $Precipitation < 0.1){
            $precipitation = "0.017";
        }
        else if($Precipitation >= 0.1 && $Precipitation < 0.4){
            $precipitation = "0.1";
        }
        else{
            $precipitation = "0.4";
        }
        $PrecipitationArray = array(
            "0"=>"None",
            "0.002"=>"Very Light",
            "0.017"=>"Light",
            "0.1"=>"Moderate",
            "0.4"=>"Heavy",
        );
        $Chance_Of_Rain = $forecastJson->currently->precipProbability;
        $RainPercentage = $Chance_Of_Rain*100;
        $Wind_Speed = $forecastJson->currently->windSpeed;
        $windSpeed = round($Wind_Speed);
        $Dew_Point = $forecastJson->currently->dewPoint;
        $dewPoint = round($Dew_Point);
        $Humidity = $forecastJson->currently->humidity;
        $humidity = $Humidity*100;
        $Visibility = $forecastJson->currently->visibility;
        $visibility = round($Visibility);
        $Sunrise = $forecastJson->daily->data[0]->sunriseTime;
        $Sunset = $forecastJson->daily->data[0]->sunsetTime;
        $SunriseConvert = date('h:i A',$Sunrise);
        $SunsetConvert = date('h:i A',$Sunset);
    }
    ?>
        <div class="whole">
            <div class="header">
                <h1 class="title">Forecast Search</h1>
            </div>
            <div class="content">
            <form id="theForm" name="threeInfo" onsubmit="inputValidation()" method="post" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>">
                <table class="table" valign="middle">
                    <tr>
                        <td>
                            <p class="info">Street Address:*</p>
                        </td>
                        <td>
                            <input type="text" id="StreetAddress" name="StreetAddress" value="<?php echo $streetAddress; ?>" />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="info">City:*</p>
                        </td>
                        <td>
                            <input type="text" id="City" name="City" value="<?php echo $city; ?>"/>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="info">State:*</p>
                        </td>
                        <td>
                            <select id="State" name="State">
                                <option value=""<?php if($state == ""){echo "selected";}; ?>>Select your state...</option>
                                <option value="AL"<?php if($state == "AL"){echo "selected";}; ?>>Alabama</option>
                                <option value="AK"<?php if($state == "AK"){echo "selected";}; ?>>Alaska</option>
                                <option value="AZ"<?php if($state == "AZ"){echo "selected";}; ?>>Arizona</option>
                                <option value="AR"<?php if($state == "AR"){echo "selected";}; ?>>Arkansas</option>
                                <option value="CA"<?php if($state == "CA"){echo "selected";}; ?>>California</option>
                                <option value="CO"<?php if($state == "CO"){echo "selected";}; ?>>Colorado</option>
                                <option value="CT"<?php if($state == "CT"){echo "selected";}; ?>>Connecticut</option>
                                <option value="DE"<?php if($state == "DE"){echo "selected";}; ?>>Delaware</option>
                                <option value="DC"<?php if($state == "DC"){echo "selected";}; ?>>District of Columbia</option>
                                <option value="FL"<?php if($state == "FL"){echo "selected";}; ?>>Florida</option>
                                <option value="GA"<?php if($state == "GA"){echo "selected";}; ?>>Georgia</option>
                                <option value="HI"<?php if($state == "HI"){echo "selected";}; ?>>Hawaii</option>
                                <option value="ID"<?php if($state == "ID"){echo "selected";}; ?>>Idaho</option>
                                <option value="IL"<?php if($state == "IL"){echo "selected";}; ?>>Illinois</option>
                                <option value="IN"<?php if($state == "IN"){echo "selected";}; ?>>Indiana</option>
                                <option value="IA"<?php if($state == "IA"){echo "selected";}; ?>>Iowa</option>
                                <option value="KS"<?php if($state == "KS"){echo "selected";}; ?>>Kansas</option>
                                <option value="KY"<?php if($state == "KY"){echo "selected";}; ?>>Kentucky</option>
                                <option value="LA"<?php if($state == "LA"){echo "selected";}; ?>>Louisiana</option>
                                <option value="ME"<?php if($state == "ME"){echo "selected";}; ?>>Maine</option>
                                <option value="MD"<?php if($state == "MD"){echo "selected";}; ?>>Maryland</option>
                                <option value="MA"<?php if($state == "MA"){echo "selected";}; ?>>Massachusetts</option>
                                <option value="MI"<?php if($state == "MI"){echo "selected";}; ?>>Michigan</option>
                                <option value="MN"<?php if($state == "MN"){echo "selected";}; ?>>Minnesota</option>
                                <option value="MS"<?php if($state == "MS"){echo "selected";}; ?>>Mississippi</option>
                                <option value="MO"<?php if($state == "MO"){echo "selected";}; ?>>Missouri</option>
                                <option value="MT"<?php if($state == "MT"){echo "selected";}; ?>>Montana</option>
                                <option value="NE"<?php if($state == "NE"){echo "selected";}; ?>>Nebraska</option>
                                <option value="NV"<?php if($state == "NV"){echo "selected";}; ?>>Nevada</option>
                                <option value="NH"<?php if($state == "NH"){echo "selected";}; ?>>New Hampshire</option>
                                <option value="NJ"<?php if($state == "NJ"){echo "selected";}; ?>>New Jersey</option>
                                <option value="NM"<?php if($state == "NM"){echo "selected";}; ?>>New Mexico</option>
                                <option value="NY"<?php if($state == "NY"){echo "selected";}; ?>>New York</option>
                                <option value="NC"<?php if($state == "NC"){echo "selected";}; ?>>North Carolina</option>
                                <option value="ND"<?php if($state == "ND"){echo "selected";}; ?>>North Dakota</option>
                                <option value="OH"<?php if($state == "OH"){echo "selected";}; ?>>Ohio</option>
                                <option value="OK"<?php if($state == "OK"){echo "selected";}; ?>>Oklahoma</option>
                                <option value="OR"<?php if($state == "OR"){echo "selected";}; ?>>Oregon</option>
                                <option value="PA"<?php if($state == "PA"){echo "selected";}; ?>>Pennsylvania</option>
                                <option value="RI"<?php if($state == "RI"){echo "selected";}; ?>>Rhode Island</option>
                                <option value="SC"<?php if($state == "SC"){echo "selected";}; ?>>South Carolina</option>
                                <option value="SD"<?php if($state == "SD"){echo "selected";}; ?>>South Dakota</option>
                                <option value="TN"<?php if($state == "TN"){echo "selected";}; ?>>Tennessee</option>
                                <option value="TX"<?php if($state == "TX"){echo "selected";}; ?>>Texas</option>
                                <option value="UT"<?php if($state == "UT"){echo "selected";}; ?>>Utah</option>
                                <option value="VT"<?php if($state == "VT"){echo "selected";}; ?>>Vermont</option>
                                <option value="VA"<?php if($state == "VA"){echo "selected";}; ?>>Virginia</option>
                                <option value="WA"<?php if($state == "WA"){echo "selected";}; ?>>Washington</option>
                                <option value="WV"<?php if($state == "WV"){echo "selected";}; ?>>West Virginia</option>
                                <option value="WI"<?php if($state == "WI"){echo "selected";}; ?>>Wisconsin</option>
                                <option value="WY"<?php if($state == "WY"){echo "selected";}; ?>>Wyoming</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p class="info">Degree:*</p>
                        </td>
                        <td>
                            <input type="radio" id="Fahrenheit" name="temperature" value="Fahrenheit" <?php echo $Fahrenheit_status; ?> />Fahrenheit
                            <input type="radio" id="Celsius" name="temperature" value="Celsius" <?php echo $Celsius_status; ?>/>Celsius<br/>
                        </td>
                    </tr>
            </form>
                    <tr>
                        <td></td>
                        <td>
                            <input type="submit" name="submit" value="Search" onclick="return inputValidation()" />
                            <input type="reset" value="Clear" onclick="clearInput()"/>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <p class="sp">* - Mandatory fields</p>
                        </td>
                    </tr>
                    <tr>
                        <td></td>
                        <td class="link">
                            <a href="http://forecast.io/"><p class="thelink">Powered by Forecast.io</p></a>
                        </td>
                    </tr>
                </table>
            </div>
            <?php
            if(isset($_POST["submit"])){
                echo "<div id='searchResult' class='search'><table class='result'>";
                    echo "<tr class='result'><td colspan='2'><b>".$Weather_Condition."</b></td></tr>";
                    echo "<tr class='result'><td colspan='2'><b>".$temperature.$unit."</b></td></tr>";
                    echo "<tr class='result'><td colspan='2'>"."<img title=$Icon_Value src=".$IconArray[$Icon_Value].">"."</td></tr>";
                    echo "<tr><td class='left'>"."Precipitation"."</td><td>".$PrecipitationArray[$precipitation]."</td></tr>";
                    echo "<tr><td class='left'>"."Chance of Rain"."</td><td>".$RainPercentage."%"."</td></tr>";
                    echo "<tr><td class='left'>"."Wind Speed"."</td><td>".$windSpeed." ".$windSpeed_unit."</td></tr>";
                    echo "<tr><td class='left'>"."Dew Point"."</td><td>".$dewPoint.$unit."</td></tr>";
                    echo "<tr><td class='left'>"."Humidity"."</td><td>".$humidity."%"."</td></tr>";
                    echo "<tr><td class='left'>"."Visibility"."</td><td>".$visibility." "."$visibility_unit"."</td></tr>";
                    echo "<tr><td class='left'>"."Sunrise"."</td><td>".$SunriseConvert."</td></tr>";
                    echo "<tr><td class='left'>"."Senset"."</td><td>".$SunsetConvert."</td></tr>";
                echo "</table></div>";
            }
            ?>
        </div>
    <noncript>
    </body>
</html>