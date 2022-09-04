import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-store-edit",
  templateUrl: "./store-edit.component.html",
  styleUrls: ["./store-edit.component.scss"],
})
export class StoreEditComponent implements OnInit {
  env = environment;
  storeId: string;
  store_type_list = [];
  createStore: FormGroup;
  storeType: FormGroup;
  newStoreType = new FormControl("", Validators.required);
  storeName = new FormControl("", Validators.required);
  store_type = new FormControl("", Validators.required);
  board_type = new FormControl("LED", Validators.required);
  phone = new FormControl("", Validators.required);
  doorno = new FormControl("", [Validators.required, Validators.maxLength(8)]);
  street = new FormControl("", Validators.required);
  pincode = new FormControl("", [
    Validators.required,
    Validators.maxLength(5),
    Validators.minLength(6),
  ]);
  city = new FormControl("", [
    Validators.required,
    Validators.maxLength(11),
    Validators.minLength(8),
  ]);
  state = new FormControl("", Validators.required);
  lat = 0;
  lng = 0;
  marker: Marker = {
    lat: this.lat,
    lng: this.lng,
    draggable: true,
    label: this.storeName.value ? this.storeName.value : null,
  };

  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal
  ) {
    this.createStore = fb.group({
      store_type: this.store_type,
      board_type: this.board_type,
      storeName: this.storeName,
      pincode: this.pincode,
      doorno: this.doorno,
      street: this.street,
      state: this.state,
      city: this.city,
    });
    this.storeType = fb.group({ newStoreType: this.newStoreType });
  }

  ngOnInit(): void {
    this.storeId = localStorage.getItem("store_id");
    this.http.get(environment.backend + "stores/store_type").subscribe(
      (data: any) => {
        if (data) {
          this.store_type_list = data;
        }
      },
      (err) => {
        if (err.error) {
          this.toastr.error(JSON.stringify(err), "Error while registering!", {
            timeOut: 3000,
          });
        }
      }
    );
    navigator.geolocation.getCurrentPosition((geo) => {
      this.lat = geo.coords.latitude;
      this.marker.lat = geo.coords.latitude;
      this.lng = geo.coords.longitude;
      this.marker.lng = geo.coords.longitude;
    });
    this.http
      .get(environment.backend + `stores/store?id=${this.storeId}`)
      .subscribe((data: any) => {
        if (data) {
          this.store_type.setValue(data.store?.store_type_id);
          this.storeName.setValue(data.store?.name);
          this.doorno.setValue(data.store?.doorno);
          this.street.setValue(data.store?.street);
          this.city.setValue(data.store?.city);
          this.state.setValue(data.store?.state);
          this.pincode.setValue(data.store?.pincode);
          this.phone.setValue(data.store?.phone);
          this.board_type.setValue(data.store?.board_type);
          this.lat = data.store?.latitude;
          this.marker.lat = data.store?.latitude;
          this.lng = data.store?.longitude;
          this.marker.lng = data.store?.longitude;
        }
      });
  }

  mapClicked($event: any): void {
    this.lat = this.marker.lat = $event.coords.lat;
    this.lng = this.marker.lng = $event.coords.lng;
  }

  onSubmit(): void {
    const body = {
      id: this.storeId,
      name: this.storeName.value,
      doorno: this.doorno.value,
      street: this.street.value,
      store_type: this.store_type.value,
      city: this.city.value,
      pincode: this.pincode.value,
      state: this.state.value,
      phone: this.phone.value,
      board_type: this.board_type.value,
      latitude: this.lat,
      longitude: this.lng,
    };
    this.http
      .patch(
        environment.backend +
        `stores/store?user=${localStorage.getItem("username")}`,
        body
      )
      .subscribe(
        (data: any) => {
          if (data) {
            this.toastr.success("Store updated!", "Success!", {
              timeOut: 3000,
            });
            this.router.navigate(["inventory/list"]);
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating store!",
              {
                timeOut: 3000,
              }
            );
            this.createStore.reset();
          }
        }
      );
  }

  createStoreType(modal) {
    this.http
      .post(environment.backend + "stores/store_type", {
        type: this.newStoreType.value,
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.store_type_list = data?.data;
            modal();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating store type!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
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
}

interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}