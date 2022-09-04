import { Component, HostListener, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';

import { environment } from 'src/environments/environment';
import { ChartComponent } from "ng-apexcharts";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart
} from "ng-apexcharts";
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/shared/services/auth.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ToastrService } from 'ngx-toastr';
import { DatePipe } from '@angular/common';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
	pageLimit = 97
	page = 1
	store: any;
	comments: any = "";
    role: any;
	// lineChart1;
	// chartValues = []
	// chartLineSmall1: any;
	rows: any = [];
	api: string = 'inventories?populate=*&sort[0]=updatedAt%3Adesc';
	invData : any = {}
	@ViewChild("chart") chart: ChartComponent;
  	public chartOptions: Partial<ChartOptions>;

	constructor(private http: HttpClient, public authService: AuthService, private router: Router, private modalService: NgbModal, private toastr: ToastrService, private datePipe: DatePipe) { }

	ngOnInit() {
		this.role = localStorage.getItem("groups");
		this.getData();

		// this.chartLineSmall1 = {
		// 	...echartStyles.defaultOptions, ...{
		// 		grid: echartStyles.gridAlignLeft,
		// 		series: [{
		// 			data: [30, 40, 20, 50, 40, 80, 90, 40],
		// 			...echartStyles.smoothLine,
		// 			lineStyle: {
		// 				color: '#4CAF50',
		// 				...echartStyles.lineShadow
		// 			},
		// 			itemStyle: {
		// 				color: '#4CAF50'
		// 			}
		// 		}]
		// 	}
		// };
		// this.lineChart1 = {
		// 	...echartStyles.lineFullWidth, ...{
		// 		series: [{
		// 			data: [80, 40, 90, 20, 80, 30, 90, 30, 80, 10, 70, 30, 90],
		// 			...echartStyles.smoothLine,
		// 			markArea: {
		// 				label: {
		// 					show: true
		// 				}
		// 			},
		// 			areaStyle: {
		// 				color: 'rgba(102, 51, 153, .15)',
		// 				origin: 'start'
		// 			},
		// 			lineStyle: {
		// 				// width: 1,
		// 				color: 'rgba(102, 51, 153, 0.68)',
		// 			},
		// 			itemStyle: {
		// 				color: '#663399'
		// 			}
		// 		}, {
		// 			data: [20, 80, 40, 90, 20, 80, 30, 90, 30, 80, 10, 70, 30],
		// 			...echartStyles.smoothLine,
		// 			markArea: {
		// 				label: {
		// 					show: true
		// 				}
		// 			},
		// 			areaStyle: {
		// 				color: 'rgba(255, 152, 0, 0.15)',
		// 				origin: 'start'
		// 			},
		// 			lineStyle: {
		// 				// width: 1,
		// 				color: 'rgba(255, 152, 0, .6)',
		// 			},
		// 			itemStyle: {
		// 				color: 'rgba(255, 152, 0, 1)'
		// 			}
		// 		}]
		// 	}
		// };

		this.chartOptions = {
			series: [],
			chart: {
			  type: "donut"
			},
			labels: ["Pending", "Approved", "Rework", "Rejected"],
			responsive: [
			  {
				breakpoint: 480,
				options: {
				  chart: {
					width: 380
				  },
				  legend: {
					position: "bottom"
				  }
				}
			  }
			]
		};
		if (this.authService.role.value == 'fieldexecutive') {
			this.api += '&filters[createdbyuser][id][$eq]=' + this.authService.userId.value
		}
		this.getInventories()
	}

	pageChange(event: any) {
		if (event.offset == this.pageLimit) {
			this.pageLimit = this.pageLimit + 99;
			this.page = this.page + 1;
			this.http.get(environment.backend + this.api + '&pagination[limit]=100&pagination[page]=' + this.page).subscribe((res: any) => {
				let data = [...this.rows, ...res.data];
				console.log(data);
				this.rows = data;
			})
		}
	}

	getInventories() {
		 this.http.get(environment.backend + this.api).subscribe((res: any) => {
			let item = {
				totel: res?.meta?.pagination?.total,
				approved: 0,
				pending: 0,
				rework: 0,
				rejected: 0
			}
			// this.invData = res?.meta?.pagination?.total;
			this.http.get(environment.backend + this.api + '&filters[status][statusname][$eq]=Pending').subscribe((pending: any) => {
				this.chartOptions.series = [pending?.meta?.pagination?.total, 0, 0, 0];
				item.pending = pending?.meta?.pagination?.total
				this.http.get(environment.backend + this.api + '&filters[status][statusname][$eq]=Approved').subscribe((approved: any) => {
					this.chartOptions.series = [pending?.meta?.pagination?.total, approved?.meta?.pagination?.total, 0, 0];
					item.approved = approved?.meta?.pagination?.total
					this.http.get(environment.backend + this.api + '&filters[status][statusname][$eq]=Rework').subscribe((rework: any) => {
						this.chartOptions.series = [pending?.meta?.pagination?.total, approved?.meta?.pagination?.total, rework?.meta?.pagination?.total, 0];
						item.rework = rework?.meta?.pagination?.total
						this.http.get(environment.backend + this.api + '&filters[status][statusname][$eq]=Rejected').subscribe((rejected: any) => {	
							this.chartOptions.series = [pending?.meta?.pagination?.total, approved?.meta?.pagination?.total, rework?.meta?.pagination?.total, rejected?.meta?.pagination?.total];
							item.rejected = rejected?.meta?.pagination?.total
							this.invData = item;
						})
					})
				})
			})
		});
	}

	async getPendingData(pageNo: number) {
		await this.http.get<any>(environment.backend + this.api + '&pagination[limit]=100&pagination[page]=' + pageNo).toPromise().then(async (res: any) => {
			return res.data;
		})
	}

	async getData() {
		await this.http.get(environment.backend + this.api + '&pagination[limit]=100').toPromise().then(async (res: any) => {
			let data = res.data;
			console.log(res);
			console.log(data);
			this.rows = data;
		})
	}

	gotoDetail(url : string) {
		this.router.navigateByUrl(url)
	}

	gotoInvDetail(index: number) {
		this.router.navigateByUrl('inventory/details?id='+index)
	}

	gotoInv(index: number) {
		this.router.navigateByUrl('inventory/edit?id='+index)
	}

	approveInventory(store: any, storeid: any, statusid: any) {
		var body = {};
		//approve 
		if (statusid == 2) {
		  var currentday = new Date();
		  const refno = store.attributes?.city?.data?.attributes?.category + "-" + store?.attributes?.city?.data?.attributes?.shortcode + "-" + store?.attributes?.storetype?.data?.attributes?.shortcode + "-" + store?.attributes?.pincode + "-" + this.datePipe.transform(currentday, "yyyyMMdd") + storeid;
		  body = {
			data: {
			  status: statusid, refno: refno, availability: "available"
			}
		  };//rework
		} else if (statusid == 3) {
		  body = {
			data: { status: statusid, comments: [{ description: this.comments }] }
		  };
		}//other statuses
		else {
		  body = {
			data: { status: statusid }
		  };
		}
	
		this.http
		  .put(environment.backend + `inventories/` + storeid, body)
		  .subscribe((data: any) => {
			if (data) {
			  this.toastr.success(data.message, "Status Updated Successfully!", {
				timeOut: 3000,
			  });
			  this.getInventories();
			  	let updatedData = []
				if (this.page > 1) {
					for (let i = 1; i <= this.page; i++) {
						let itemData: any = this.getPendingData(i)
						updatedData.push(...itemData);
					}
				}else {
					this.getData();
				}
			}
		  });
	  }

	openModal(content: any, store: any) {
		this.store = store;
		console.log(this.store);
		this.modalService
		  .open(content, { ariaLabelledBy: "modal-basic-title" })
		  .result.then(
			(result) => {
			  console.log(result);
			},
			(reason) => {
			  console.log("Err!", reason);
			}
		  );
	  }

	  reworkInventory() {
		console.log(this.comments);
		if (this.comments == "" || this.comments.length == 0) {
		  this.toastr.error("Please enter comments for rework", "", {
			timeOut: 3000,
		  });
		  return;
		}
		this.approveInventory(this.store, this.store.id, 3);
		this.modalService.dismissAll();
	  }

	@HostListener('window:resize', ['$event'])
  	onResize(event) {
    this.getInventories();
  }
}
