jQuery(function ($) {

  var series = [
    {
      name:'A',
      type:'line',
    },
    {
      name:'B',
      type:'line',
    },
    {
      name:'C',
      type:'line',
    },
  ];

  function transfromData(text) {
    var data = [];
    text.split(/\n/).forEach(function (line) {
      var fields = line.trim().split(',');
      if (fields.length === 3) {
        var pi = parseInt(fields[1]);
        var po = parseInt(fields[2]);
        data.push([fields[0], parseInt(((po - pi) / pi) * 100), pi, po]);
      }
    });
    return data;
  }

  function renderChart() {
    var option = {
      title: {
        text: 'GAP'
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data:['A', 'B', 'C']
      },
      toolbox: {
        feature: {
          saveAsImage: {}
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'time',
          splitLine: {
            show: false
          }
        }
      ],
      yAxis: [
        {
          type : 'value'
        }
      ],
      series: series,
    };
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption(option);
  }

  function loadData() {
    $.when($.get('../data/BTC.csv', 'text'),
      $.get('../data/ETH.csv', 'text'),
      $.get('../data/EOS.csv', 'text'),).then(function (resBTC, resETH, resEOS) {
      series[0].data = transfromData(resBTC[0]);
      series[1].data = transfromData(resETH[0]);
      series[2].data = transfromData(resEOS[0]);
      renderChart();
    });
  }

  loadData();

});
