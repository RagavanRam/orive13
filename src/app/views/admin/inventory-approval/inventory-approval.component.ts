import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { debounceTime } from "rxjs/operators";
import { HttpClient } from '@angular/common/http';
import { environment } from "src/environments/environment";
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: "app-inventory-approval",
  templateUrl: "./inventory-approval.component.html",
  styleUrls: ["./inventory-approval.component.scss"],
  animations: [SharedAnimations],
})
export class InventoryApprovalComponent implements OnInit {
  @ViewChild("search") search!: ElementRef;
  timer: any;
  viewMode = "list";
  allSelected: boolean;
  page = 1;
  pageSize = 8;
  inventory: any[] = [];
  inventoryImages: any;
  store: any;
  store_name: string;
  env = environment;
  selectedId: number;

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {}

  ngOnInit() {
    this.loadStoreInventory();
  }

  loadStoreInventory() {
    this.http
      .get(environment.backend + `stores/store`)
      .subscribe((data: any) => {
        if (data) {
          this.inventory = data.stores;
        }
      });
  }

  changeStatus(status: string, modal: any) {
    const body = {
      id: this.selectedId,
      status: status,
    };
    modal();
    this.http
      .patch(environment.backend + `stores/inventory-status`, body)
      .subscribe(
        (data: any) => {
          if (data) {
            this.loadStoreInventory();
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message, "Error while login!", {
            timeOut: 3000,
          });
        }
      );
  }

  filter(): void {
    clearTimeout(this.timer);
    if (this.search.nativeElement.value) {
      this.timer = setTimeout(() => {
        this.http
          .get(
            environment.backend +
              `stores/store?search=${
                this.search.nativeElement.value
              }&user=${localStorage.getItem("username")}`
          )
          .subscribe((data: any) => {
            if (data.stores) {
              this.inventory = data.stores;
            } else {
              this.inventory = [];
            }
          });
      }, 1000);
    }
  }

  openModal(content, id: number, modalName: string) {
    this.selectedId = id;
    if (modalName === "storeInfo") {
      this.http
        .get(environment.backend + `stores/store?id=${id}`)
        .subscribe((data: any) => {
          if (data) {
            this.store = data.store;
          }
        });
    } else if (modalName === "viewPhotos") {
      this.http
        .get(
          environment.backend +
            `stores/inventory?id=${id}&user=${localStorage.getItem("username")}`
        )
        .subscribe((data: any) => {
          if (data) {
            this.inventoryImages = data.inventory;
          }
        });
    }
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
}
