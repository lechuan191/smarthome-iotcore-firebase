
  var gas = firebase.database().ref().child("sensor/gas");
  //var database = firebase.database();
  //var logDHT = dht.ref().child("dht");
 
  gas.on("child_added", function(sanp) {
    var row=sanp.val();
      $("#content").html(row.gas + " &deg;ppm");
      
  });

const table = $('#example2').DataTable({
    //"lengthMenu": [ [10, 25, 50, -1], [10, 25, 50, "All"] ]
    "lengthMenu": [ 10, 20, 30, 50, 100 ],
    "pagingType": "full_numbers"
  } );
  $('#example2 tbody').on('click', 'tr', function () {
    var data = table.row( this ).data();
    //alert( 'Gas: '+data[1]+'\n' );
    // Swal.fire({
    //   icon: 'success',
    //   title: 'Dữ liệu thứ: ' + data[0],
    //   text: 'Gas: '+data[1]+'\n' + 'Time: ' +data[2] + '\n' +'Date: '+ data[3]
    // })
    Swal.fire({
      //icon: 'success',
      title: '<strong>Dữ liệu lần thứ: </strong>'+ data[0],
      icon: 'success',
      text:
        'Gas: ' +data[1] + ', '+
        'Time: ' +data[2] + ', '+
        'Date: ' +data[3],
  
      showCloseButton: true,
      //focusConfirm: false,
    })
  } );
  
// $('#example').dataTable( {
var counter = 0;

    firebase.database().ref('sensor/').on('value',(snap)=>{
    const values =snap.val();
   // console.log(values.dht)
    drawToTable(values.gas);
   // console.log(values.gas);
   // console.log(values.timestamp);
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
            const gas_value=motionData[key].gas;
            const timestamp=motionData[key].timestamp;
            const date=new Date(timestamp).toLocaleString();
           
            const date2=new Date(timestamp);

            var day = date2.getDate();
            var month = date2.getMonth(); //Be careful! January is 0 not 1
            var year = date2.getFullYear();
            var dateString = day + "/" +(month + 1) + "/" + year;
            
            var hours = date2.getHours();
            var minutes = addZero(date2.getMinutes()); //Be careful! January is 0 not 1
            var second = addZero(date2.getSeconds());
            //var timeString = hours + ":" +minutes+ ":" + second;
            var timeString = displayTime(timestamp);

            updatedData.push([counter,gas_value,timeString,dateString]);
        })
        updatedData.reverse();
        table.rows.add(updatedData).draw(false);
    }
}

function filterColumn ( i ) {
  $('#example2').DataTable().column( i ).search(
      $('#col'+i+'_filter').val(),
  ).draw();
}

  $('input.column_filter').on( 'keyup click', function () {
      filterColumn( $(this).parents('tr').attr('data-column') );
  } );

//////
// var database = firebase.database();
//     database.ref('sensor/gas').once('value', function(snapshot){
//       console.log("test")
//         if(snapshot.exists()){
//             var content = '';
//             var counter = 1;
//             snapshot.forEach(function(data){
//               counter++;
//                 var val = data.val();
//                 console.log(data.val().gas)
//                 content +='<tr>';
//                 content += '<td>' + counter + '</td>';
//                 content += '<td>' + val.gas + '</td>';
//                 content += '<td>' + val.timestamp + '</td>';
//                 content += '</tr>';
//             });
//             $('#example2').append(content);
//         }
//     });


var gaugeOptions = {

  chart: {
      type: 'solidgauge'
  },

  title: null,

  pane: {
      center: ['50%', '85%'],
      size: '140%',
      startAngle: -90,
      endAngle: 90,
      background: {
          backgroundColor: (Highcharts.theme && Highcharts.theme.background2) || '#EEE',
          innerRadius: '60%',
          outerRadius: '100%',
          shape: 'arc'
      }
  },

  tooltip: {
      enabled: false
  },

  // the value axis
  yAxis: {
      stops: [
          [0.1, '#55BF3B'], // green
          [0.5, '#DDDF0D'], // yellow
          [0.9, '#DF5353'] // red
      ],
      lineWidth: 0,
      minorTickInterval: null,
      tickAmount: 2,
      title: {
          y: -70
      },
      labels: {
          y: 16
      }
  },

  plotOptions: {
      solidgauge: {
          dataLabels: {
              y: 5,
              borderWidth: 0,
              useHTML: true
          }
      }
  }
};

// The Humidity gauge
var chartSpeed = Highcharts.chart('container-gas', Highcharts.merge(gaugeOptions, {
  yAxis: {
      min: 10,
      max: 500,
      title: {
          text: 'Gas'
      }
  },

  credits: {
      enabled: false
  },

  series: [{
      name: 'Gas',
      data: [0],
      dataLabels: {
          format: '<div style="text-align:center"><span style="font-size:25px;color:' +
              ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y}</span><br/>' +
                 '<span style="font-size:12px;color:silver">%</span></div>'
      },
      tooltip: {
          valueSuffix: ' %'
      }
  }]

}));

// The Temperature gauge
// var chartRpm = Highcharts.chart('container-temp', Highcharts.merge(gaugeOptions, {
//     yAxis: {
//         min: 1,
//         max: 50,
//         title: {
//             text: 'Temperature'
//         }
//     },

//     series: [{
//         name: 'Temperature',
//         data: [0],
//         dataLabels: {
//             format: '<div style="text-align:center"><span style="font-size:25px;color:' +
//                 ((Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black') + '">{y:.1f}</span><br/>' +
//                    '<span style="font-size:12px;color:silver">°C</span></div>'
//         },
//         tooltip: {
//             valueSuffix: ' °C'
//         }
//     }]

// }));


//var myRef = new Firebase('https://testiot-2018.firebaseio.com/');
var myRef = firebase.database().ref("sensor/gas");
myRef.limitToLast(1).on("child_added", function(snapshot) {
  //   //commentsRef.on('child_added', function(data) {
//var sensor = snapshot.val();
  //myRef.on('child_changed', function(snapshot){
  data = snapshot.val();
  var h = data.gas;
 // console.log(h);
 // var t = data.Temperature;
  var point, newVal, inc;
  if (chartSpeed) {
      point = chartSpeed.series[0].points[0];
      inc = h;
      newVal = point.y + inc;
      point.update(newVal);
      point.y = 0;
  }
  

  // // Temperature
  // if (chartRpm) {
  //     point = chartRpm.series[0].points[0];
  //     inc = t;
  //     newVal = point.y + inc;

  //     point.update(newVal);
  //     point.y = 0;
  // }
});

// function alert(){
//   var myRef = firebase.database().ref("sensor/gas");
//   myRef.limitToLast(1).on("child_added", function(snapshot) {
//     //   //commentsRef.on('child_added', function(data) {
//   //var sensor = snapshot.val();
//     //myRef.on('child_changed', function(snapshot){
//     data = snapshot.val();
//     var h = data.gas;
//     console.log(h);
//     // if(h>238){
//     //   console.log(h);
//       alert("Hello! I am an alert box!!");
//     // }
//   });
// }
//setTimeout(alert,1000);

