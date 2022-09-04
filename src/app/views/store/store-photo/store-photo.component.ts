import { ToastrService } from "ngx-toastr";
import { ActivatedRoute } from "@angular/router";
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
  selector: "app-store-photo",
  templateUrl: "./store-photo.component.html",
  styleUrls: ["./store-photo.component.scss"],
})
export class StorePhotoComponent implements OnInit {
  page = 1;
  inventoryList = [];
  refno: string = "";
  storeName: string = "";
  inventoryForm: FormGroup;
  photo = new FormControl("", Validators.required);
  description = new FormControl("");
  photoType = new FormControl("", Validators.required);
  env = environment;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
    this.inventoryForm = fb.group({
      photo: this.photo,
      description: this.description,
      photoType: this.photoType,
    });
  }

  ngOnInit(): void {
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
    uploadPhoto.append("description", this.description.value);
    uploadPhoto.append("user", localStorage.getItem("username"));
    uploadPhoto.append("photo_type", this.photoType.value);
    uploadPhoto.append("refno", this.refno);

    if (this.photo) {
      this.http
        .post(environment.backend + "stores/photo", uploadPhoto)
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
      this.refno = params["ref"];
      this.storeName = params["name"];
    });
    this.http
      .get(
        environment.backend +
          `stores/photo?refno=${this.refno}&user=${localStorage.getItem("username")}`
      )
      .subscribe((data: any) => {
        if (data) {
          this.inventoryList = data.inventory;
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
        }
      });
  }
}
