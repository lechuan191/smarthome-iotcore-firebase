var db = firebase.firestore();
var ledPK, ledPN, ledTL,ledPB,fan1, fan2;

$(document).ready(function(){
  db.collection("device-configs").doc("device-control").onSnapshot(function(doc) {
      
    ledPK=doc.data().led1;
    ledPN=doc.data().led2;
    ledPB=doc.data().led3;
    ledTL=doc.data().led4;
    fan1=doc.data().fan1;
    fan2=doc.data().fan2;
  
  if(ledPK == 1){
    $(".lightStatus").text("Đèn  đang bật");
    $(".lightStatus").css({"color": "green"});
   // $("#console-event").text("The light is on");
    //$('#checkbox1').bootstrapToggle('on');
   //$('#lightButton').text("OFF");
   $('#lightButton').html('<i class="fas fa-power-off"></i>OFF');
   $('#lightButton').addClass("btn-danger").removeClass("btn-success");
   
  //  $("#off").hide();
      //  $("#on").show();
  $("#onPK").addClass('fa-lightbulb-on').removeClass('fa-lightbulb-slash');
  $("#onPK").css({"color": "#f0f595","font-size": "70px"});
  } else {
    $(".lightStatus").text("Đèn đang tắt");
    $(".lightStatus").css({"color": "red"});
    $("#console-event").text("The light is off");
   // $('#checkbox1').bootstrapToggle('off');
  //  $("#on").hide();
  //  $("#off").show();
  $("#onPK").addClass('fa-lightbulb-slash').removeClass('fa-lightbulb-on');

  //$('#lightButton').text("ON");
  $('#lightButton').html('<i class="fas fa-power-off"></i>ON');
   $('#lightButton').addClass("btn-success").removeClass("btn-danger");
   $("#onPK").css({"color": "#343436","font-size": "60px"});
  }
  if(ledPN == 1){
    $(".lightStatus2").text("Đèn đang bật");
    $(".lightStatus2").css({"color": "green"});
    $('#lightButton2').addClass("active").removeClass("disabled");
    $('#lightButton1').addClass("disabled").removeClass("active");
    $("#onPN").addClass('fa-lightbulb-on').removeClass('fa-lightbulb-slash');
    $("#onPN").css({"color": "#fcfb97","font-size": "70px"});
  } else {
    $(".lightStatus2").text("Đèn đang tắt");
    $(".lightStatus2").css({"color": "red"});
    $('#lightButton2').addClass("disabled").removeClass("active");
    $('#lightButton1').addClass("active").removeClass("disabled");
    $("#onPN").addClass('fa-lightbulb-slash').removeClass('fa-lightbulb-on');
    $("#onPN").css({"color": "#343436","font-size": "60px"});
  }

  if(ledPB == 1){
    $(".lightStatus3").text("Đèn đang bật");
    $(".lightStatus3").css({"color": "green"});
    $('#lightButton4').addClass("active").removeClass("disabled");
    $('#lightButton3').addClass("disabled").removeClass("active");
    $("#onPB").addClass('fa-lightbulb-on').removeClass('fa-lightbulb-slash');
    $("#onPB").css({"color": "#fcfb97","font-size": "70px"});
  } else {
    $(".lightStatus3").text("Đèn đang tắt");
    $(".lightStatus3").css({"color": "red"});
    $('#lightButton4').addClass("disabled").removeClass("active");
    $('#lightButton3').addClass("active").removeClass("disabled");
    $("#onPB").addClass('fa-lightbulb-slash').removeClass('fa-lightbulb-on');
    $("#onPB").css({"color": "#343436","font-size": "60px"});
  }

  if(fan1 == 1){
    $(".fanStatus").text("Quạt đang bật");
    $(".fanStatus").css({"color": "green"});
    $('#quatButton1').addClass("disabled").removeClass("active");
    $('#quatButton2').addClass("active").removeClass("disabled");

  //  $('#onFAN').animate({rotate: '30deg', scale: '1.25'}, 1000);
  //   $('#onFAN').animate({rotate: '+=30deg', scale: '-=0.1'}, 1000);
  $('#onFAN').show();
    setInterval(function () {
      //$('#onFAN').animate({rotate: '+=10deg'}, 0);
     
      $('#onFAN').animate({rotate: '+=15deg', scale: '1'},0);
    },200);
    $("#onFAN").css({"color": "#fcfb97"});
    $("#offFAN").hide();
    

  } else {
    $(".fanStatus").text("Quạt đang tắt");
    $(".fanStatus").css({"color": "red"});
    $('#quatButton1').addClass("active").removeClass("disabled");
    $('#quatButton2').addClass("disabled").removeClass("active");
   
    $("#offFAN").show();
    $("#offFAN").css({"color": "#343436"});
    $("#onFAN").hide();
  }
  if(fan2 == 1){
    $(".fanStatus2").text("Quạt đang bật");
    $(".fanStatus2").css({"color": "green"});
    $('#quatButton3').addClass("disabled").removeClass("active");
    $('#quatButton4').addClass("active").removeClass("disabled");

  //  $('#onFAN').animate({rotate: '30deg', scale: '1.25'}, 1000);
  //   $('#onFAN').animate({rotate: '+=30deg', scale: '-=0.1'}, 1000);
  $('#onFAN2').show();
    setInterval(function () {
      //$('#onFAN').animate({rotate: '+=10deg'}, 0);
     
      $('#onFAN2').animate({rotate: '+=15deg', scale: '1'},0);
    },200);
    $("#onFAN2").css({"color": "#fcfb97"});
    $("#offFAN2").hide();
    

  } else {
    $(".fanStatus2").text("Quạt đang tắt");
    $(".fanStatus2").css({"color": "red"});
    $('#quatButton3').addClass("active").removeClass("disabled");
    $('#quatButton4').addClass("disabled").removeClass("active");
   
    $("#offFAN2").show();
    $("#offFAN2").css({"color": "#343436"});
    $("#onFAN2").hide();
  }

  if(ledPK==1 & ledPN ==1 & ledPB==1 ){
    $(".lightStatusAll").text("Tất cả thiết bị đã bật");
    $(".lightStatusAll").css({"color": "green"});
    $('#offAll').addClass("active").removeClass("disabled");
    $('#onAll').addClass("disabled").removeClass("active");
    $("#iconOn").addClass('fa-lightbulb-on').removeClass('fa-lightbulb-slash');
    $("#iconOn").css({"color": "#fcfb97","font-size": "70px"});
    
  }
  else{
    $(".lightStatusAll").text("Tất cả thiết bị đã tắt");
    $(".lightStatusAll").css({"color": "red"});
    $('#offAll').addClass("disabled").removeClass("active");
    $('#onAll').addClass("active").removeClass("disabled");
    $("#iconOn").addClass('fa-lightbulb-slash').removeClass('fa-lightbulb-on');
    $("#iconOn").css({"color": "#343436","font-size": "60px"});
    
  }

  if(ledTL == 0){
    $(".toiletStatus").text("Đèn phòng toilet đang bật");
    $(".toiletStatus").css({"color": "green"});
    $("#onTL").addClass('fa-lightbulb-on').removeClass('fa-lightbulb-slash');
    $("#onTL").css({"color": "#fcfb97"});

  } else {
    $(".toiletStatus").text("Đèn phòng toilet đang tắt");
    $(".toiletStatus").css({"color": "red"});
    $("#onTL").addClass('fa-lightbulb-slash').removeClass('fa-lightbulb-on');
    $("#onTL").css({"color": "#343436"});
   
  }

 
  
});


//$('#checkbox1').change(updateLedFirebaseState);
return Promise.all([
  //led(),
//   updata_firebase()
updata_firebase()
//updateLedFirebaseState()

]);


});

