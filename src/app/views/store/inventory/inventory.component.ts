import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from "src/environments/environment";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-inventory",
  templateUrl: "./inventory.component.html",
  styleUrls: ["./inventory.component.scss"],
})
export class InventoryComponent implements OnInit {
  page = 1;
  inventoryImages: any;
  id: string = "";
  storeName: string = "";
  inventoryForm: FormGroup;
  photo = new FormControl("", Validators.required);
  width = new FormControl("", Validators.required);
  height = new FormControl("", Validators.required);
  photoType = new FormControl("", Validators.required);
  env = environment;
  role: string;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal,
    private router: Router
  ) {
    this.inventoryForm = fb.group({
      photo: this.photo,
      width: this.width,
      height: this.height,
      photoType: this.photoType,
    });
  }

  ngOnInit(): void {
    this.role = localStorage.getItem("groups");
    this.loadInventoryList();
  }

  openImage(index: any): void {
    console.log(index);
  }

  openModal(content) {
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

  onFileChanged(event) {
    const file = event.target.files[0];
    this.inventoryForm.get("photo").setValue(file);
  }

  inventory(modal) {
    const uploadPhoto = new FormData();
    uploadPhoto.append("photo", this.photo.value);
    uploadPhoto.append("width", this.width.value);
    uploadPhoto.append("height", this.height.value);
    uploadPhoto.append("photo_type", this.photoType.value);
    uploadPhoto.append("user", localStorage.getItem("username"));
    uploadPhoto.append("id", this.id);

    if (this.photo) {
      this.http
        .post(environment.backend + "stores/inventory", uploadPhoto)
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success("Photo added to store!", "Success!", {
                timeOut: 3000,
              });
            }
            this.loadInventoryList();
            modal();
          },
          (err) => {
            console.log(err);
            this.toastr.error(
              err?.error?.message,
              "Error while attaching photo!",
              {
                timeOut: 3000,
              }
            );
          }
        );
      this.inventoryForm.reset();
    } else {
      this.toastr.success("Attach a file!", "Error!", {
        timeOut: 3000,
      });
    }
  }

  loadInventoryList() {
    this.route.queryParams.subscribe((params) => {
      this.id = params["id"];
      this.storeName = params["name"];
    });
    /*
      .get(
        environment.backend +
        `stores/id=${this.id}?createdbyuser=&filter[createdbyuser]["username"][$eq]=${localStorage.getItem(
          "username"
        )}`
      )*/
    this.http
      .get(
        environment.backend + `inventories/${this.id}` + '?populate=*'
      )
      .subscribe((data: any) => {
        if (data) {
          this.inventoryImages = data.data.attributes.storepics;
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
        }
      });
  }

  gotoApproval() {
    localStorage.setItem("store_ref", this.id);
    this.router.navigateByUrl("/admin/inventory");
  }

  changeStatus(status: string, modal: any) {
    const body = {
      id: this.inventoryImages?.store_id,
      status: status,
    };
    modal();
    this.http
      .patch(environment.backend + `stores/inventory-status`, body)
      .subscribe(
        (data: any) => {
          if (data) {
            this.toastr.success("Inventory status updated!", "Success!", {
              timeOut: 3000,
            });
          }
        },
        (err) => {
          this.toastr.error(err?.error?.message, "Error while login!", {
            timeOut: 3000,
          });
        }
      );
  }
}
