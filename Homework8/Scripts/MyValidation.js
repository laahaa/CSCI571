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

//function ShowWeather(phpReturn){
//    alert("can use this method");
//}
