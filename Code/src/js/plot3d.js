Plotly.d3.csv('/assets/data/vgg/train_loss.csv', function (err, rows) {

  function unpack(rows, key) {
    return rows.map(function (row) {
      return row[key];
    });
  }

  var z_data = []

  for (i = 0; i < 51; i++) {
    z_data.push(unpack(rows, i));
  }

  var data = [{
    z: z_data,
    type: 'surface'
  }];

  console.log(data)
  
  var layout = {
    title: 'vgg',
    autosize: false,
    width: 500,
    height: 500,
    margin: {
      l: 65,
      r: 50,
      b: 65,
      t: 90,
    }
  };
  Plotly.newPlot('myDiv', data, layout, {
    showSendToCloud: true
  });
});