//$(document).ready(function(){

// }

// function updateLedFirebaseState() {
//  // const state = +$(this).prop('checked');
//  $()
//   var firebaseRef = firebase.database().ref('device/led').child("led1");
//   firebaseRef.set(0);
//   var firebaseRef2 = firebase.database().ref('device/led').child("led2");
//   firebaseRef2.set(0);
//   var firebaseRef3 = firebase.database().ref('device/led').child("led3");
//   firebaseRef3.set(0);
//   var firebaseRef4 = firebase.database().ref('device/led').child("led4");
//   firebaseRef4.set(0);

// }
// function led(){
//   var firebaseRef = firebase.database().ref('den/led/').child("led1");
//   $( "#lightLiving" ).change(function() {
//   //var x = document.getElementById("pwm").value;
//   var x= $("#lightLiving").val();
//   //console.log(x);
//   firebaseRef.set(Number(x));
//   //led1 = Number(x);
// });
// }

function updata_firebase(){
$("#lightButton").click(function(){
  var ref = db.collection("device-configs").doc("device-control");
  console.log(ledPK);
  if(ledPK == 1){
    ref.update({
      led1:0
    })
 } else {
  ref.update({
    led1:1
  })
 }
});
//////////// phong ngu
$("#lightButton1").click(function(){
  var ref = db.collection("device-configs").doc("device-control");
  
  //if(led2 == 0){
    ref.update({
      led2:1
    })
});
$("#lightButton2").click(function(){
  var ref = db.collection("device-configs").doc("device-control");

  ref.update({
    led2:0
  })
 // }
});
////////// phong bep

$("#lightButton3").click(function(){
  var ref = db.collection("device-configs").doc("device-control");

  ref.update({
    led3:1
  })
});

//////////////// phong toilet
$("#lightButton4").click(function(){
  var ref = db.collection("device-configs").doc("device-control");

  ref.update({
    led3:0
  })
});

///////////////////// quat
$("#quatButton1").click(function(){  
  var ref = db.collection("device-configs").doc("device-control");
  console.log("dâdsdsa");

  ref.update({
    fan1:1
  })

});
$("#quatButton2").click(function(){
  var ref = db.collection("device-configs").doc("device-control");

  
  ref.update({
    fan1:0
  })

 // }
});

$("#quatButton3").click(function(){  
  var ref = db.collection("device-configs").doc("device-control");
  ref.update({
    fan2:1
  })
    
   // }
});
$("#quatButton4").click(function(){
  var ref = db.collection("device-configs").doc("device-control");
  ref.update({
    fan2:0
  })
    
});

$("#onAll").click(function(){
  var ref = db.collection("device-configs").doc("device-control");
  ref.update({
    led1:1,
    led2:1,
    led3:1
  })
  //firebaseRef4.set(1);
});

$("#offAll").click(function(){
  var ref = db.collection("device-configs").doc("device-control");
  ref.update({
    led1:0,
    led2:0,
    led3:0
  })
});


// $("#checkbox1").change(function(){
//   var firebaseRef = firebase.database().ref('den').child("led1");
//   if($(this).prop("checked") == true){
//      //alert("on")
//      firebaseRef.set(0);
//     led1 = 0;
//   }else{
//     firebaseRef.set(1);
//     led1 = 1;
//     //alert("off")
//   }
// });

}