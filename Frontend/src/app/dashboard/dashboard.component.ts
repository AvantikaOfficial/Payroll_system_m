import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as ApexCharts from 'apexcharts';
import * as c3 from 'c3';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  @ViewChild('deleteModal') deleteModal!: TemplateRef<any>;
  
  stats = [
    { id: 1, title: 'Employees', bgClass: 'bg-teal', value: 85 },
    { id: 2, title: 'Companies', bgClass: 'bg-warning', value: 75 },
    { id: 3, title: 'Leaves', bgClass: 'bg-orange', value: 65 },
    { id: 7, title: 'Salary', bgClass: 'bg-teal', value: 90 }
  ];
 
  recentActivities = [
    { name: 'John Carter', action: 'Added New Project HRMS Dashboard', time: '06:20 PM', img: 'employee-01.jpg' },
    { name: 'Sophia White', action: 'Commented on Uploaded Document', time: '04:00 PM', img: 'employee-02.jpg' },
    { name: 'Michael Johnson', action: 'Approved Task Projects', time: '02:30 PM', img: 'employee-03.jpg' },
    { name: 'Emily Clark', action: 'Requesting Access to Module Tickets', time: '12:10 PM', img: 'employee-04.jpg' },
    { name: 'David Anderson', action: 'Downloaded App Reports', time: '10:40 AM', img: 'employee-05.jpg' },
    { name: 'Olivia Haris', action: 'Completed ticket module in HRMS', time: '09:50 AM', img: 'employee-06.jpg' }
  ];

  teamLeads = [
    { name: 'Braun Kelton', team: 'PHP', email: 'braun@example.com', img: 'employee-03.jpg', badgeClass: 'teal' },
    { name: 'Sarah Michelle', team: 'IOS', email: 'sarah@example.com', img: 'employee-06.jpg', badgeClass: 'pink' },
    { name: 'Daniel Patrick', team: 'HTML', email: 'daniel@example.com', img: 'manager-07.jpg', badgeClass: 'orange' },
    { name: 'Emily Clark', team: 'UI/UX', email: 'emily@example.com', img: 'employee-08.jpg', badgeClass: 'success' },
    { name: 'Ryan Christopher', team: 'React', email: 'ryan@example.com', img: 'manager-05.jpg', badgeClass: 'info' }
  ];

  upcomingLeaves = [
    { name: 'Daniel Martinz', date: '17 Apr 2025', type: 'Sick Leave', img: 'employee-09.jpg' },
    { name: 'Emily Clark', date: '20 Apr 2025', type: 'Casual Leave', img: 'employee-04.jpg' },
    { name: 'Daniel Patrick', date: '22 Apr 2025', type: 'Annual Leave', img: 'manager-03.jpg' },
    { name: 'Sophia White', date: '28 Apr 2025', type: 'Sick Leave', img: 'employee-02.jpg' },
    { name: 'Madison Andrew', date: '30 Apr 2025', type: 'Casual Leave', img: 'manager-09.jpg' }
  ];

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.initCharts();
  }

  initCharts(): void {
    // Polar Area Chart
    const polarChart = new ApexCharts(document.querySelector("#polarchart"), {
      series: [44, 55, 67, 83],
      chart: {
        height: 250,
        type: 'polarArea',
      },
      labels: ['Design', 'Development', 'Business', 'Testing'],
      fill: {
        opacity: 1
      },
      stroke: {
        width: 1,
        colors: undefined
      },
      colors: ['#5D87FF', '#FFAE1F', '#3DD9EB', '#FF5E5E'],
      yaxis: {
        show: false
      },
      legend: {
        position: 'bottom'
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
    });
    polarChart.render();

    // Applications Chart
    const applicationsChart = new ApexCharts(document.querySelector("#applications_chart"), {
      series: [{
        name: 'Applications',
        data: [44, 55, 57, 56, 61, 58, 63]
      }],
      chart: {
        height: 250,
        type: 'bar',
      },
      colors: ['#5D87FF'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        },
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent']
      },
      xaxis: {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function(val: string) {
            return val + " applications";
          }
        }
      }
    });
    applicationsChart.render();

    // Circle Charts
    this.stats.forEach(stat => {
      c3.generate({
        bindto: `#circle_chart_${stat.id}`,
        data: {
          columns: [['data', stat.value]],
          type: 'gauge',
        },
        color: {
          pattern: ['#5D87FF'],
          threshold: {
            values: [30, 60, 90]
          }
        },
        size: {
          height: 80,
          width: 80
        }
      });
    });

    // Gender Charts
    c3.generate({
      bindto: '#chart_male',
      data: {
        columns: [['Male', 65]],
        type: 'gauge',
      },
      color: {
        pattern: ['#5D87FF'],
      },
      size: {
        height: 120
      }
    });

    c3.generate({
      bindto: '#chart_female',
      data: {
        columns: [['Female', 35]],
        type: 'gauge',
      },
      color: {
        pattern: ['#FFAE1F'],
      },
      size: {
        height: 120
      }
    });
  }

  refreshActivities(): void {
    console.log('Refreshing activities...');
    // API call would go here
  }

  openDeleteModal(): void {
    this.modalService.open(this.deleteModal, { centered: true, size: 'sm' });
  }

  confirmDelete(): void {
    console.log('Item deleted');
    this.modalService.dismissAll();
  }
}