
'use strict';

$(document).ready(function () {

  function generateData(baseval, count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
      var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;;
      var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
      var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;

      series.push([x, y, z]);
      baseval += 86400000;
      i++;
    }
    return series;
  }

  // Simple Line
  if ($('#s-line').length > 0) {
    var sline = {
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'straight'
      },
      series: [{
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
      }],
      title: {
        text: 'Product Trends by Month',
        align: 'left'
      },
      grid: {
        row: {
          colors: ['#f1f2f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-line"),
      sline
    );

    chart.render();
  }


  // Simple Line Area
  if ($('#s-line-area').length > 0) {
    var sLineArea = {
      chart: {
        height: 350,
        type: 'area',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC', '#888ea8'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: 'smooth'
      },
      series: [{
        name: 'series1',
        data: [31, 40, 28, 51, 42, 109, 100]
      }, {
        name: 'series2',
        data: [11, 32, 45, 32, 34, 52, 41]
      }],

      xaxis: {
        type: 'datetime',
        categories: ["2018-09-19T00:00:00", "2018-09-19T01:30:00", "2018-09-19T02:30:00", "2018-09-19T03:30:00", "2018-09-19T04:30:00", "2018-09-19T05:30:00", "2018-09-19T06:30:00"],
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm'
        },
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-line-area"),
      sLineArea
    );

    chart.render();
  }

  if ($('#s-col-chart').length > 0) {
    var sCol = {
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '80%',
          borderRadius: 5, 
          endingShape: 'rounded', // This rounds the top edges of the bars
        },
      },
      colors: ['#2E37A4', '#5777E6', '#5CC583'],
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      
      series: [{
        name: 'Inprogress',
        data: [19, 65, 19, 19, 19, 19, 19]
      }, {
        name: 'Active',
        data: [89, 45, 89, 46, 61, 25, 79]
      }, 
      {
        name: 'Completed',
        data: [39, 39, 39, 80, 48, 48, 48]
      }],
      xaxis: {
        categories: ['15 Jan', '16 Jan', '17 Jan', '18 Jan', '19 Jan', '20 Jan', '21 Jan'],
        labels: {
          style: {
            colors: '#0C1C29', 
            fontSize: '12px',
          }
        }
      },
      yaxis: {
        labels: {
          offsetX: -15,
          style: {
            colors: '#6D777F', 
            fontSize: '14px',
          }
        }
      },
      grid: {
        borderColor: '#CED2D4',
        strokeDashArray: 5,
        padding: {
          left: -8,
          right: -15, 
        },
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return "" + val + "%"
          }
        }
      }
    }
  
    var chart = new ApexCharts(
      document.querySelector("#s-col-chart"),
      sCol
    );
  
    chart.render();
  }
  
  // Simple Column Stacked
  if ($('#s-col-stacked').length > 0) {
    var sColStacked = {
      chart: {
        height: 350,
        type: 'bar',
        stacked: true,
        toolbar: {
          show: false,
        }
      },
      responsive: [{
        breakpoint: 480,
        options: {
          legend: {
            position: 'bottom',
            offsetX: -10,
            offsetY: 0
          }
        }
      }],
      plotOptions: {
        bar: {
          horizontal: false,
        },
      },
      colors: ['#3550DC', '#E70D0D', '#03C95A', '#1B84FF'],
      series: [{
        name: 'PRODUCT A',
        data: [44, 55, 41, 67, 22, 43]
      }, {
        name: 'PRODUCT B',
        data: [13, 23, 20, 8, 13, 27]
      }, {
        name: 'PRODUCT C',
        data: [11, 17, 15, 15, 21, 14]
      }, {
        name: 'PRODUCT D',
        data: [21, 7, 25, 13, 22, 8]
      }],
      xaxis: {
        type: 'datetime',
        categories: ['01/01/2011 GMT', '01/02/2011 GMT', '01/03/2011 GMT', '01/04/2011 GMT', '01/05/2011 GMT', '01/06/2011 GMT'],
      },
      legend: {
        position: 'right',
        offsetY: 40
      },
      fill: {
        opacity: 1
      },
    }

    var chart = new ApexCharts(
      document.querySelector("#s-col-stacked"),
      sColStacked
    );

    chart.render();
  }

  // Simple Bar
  if ($('#s-bar').length > 0) {
    var sBar = {
      chart: {
        height: 350,
        type: 'bar',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC'],
      plotOptions: {
        bar: {
          horizontal: true,
        }
      },
      dataLabels: {
        enabled: false
      },
      series: [{
        data: [400, 430, 448, 470, 540, 580, 690, 1100, 1200, 1380]
      }],
      xaxis: {
        categories: ['South Korea', 'Canada', 'United Kingdom', 'Netherlands', 'Italy', 'France', 'Japan', 'United States', 'China', 'Germany'],
      }
    }

    var chart = new ApexCharts(
      document.querySelector("#s-bar"),
      sBar
    );

    chart.render();
  }

  // Mixed Chart
  if ($('#mixed-chart').length > 0) {
    var options = {
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        }
      },
      colors: ['#3550DC', '#888ea8'],
      series: [{
        name: 'Website Blog',
        type: 'column',
        data: [440, 505, 414, 671, 227, 413, 201, 352, 752, 320, 257, 160]
      }, {
        name: 'Social Media',
        type: 'line',
        data: [23, 42, 35, 27, 43, 22, 17, 31, 22, 22, 12, 16]
      }],
      stroke: {
        width: [0, 4]
      },
      title: {
        text: 'Traffic Sources'
      },
      labels: ['01 Jan 2001', '02 Jan 2001', '03 Jan 2001', '04 Jan 2001', '05 Jan 2001', '06 Jan 2001', '07 Jan 2001', '08 Jan 2001', '09 Jan 2001', '10 Jan 2001', '11 Jan 2001', '12 Jan 2001'],
      xaxis: {
        type: 'datetime'
      },
      yaxis: [{
        title: {
          text: 'Website Blog',
        },

      }, {
        opposite: true,
        title: {
          text: 'Social Media'
        }
      }]

    }

    var chart = new ApexCharts(
      document.querySelector("#mixed-chart"),
      options
    );

    chart.render();
  }

  // Donut Chart

  if ($('#donut-chart').length > 0) {
    var donutChart = {
      chart: {
        height: 350,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      // colors: ['#4361ee', '#888ea8', '#e3e4eb', '#d3d3d3'],
      series: [44, 55, 41, 17],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#donut-chart"),
      donutChart
    );

    donut.render();
  }

  // Radial Chart
  if ($('#radial-chart').length > 0) {
    var radialChart = {
      chart: {
        height: 350,
        type: 'radialBar',
        toolbar: {
          show: false,
        }
      },
      // colors: ['#4361ee', '#888ea8', '#e3e4eb', '#d3d3d3'],
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: {
              fontSize: '22px',
            },
            value: {
              fontSize: '16px',
            },
            total: {
              show: true,
              label: 'Total',
              formatter: function (w) {
                return 249
              }
            }
          }
        }
      },
      series: [44, 55, 67, 83],
      labels: ['Apples', 'Oranges', 'Bananas', 'Berries'],
    }

    var chart = new ApexCharts(
      document.querySelector("#radial-chart"),
      radialChart
    );

    chart.render();
  }

  // Total Employees 

  if ($('#total-employee-chart').length > 0) {
    var donutChart = {
      chart: {
        height: 320,
        type: 'donut',
        toolbar: {
          show: false,
        }
      },
      colors: ['#478CE9', '#E2359A', '#EECF1A', '#3EB058'],
      series: [88, 66, 33, 17],
      labels: ['Business', 'Development', 'Testing', 'Design'],
      legend: {
      position: 'bottom' // <-- Add this section
    },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 250,
            height: 300,
          },
          legend: {
            position: 'bottom',
          }
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#total-employee-chart"),
      donutChart
    );

    donut.render();
  }

  if ($('#piechart').length > 0) {
  var options = {
    series: [20, 50, 20, 20, 10, 30],
    chart: {
      width: 380,
      type: 'pie',
    },
    labels: ['Html', 'React JS', 'Design', 'Testing', 'PHP', 'Android', 'Node JS'],
    colors: ['#AB47BC', '#03C95A', '#FF6C03', '#DF1F8F', '#0DCAF0', '#FFC107', '#AB47BC'],
    legend: {
      show: false
    },
    stroke: {
      width: 0
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        }
      }
    }]
  };

  var chart = new ApexCharts(document.querySelector("#piechart"), options);
  chart.render();
}

	// Index-2 chats
  if ($('#circle_chart_1').length > 0) {
    var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return 700;
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#10B3A1'],
    labels: ['Progress']
  };

  var chart = new ApexCharts(document.querySelector("#circle_chart_1"), options);
  chart.render();
}

	// Index-2 chats2
  if ($('#circle_chart_2').length > 0) {
	  var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return 30;
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#ECCA00'],
    labels: ['Progress']
  };

  var chart2 = new ApexCharts(document.querySelector("#circle_chart_2"), options);
  chart2.render();
}

	// Index-2 chats3
  if ($('#circle_chart_3').length > 0) {
	  var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return "05";
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#FF6C03'],
    labels: ['Progress']
  };

  var chart3 = new ApexCharts(document.querySelector("#circle_chart_3"), options);
  chart3.render();
}

	// Index-2 chats4
  if ($('#circle_chart_4').length > 0) {
	  var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return 700;
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#DF1F8F'],
    labels: ['Progress']
  };

  var chart4 = new ApexCharts(document.querySelector("#circle_chart_4"), options);
  chart4.render();
}


	// Index-2 chats5
  if ($('#circle_chart_5').length > 0) {
	  var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return 700;
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#28A745'],
    labels: ['Progress']
  };

  var chart5 = new ApexCharts(document.querySelector("#circle_chart_5"), options);
  chart5.render();
}

	// Index-2 chats6
  if ($('#circle_chart_6').length > 0) {
	  var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return 700;
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#DA2100'],
    labels: ['Progress']
  };

  var chart6 = new ApexCharts(document.querySelector("#circle_chart_6"), options);
  chart6.render();
}
	// Index-2 chats7
  if ($('#circle_chart_7').length > 0) {
	  var options = {
    series: [70],
    chart: {
      height: 70,
      width: 80,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '40%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '14px',
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return 5.8;
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#10B3A1'],
    labels: ['Progress']
  };

  var chart6 = new ApexCharts(document.querySelector("#circle_chart_7"), options);
  chart6.render();
}
	

// Applications Chart
if ($('#applications_chart').length > 0) {
    var donutChart = {
      chart: {
        height: 320,
        type: 'donut',
        toolbar: {
          show: false,
        },
      },
      
      colors: ['#282BC3', '#28A745', '#FF6C03', '#DA2100'],
      series: [88, 66, 33, 17],
      labels: ['Total', 'Selected', 'Shortlisted', 'Rejected'],
      legend: {
      show: false // <-- Add this section
    },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 250,
            height: 300,
          },
        }
      }]
    }

    var donut = new ApexCharts(
      document.querySelector("#applications_chart"),
      donutChart
    );

    donut.render();
  }


	// Gender Male Chart
  if ($('#chart_male').length > 0) {
	  var options = {
    series: [60],
    chart: {
      height: 170,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 600,
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return val + "%";
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#FF6D00'], // Orange
    labels: ['Progress']
  };

  var chart_male = new ApexCharts(document.querySelector("#chart_male"), options);
  chart_male.render();
}

	// Gender Female Chart
  if ($('#chart_female').length > 0) {
	  var options = {
    series: [40],
    chart: {
      height: 170,
      type: 'radialBar',
      toolbar: { show: false }
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '60%'
        },
        dataLabels: {
          show: true,
          name: {
            show: false
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 600,
            color: '#333',
            offsetY: 5,
            formatter: function (val) {
              return val + "%";
            }
          }
        },
        track: {
          background: '#f5f5f5',
          strokeWidth: '100%'
        }
      }
    },
    colors: ['#911891'],
    labels: ['Progress']
  };

  var chart_female = new ApexCharts(document.querySelector("#chart_female"), options);
  chart_female.render();
}

 if ($('#line_chart').length > 0) {
    var options = {
      chart: {
        type: 'line',
        height: 310,
        toolbar: {
        show: false 
       }
      },
      series: [{
        name: 'Avg. Salary',
        data: [0, 150, 250, 200, 210, 200, 250, 310, 260, 310, 200,240]
      }, {
        name: 'Max. Salary',
         data: [0, 50, 100, 150, 140, 300, 150, 280, 310, 420, 350, 250] 
      }],
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
      },
      tooltip: {
        y: {
          formatter: function (val) {
            return val + "%";
          }
        },
      },
      dataLabels: {
        enabled: false
      },
      grid: {
        yaxis: {
          lines: {
            show: true
          }
        },
      }, 
      yaxis: {
        labels: {
          offsetX: -15
        },
      },
      grid: {
        padding: {
          left: -8,
        },
      },
      markers: {
        size: 0,
         colors: ['#03C95A', '#FD3995'],
        strokeColors: '#fff',
        strokeWidth: 1,
        hover: {
          size: 7
        }
      },
      colors: ['#03C95A', '#FD3995'], // Color for the lines
      legend: {
        show: false,
      }
    }
    var chart = new ApexCharts(document.querySelector("#line_chart"), options);
    chart.render();
  }

  //Polar Area Charts 
  if ($('#polarchart').length > 0) {
	var pieCtxs = document.getElementById("polarchart"),
	pieConfigs = {
		series: [70,85, 70, 40],
		chart: {
		width: 330,
		height:400,
		type: 'polarArea'
	  },
	  labels: ['Business', 'Design', 'Testing', 'Development'],
	  
	  fill: {
		opacity: 1,
		colors: ['#28A745', '#327FE6','#FF6C03', '#ECCA00'], 
	  },
	  stroke: {
		width: 0,
		
	  },
	  yaxis: {
		show: false
	  },
	  legend: {
		show: false
	  },
	  plotOptions: {
		polarArea: {
		  rings: {
			strokeWidth: 0
		  },
		  spokes: {
			strokeWidth: 0
		  },
		}
	  },
	  theme: {
		monochrome: {
		  enabled: true,
		  shadeTo: 'light',
		  shadeIntensity: 0.6
		}
	  }
	  };
	  var polarchart = new ApexCharts(pieCtxs, pieConfigs);
	  polarchart.render();


	  var options = {
		series: [44, 55, 13, 33],
		chart: {
		width: 380,
		type: 'donut',
	  },
	  dataLabels: {
		enabled: false
	  },
	  responsive: [{
		breakpoint: 480,
		options: {
		  chart: {
			width: 200
		  },
		  legend: {
			show: false
		  }
		}
	  }],
	  legend: {
		position: 'right',
		offsetY: 0,
		height: 230,
	  }
	  };
  }

});
