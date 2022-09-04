import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
@Component({
  selector: 'app-inventorydetails',
  templateUrl: './inventorydetails.component.html',
  styleUrls: ['./inventorydetails.component.scss']
})
export class InventorydetailsComponent implements OnInit {
  store: any;
  env = environment;
  images: any[];
  id: any;
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5
    },
    {
      breakpoint: '960px',
      numVisible: 4
    },
    {
      breakpoint: '768px',
      numVisible: 3
    },
    {
      breakpoint: '560px',
      numVisible: 1
    }
  ];
  comments: any = "";
  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private router: Router, private route: ActivatedRoute,
    public authService: AuthService,
    private datePipe: DatePipe,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.id = params["id"];
    });
    this.loadInventoryDetails();

  }

  loadInventoryDetails() {
    this.http
      .get(environment.backend + `inventories/` + this.id + '?populate=*')
      .subscribe((data: any) => {
        if (data) {
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
          this.store = data.data;
          this.images = data.data.attributes.invpics;
          console.log(this.store);
          if (data.data.attributes.boards?.filepath) {
            this.images.push(data.data.attributes.boards);
          }
        }
      });
  }

  approveInventory(statusid: any) {
    var body = {};
    if (statusid == 2) {
      var currentday = new Date();
      const refno = this.store.attributes.city.data.attributes.category + "-" + this.store.attributes.city.data.attributes.shortcode + "-" + this.store.attributes.storetype.data.attributes.shortcode + "-" + this.store.attributes.pincode + "-" + this.datePipe.transform(currentday, "yyyyMMdd") + this.store.id;
      body = {
        data: { status: statusid, refno: refno, availability: "available" }
      };
    }
    else if (statusid == 3) {
      body = {
        data: { status: statusid, comments: [{ description: this.comments }] }
      };
    } else {
      body = {
        data: { status: statusid }
      };
    }

    this.http
      .put(environment.backend + `inventories/` + this.id, body)
      .subscribe((data: any) => {
        if (data) {
          this.toastr.success(data.message, "Status Updated Successfully!", {
            timeOut: 3000,
          });
          this.loadInventoryDetails();
        }
      });
  }
  reworkInventory() {
    console.log(this.comments);
    if (this.comments == "" || this.comments.length == 0) {
      this.toastr.error("Please enter comments for rework", "", {
        timeOut: 3000,
      });
      return;
    }
    this.approveInventory(3);
    this.modalService.dismissAll();
  }
  openModal(content, store: any) {
    this.store = store;
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
  downloadFile(path: any) {
    console.log(path);
    window.open(this.env.backendfileURI + path);
  }
}
