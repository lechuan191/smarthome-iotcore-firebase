var logDHT = firebase.database().ref().child("devices-telemetry/dht11");
//var database = firebase.database();
//var logDHT = dht.ref().child("dht");
logDHT.on("child_added", function(sanp) {
  var row=sanp.val();
    $("#content").html(sanp.val().temperature + " &deg;C");
    $("#content2").text(sanp.val().humidity + " %");
    
});
const table = $('#example2').DataTable({
    "lengthMenu": [ [10, 25, 50, -1], [10, 25, 50, "All"] ],
    // "lengthMenu": [ 10, 20, 30, 50, 100, 1000 ],
    "pagingType": "full_numbers"
  } );
// $('#example').dataTable( {
//const table = $('#example2').DataTable();
$('#example2 tbody').on('click', 'tr', function () {
  var data = table.row( this ).data();
 //alert( 'Humidity: '+data[1]+'\n'+'Temperature: '+data[2] );
 Swal.fire({
  //icon: 'success',
  title: '<strong>Dữ liệu lần thứ: </strong>'+ data[0],
  icon: 'success',
  text:
    'Humidity: ' +data[1] + ', '+
    'Temperature: '+data[2] + ', '+
    'Time: ' +data[3] + ', '+
    'Date: ' +data[4],

  showCloseButton: true,
  //focusConfirm: false,
})

} );
var counter = 0;

    firebase.database().ref('devices-telemetry/').on('value',(snap)=>{
    console.log('value wala method called')
    const values =snap.val()
   // console.log(values.dht)
    drawToTable(values.dht11)
    // $('#temperature').html(values.temperature);
    // $('#humidity').html(values.humidity);
  })

  function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  function addAPM(i){
    if (i>11) {
      i = "PM";
    }
    else{
      i="AM";
    }
    return i;
  }
  function displayTime(timestamp) {
    var time = "";
    var currentTime = new Date(timestamp);
    var hours = addZero(currentTime.getHours());
    var minutes = addZero(currentTime.getMinutes());
    var seconds = addZero(currentTime.getSeconds());

    // if (minutes < 10) {
    //     minutes = "0" + minutes
    // }
    // if (seconds < 10) {
    //     seconds = "0" + seconds
    // }
    var pm=addAPM(hours);
    //console.log(pm);
    time += hours+ ":" + minutes + ":" + seconds + " " +pm;
    // if(hours > 11){
    //     str += "PM"
    // } else {
    //     str += "AM"
    // }
    
    return time;
}
function drawToTable(motionData){
    if(motionData){
        table.clear();
        updatedData=[]
        
        Object.keys(motionData).forEach((key)=>{
            counter++;
          const humidity=motionData[key].humidity;
            const temperature=motionData[key].temperature;
            const timestamp=motionData[key].timestamp;
            const date=new Date(timestamp).toLocaleString();

            
            const date2=new Date(timestamp);

            var day = date2.getDate();
            var month = date2.getMonth(); //Be careful! January is 0 not 1
            var year = date2.getFullYear();
            var dateString = day + "/" +(month + 1) + "/" + year;
            
            var hours = date2.getHours();
            var minutes = date2.getMinutes(); 
            var second = date2.getSeconds();
            //var timeString = hours + ":" +minutes+ ":" + second;
            var timeString = displayTime(timestamp);


            
            updatedData.push([counter,humidity,temperature,timeString,dateString]);
        })
        updatedData.reverse()
        table.rows.add(updatedData).draw(false);
    }
}
