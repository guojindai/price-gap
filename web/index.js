jQuery(function ($) {

  function renderChart() {
    var option = {
      title: {
        text: '堆叠区域图'
      },
      tooltip : {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      legend: {
        data:['邮件营销', '联盟广告']
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
      series: [
        {
          name:'邮件营销',
          type:'line',
          data:[120, 132, 101, 134, 90, 230, 210]
        },
        {
          name:'联盟广告',
          type:'line',
          data:[220, 182, 191, 234, 290, 330, 310]
        }
      ]
    };
    var myChart = echarts.init(document.getElementById('chart'));
    myChart.setOption(option);
  }

  function loadData() {
    $.when($.get('../data/d1.csv', 'text'), $.get('../data/d1.csv', 'text'))
      .then(function (d1, d2) {
      console.log(d1[0], d2[0]);
    })
  }

  loadData();

});
