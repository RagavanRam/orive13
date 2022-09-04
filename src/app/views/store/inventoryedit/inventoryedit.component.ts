import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Component, OnInit, ViewChild } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  JsonpClientBackend,
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { DataLayerService } from "src/app/shared/services/data-layer.service";
// import { stringify } from "querystring";
import { AuthService } from "src/app/shared/services/auth.service";
import { getLocaleDateTimeFormat } from "@angular/common";
import Swal from "sweetalert2";
@Component({
  selector: "app-inventoryedit",
  templateUrl: "./inventoryedit.component.html",
  styleUrls: ["./inventoryedit.component.scss"],
})
export class InventoryeditComponent implements OnInit {
  invState = "retail";
  societyForm: any | any;
  societyTypeList = ["Flat", "Villas"];
  societyImages: any = [];
  no_phases: number = 1;
  no_blocks: number = 1;
  phaseData: any = [];

  env = environment;
  state_list = [];
  city_list = [];
  board_type_list = [];
  store_type_list = [];
  createInventory: FormGroup;
  storeType: FormGroup;
  stateName: FormGroup;
  cityName: FormGroup;
  boardType: FormGroup;
  storeName = new FormControl("", Validators.required);
  store_type = new FormControl("", Validators.required);
  board_type = new FormControl("");
  phone_no = new FormControl("");
  doorno = new FormControl("", Validators.required);
  street = new FormControl("", Validators.required);
  address = new FormControl("", Validators.required);
  ownerName = new FormControl("", Validators.required);
  ownerMobileNo = new FormControl("", [
    Validators.required,
    Validators.maxLength(10),
    Validators.minLength(10),
  ]);
  gstin = new FormControl("");
  owneremail = new FormControl("");

  fv_file = new FormControl("", Validators.required);
  fvcu_file = new FormControl("", Validators.required);
  ls_file = new FormControl("", Validators.required);
  rs_file = new FormControl("", Validators.required);
  consentform_field = new FormControl("", Validators.required);
  board_file = new FormControl("");
  b_width = new FormControl("", Validators.required);
  b_height = new FormControl("", Validators.required);
  pincode = new FormControl("", [
    Validators.required,
    Validators.maxLength(6),
    Validators.minLength(3),
  ]);
  city = new FormControl("", Validators.required);
  state = new FormControl("", Validators.required);
  lat = 0;
  lng = 0;
  marker: Marker = {
    lat: this.lat,
    lng: this.lng,
    draggable: true,
    label: this.storeName.value ? this.storeName.value : null,
  };
  desc = new FormControl("");
  newStoreType = new FormControl("", Validators.required);
  newCity = new FormControl("", Validators.required);
  newState = new FormControl("", Validators.required);
  newboardType = new FormControl("", Validators.required);
  fv_imagefile: File;
  fvcu_imagefile: File;
  ls_imagefile: File;
  rs_imagefile: File;
  consentform_file: File;
  board_imagefile: File;
  id: any;
  store: any;
  editMode: boolean = false;
  images: any[];
  dataloaded: boolean = false;
  fv_edit: boolean = false;
  fvcu_edit: boolean = false;
  ls_edit: boolean = false;
  rs_edit: boolean = false;
  b_edit: boolean = false;
  consent_edit: boolean = false;
  currLat = 0.0;
  currLng = 0.0;
  deletedFileIndexes = [];
  zoom = 20;
  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private dataservice: DataLayerService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {
    this.createInventory = fb.group({
      store_type: this.store_type,
      board_type: this.board_type,
      storeName: this.storeName,
      pincode: this.pincode,
      phone_no: this.phone_no,
      doorno: this.doorno,
      address: this.address,
      street: this.street,
      state: this.state,
      city: this.city,
      b_width: this.b_width,
      b_height: this.b_height,
      ownerName: this.ownerName,
      ownerMobileNo: this.ownerMobileNo,
      gstin: this.gstin,
      owneremail: this.owneremail,
      desc: this.desc,
    });
    this.storeType = fb.group({ newStoreType: this.newStoreType });
    this.stateName = fb.group({ newState: this.newState });
    this.cityName = fb.group({ newCity: this.newCity });
    this.boardType = fb.group({ newboardType: this.newboardType });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.id = params["id"];
      this.editMode = true;
      this.loadInventoryDetailsForEdit();
    });
    navigator.geolocation.getCurrentPosition((geo) => {
      //this.lat = this.marker.lat = geo.coords.latitude;
      //this.lng = this.marker.lng = geo.coords.longitude;
      this.currLat = geo.coords.latitude;
      this.currLng = geo.coords.longitude;
    });
    this.loadMasterData();
  }
  loadMasterData() {
    this.dataservice.getStoreTypes().subscribe((data: any) => {
      if (data) {
        this.store_type_list = data.data;
      }
    });
    this.dataservice.getCities().subscribe((data: any) => {
      if (data) {
        this.city_list = data.data;
      }
    });

    this.dataservice.getStates().subscribe((data: any) => {
      if (data) {
        this.state_list = data.data;
      }
    });
    this.dataservice.getBoardTypes().subscribe((data: any) => {
      if (data) {
        this.board_type_list = data.data;
      }
    });
  }
  async loadInventoryDetailsForEdit() {
    await this.http
      .get(
        environment.backend +
          "inventories/" +
          this.id +
          "?populate=*" +
          "&filters[createdbyuser][id][$eq]=" +
          this.authService.userId.value
      )
      .toPromise()
      .then((data: any) => {
        if (data) {
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
          this.store = data.data;
          //console.log(this.store);
          // this.images = data.data.attributes.storepics;
          // this.images.push(data.data.attributes.boards);

          if (this.store.attributes.inventorytype) {
            this.invState = "society";
            console.log(this.invState);
          }
          this.dataloaded = true;
          console.log(this.store);
          this.createInventory.setValue({
            store_type: this.store.attributes?.storetype?.data?.id
              ? this.store.attributes?.storetype?.data?.id
              : "",
            board_type: this.store.attributes?.board_type?.data
              ? this.store.attributes?.board_type?.data?.id
              : null,
            storeName: this.store.attributes?.inventoryname,
            pincode: this.store.attributes.pincode,
            phone_no: this.store.attributes?.contactno_1,
            doorno: this.store.attributes.doorno,
            address: this.store.attributes.address,
            street: this.store.attributes.streetroad,
            state: this.store.attributes.state.data.id,
            city: this.store.attributes.city.data.id,
            b_width: this.store.attributes?.boards?.width
              ? this.store.attributes?.boards?.width
              : "",
            b_height: this.store.attributes?.boards?.height
              ? this.store.attributes?.boards?.height
              : "",
            ownerName: this.store.attributes.contactperson,
            ownerMobileNo: this.store.attributes.mobileno,
            gstin: this.store.attributes?.gstin,
            owneremail: this.store.attributes?.email,
            desc:
              this.store.attributes.boards?.description != null
                ? this.store.attributes.boards?.description
                : "",
          });

          this.lat = this.marker.lat = this.store.attributes?.latitude;
          this.lng = this.marker.lng = this.store.attributes?.longitude;
          this.enableFileUpload();

          // for (let i = 0; i < this.store.attributes.no_of_phases; i++) {
          //   (this.phaseData).push({
          //     phasename: '',
          //     blocks: [{
          //       blockname: '',
          //       invs: [
          //         {
          //           invType: '',
          //           invImage: ''
          //         }
          //       ]
          //     }]
          //   })
          // }

          // societyFormData
          for (let i = 0; i < this.store.attributes.no_of_phases; i++) {
            this.phaseData.push({
              phasename: "",
              blocks: [],
            });
          }

          if (data.data.attributes.invpics) {
            for (let item of this.store.attributes.invpics) {
              this.phaseData[item.metadata.phaseno]["phasename"] =
                item.metadata.phasename;
            }
            for (let item of this.store.attributes.invpics) {
              this.phaseData[item.metadata.phaseno].blocks[item.metadata.blockno] = {
                blockname: item.metadata.blockname,
                invs: [],
              };
            }
            for (let item of this.store.attributes.invpics) {
              this.phaseData[item.metadata.phaseno].blocks[
                item.metadata.blockno
              ].invs.push({
                invType: item.metadata?.postertype
                  ? item.metadata?.postertype
                  : "",
                invImage: environment.backendfileURI + item.filepath,
                invId: +item.fileid,
                invIndex: item.id
              });
            }
          }

          //   this.societyForm.setValue({
          //     societyInfo: new FormGroup({
          //       societyName: new FormControl(this.store.attributes?.inventoryname, Validators.required),
          //       societyType: new FormControl(this.store.attributes.societytype, Validators.required),
          //       no_of_flates: new FormControl(this.store.attributes.no_of_flats, Validators.required),
          //       no_phases: new FormControl(this.store.attributes.no_of_phases != 0? this.store.attributes.no_of_phases: 1, Validators.required),
          //       no_blocks: new FormControl(this.store.attributes.no_blocks_in_phases != 0? this.store.attributes.no_blocks_in_phases: 1, Validators.required),
          //       phase_blocks: new FormArray([new FormControl(1, Validators.required)]),
          //       door_no: new FormControl(this.store.attributes.doorno, Validators.required),
          //       street: new FormControl(this.store.attributes.streetroad, Validators.required),
          //       address: new FormControl(this.store.attributes.address, Validators.required),
          //       city: new FormControl(this.store.attributes.city.data.id, Validators.required),
          //       state: new FormControl(this.store.attributes.state.data.id, Validators.required),
          //       pincode: new FormControl(this.store.attributes.pincode, Validators.required),
          //       latitude: new FormControl(this.store.attributes.latitude),
          //       longtitude: new FormControl(this.store.attributes.longitude),
          //     }),
          //     contactPersonInfo: new FormGroup({
          //       contactPersonName: new FormControl(this.store.attributes.contactperson, Validators.required),
          //       contactDesignation: new FormControl(this.store.attributes.contact_designation, Validators.required),
          //       contact_no_1: new FormControl(this.store.attributes.contactno_1, Validators.required),
          //       contact_no_2: new FormControl(this.store.attributes.contactno_2),
          //       email_1: new FormControl(this.store.attributes.ccontactemail_1, Validators.required),
          //       email_2: new FormControl(this.store.attributes.ccontactemail_1),
          //     }),
          //     phases: new FormArray([]),
          // })
          this.initForm();

          this.onAddPhaseBlocksFields();

          console.log(this.phaseData);
        }
      });
  }

  enableFileUpload() {
    if (this.store.attributes?.storepics?.length == 0) {
      this.fv_edit = true;
      this.fvcu_edit = true;
      this.ls_edit = true;
      this.rs_edit = true;
    }
    if (
      this.store.attributes?.boards?.filepath == "" ||
      this.store.attributes?.boards?.filepath == null ||
      this.store.attributes?.boards.length == 0
    ) {
      this.b_edit = true;
    }
    if (
      this.store.attributes?.agreement?.filepath == "" ||
      this.store.attributes?.agreement?.filepath == null ||
      this.store.attributes?.agreement.length == 0
    ) {
      this.consent_edit = true;
    }

    if (
      this.store.attributes?.invpics[0]?.filepath == "" ||
      this.store.attributes?.invpics[0] == null
    ) {
      this.fv_edit = true;
    }
    if (
      this.store.attributes?.invpics[1]?.filepath == "" ||
      this.store.attributes?.invpics[1] == null
    ) {
      this.fvcu_edit = true;
    }
    if (
      this.store.attributes?.invpics[2]?.filepath == "" ||
      this.store.attributes?.invpics[2] == null
    ) {
      this.ls_edit = true;
    }
    if (
      this.store.attributes?.invpics[3]?.filepath == "" ||
      this.store.attributes?.invpics[3] == null
    ) {
      this.rs_edit = true;
    }
  }
  storeInfoSubmit(e): void {
    console.log("store info submit");
    if (this.store_type.value == "") {
      this.toastr.error("Store type cannot be empty!", "error!", {
        timeOut: 3000,
      });
      return;
    }
    if (this.city.value == "") {
      this.toastr.error("City cannot be empty!", "error!", {
        timeOut: 3000,
      });
      return;
    }
    if (this.state.value == "") {
      this.toastr.error("state cannot be empty!", "error!", {
        timeOut: 3000,
      });
      return;
    }

    /*if (this.fv_imagefile?.name == null || this.fvcu_imagefile == null || this.ls_imagefile == null || this.rs_imagefile == null || this.board_imagefile == null) {
      this.toastr.error("Please upload all the store photos!", "error!", {
        timeOut: 3000,
      });
      return;
    }*/

    var keys = Object.values(this.board_type_list);
    const boardtypename = this.board_type_list.filter(
      (item) => item.id === Number(this.board_type?.value)
    );

    const storeImageFormData = new FormData();

    if (this.store.attributes?.invpics.length == 0) {
      storeImageFormData.append(
        `files`,
        this.fv_imagefile,
        this.fv_imagefile?.name
      );
      storeImageFormData.append(
        `files`,
        this.fvcu_imagefile,
        this.fvcu_imagefile?.name
      );
      storeImageFormData.append(
        `files`,
        this.ls_imagefile,
        this.ls_imagefile?.name
      );
      storeImageFormData.append(
        `files`,
        this.rs_imagefile,
        this.rs_imagefile?.name
      );
    } else {
      if (this.store.attributes?.invpics[0]?.filepath == "") {
        storeImageFormData.append(
          `files`,
          this.fv_imagefile,
          this.fv_imagefile.name
        );
      }
      if (this.store.attributes?.invpics[1]?.filepath == "") {
        storeImageFormData.append(
          `files`,
          this.fvcu_imagefile,
          this.fvcu_imagefile.name
        );
      }
      if (this.store.attributes?.invpics[2]?.filepath == "") {
        storeImageFormData.append(
          `files`,
          this.ls_imagefile,
          this.ls_imagefile.name
        );
      }
      if (this.store.attributes?.invpics[3]?.filepath == "") {
        storeImageFormData.append(
          `files`,
          this.rs_imagefile,
          this.rs_imagefile.name
        );
      }
    }
    if (
      this.store.attributes?.agreement?.filepath == "" ||
      this.store.attributes?.agreement?.filepath == null ||
      (this.store.attributes?.agreement.length == 0 && this.consentform_file)
    ) {
      storeImageFormData.append(
        `files`,
        this.consentform_file,
        this.consentform_file?.name
      );
    }

    //Always upload board image in the end
    if (
      (this.store.attributes?.boards?.filepath == "" ||
        this.store.attributes?.boards?.filepath == null ||
        this.store.attributes?.boards.length == 0) &&
      this.board_imagefile
    ) {
      storeImageFormData.append(
        `files`,
        this.board_imagefile,
        this.board_imagefile.name
      );
    }

    const storeFormData = new FormData();

    let storepicIds = [];

    let boardpics;
    let consentform = {};
    if (storeImageFormData.has("files")) {
      //upload store photos in step 1 and in the call back collect the ids and use it for store creation.
      this.http
        .post(environment.backend + "upload", storeImageFormData)
        .subscribe(
          (data: any) => {
            if (data) {
              let i = 0;
              for (let pic of data) {
                //Get uploaded photos in order.
                if (i <= this.deletedFileIndexes.length) {
                  var tag = "";
                  switch (this.deletedFileIndexes[i]) {
                    case 0:
                      tag = "Store Front View";
                      this.store.attributes.invpics[
                        this.deletedFileIndexes[i]
                      ] = {
                        photo: pic.id,
                        fileid: pic.id,
                        filepath: pic.url,
                        viewtype: tag,
                        latitude: this.currLat,
                        longitude: this.currLng,
                      };
                      break;
                    case 1:
                      tag = "Store Closeup View";
                      this.store.attributes.invpics[
                        this.deletedFileIndexes[i]
                      ] = {
                        photo: pic.id,
                        fileid: pic.id,
                        filepath: pic.url,
                        viewtype: tag,
                        latitude: this.currLat,
                        longitude: this.currLng,
                      };
                      break;
                    case 2:
                      tag = "Left Side Street View";
                      this.store.attributes.invpics[
                        this.deletedFileIndexes[i]
                      ] = {
                        photo: pic.id,
                        fileid: pic.id,
                        filepath: pic.url,
                        viewtype: tag,
                        latitude: this.currLat,
                        longitude: this.currLng,
                      };
                      break;
                    case 3:
                      tag = "Right Side Street View";
                      this.store.attributes.invpics[
                        this.deletedFileIndexes[i]
                      ] = {
                        photo: pic.id,
                        fileid: pic.id,
                        filepath: pic.url,
                        viewtype: tag,
                        latitude: this.currLat,
                        longitude: this.currLng,
                      };
                      break;
                    case 4:
                      consentform = {
                        photo: pic?.id,
                        fileid: pic?.id,
                        filepath: pic?.url,
                        board_type: this.board_type?.value,
                        boardtype: boardtypename[0]?.attributes?.typename,
                        latitude: this.currLat,
                        longitude: this.currLng,
                        width: this.b_width.value,
                        height: this.b_height.value,
                        description: this.desc.value,
                      };
                      break;
                    case 5:
                      boardpics = {
                        photo: pic?.id,
                        fileid: pic?.id,
                        filepath: pic?.url,
                        board_type: this.board_type?.value,
                        boardtype: boardtypename[0]?.attributes?.typename,
                        latitude: this.currLat,
                        longitude: this.currLng,
                        width: this.b_width.value,
                        height: this.b_height.value,
                        description: this.desc.value,
                      };
                      break;
                  }
                }

                let inc = 1 + i;
                i = inc;
              }
              const storedata = {
                inventoryname: this.storeName.value,
                doorno: this.doorno.value,
                streetroad: this.street.value,
                address: this.address.value,
                storetype: `${this.store_type.value}`,
                city: `${this.city.value}`,
                state: `${this.state.value}`,
                pincode: this.pincode.value,
                contactno_1:
                  this.phone_no.value?.length > 0 ? this.phone_no.value : null,
                board_type:
                  this.board_type.value?.length > 0
                    ? this.board_type?.value
                    : null,
                latitude: this.lat,
                longitude: this.lng,
                contactperson: this.ownerName.value,
                mobileno: this.ownerMobileNo.value,
                gstin: this.gstin.value,
                email: this.owneremail.value,
                createdbyuser: Number(this.authService.userId.value),
                temprefno:
                  this.authService.username.value +
                  "-" +
                  Date.now() +
                  "-" +
                  this.pincode.value,
                invpics: this.store.attributes.invpics,
                boards: boardpics
                  ? boardpics
                  : {
                      board_type:
                        this.board_type.value?.length > 0
                          ? this.board_type?.value
                          : null,
                      boardtype: boardtypename[0]?.attributes?.typename,
                      latitude: this.currLat,
                      longitude: this.currLng,
                      width: this.b_width.value,
                      height: this.b_height.value,
                      description: this.desc.value,
                    },
                agreement: consentform,
                status: "1",
                availability: "available",
              };
              storeFormData.append("data", JSON.stringify(storedata));
              console.log(storedata);
              this.http
                .put(
                  environment.backend + "inventories/" + this.store.id,
                  storeFormData
                )
                .subscribe(
                  (data: any) => {
                    if (data) {
                      this.toastr.success("Store data updated!", "Success!", {
                        timeOut: 3000,
                      });
                      this.createInventory.reset();
                      this.router.navigateByUrl(
                        "inventory/details?id=" + data.data.id
                      );
                    }
                  },
                  (err) => {
                    if (err.error) {
                      this.toastr.error(
                        JSON.stringify(err),
                        "Error while updating store!",
                        {
                          timeOut: 3000,
                        }
                      );
                    }
                  }
                );
            }
          },
          (err) => {
            if (err.error) {
              this.toastr.error(
                JSON.stringify(err),
                "Error while updating store!",
                {
                  timeOut: 3000,
                }
              );
              //this.createInventory.reset();
            }
          }
        );
    } else {
      const storedata = {
        inventoryname: this.storeName.value,
        doorno: this.doorno.value,
        streetroad: this.street.value,
        address: this.address.value,
        storetype: this.store_type.value,
        city: this.city.value,
        state: this.state.value,
        pincode: this.pincode.value,
        contactno_1: this.phone_no.value,
        board_type: this.board_type.value,
        latitude: this.lat,
        longitude: this.lng,
        contactperson: this.ownerName.value,
        mobileno: this.ownerMobileNo.value,
        gstin: this.gstin.value,
        email: this.owneremail.value,
        createdbyuser: Number(this.authService.userId.value),
        temprefno:
          this.authService.username.value +
          "-" +
          Date.now() +
          "-" +
          this.pincode.value,
        storepics: this.store.attributes.storepics,
        boards: boardpics
          ? boardpics
          : {
              board_type: this.board_type?.value,
              boardtype: boardtypename[0]?.attributes?.typename,
              latitude: this.currLat,
              longitude: this.currLng,
              width: this.b_width.value,
              height: this.b_height.value,
              description: this.desc.value,
            },
        status: "1",
        availability: "available",
      };
      storeFormData.append("data", JSON.stringify(storedata));
      console.log(storedata);
      this.http
        .put(
          environment.backend + "inventories/" + this.store.id,
          storeFormData
        )
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success("Store Updated!", "Success!", {
                timeOut: 3000,
              });
              this.createInventory.reset();
              this.router.navigateByUrl("inventory/details?id=" + data.data.id);
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
            }
          }
        );
    }
  }
  onFileChanged(event, view: string) {
    const file = event.target.files[0];
    if (view === "front_view") {
      this.fv_imagefile = event.target.files[0];
      this.fv_file.setValue(file);
      this.deletedFileIndexes.push(0);
    } else if (view === "front_view_close_up") {
      this.fvcu_imagefile = event.target.files[0];
      this.fvcu_file.setValue(file);
      this.deletedFileIndexes.push(1);
    } else if (view === "left_side") {
      this.ls_file.setValue(file);
      this.ls_imagefile = event.target.files[0];
      this.deletedFileIndexes.push(2);
    } else if (view === "right_side") {
      this.rs_file.setValue(file);
      this.deletedFileIndexes.push(3);
      this.rs_imagefile = event.target.files[0];
    } else if (view === "consentform_field") {
      this.deletedFileIndexes.push(4);
      this.consentform_field.setValue(file);
      this.consentform_file = event.target.files[0];
    } else if (view === "board_file") {
      this.board_file.setValue(file);
      this.deletedFileIndexes.push(5);
      this.board_imagefile = event.target.files[0];
    }
  }
  mapClicked($event: any): void {
    this.lat = this.marker.lat = $event.coords.lat;
    this.lng = this.marker.lng = $event.coords.lng;
  }

  deleteImage(whichimage: any) {
    Swal.fire({
      title: "Are you sure you want to Edit?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      icon: "warning",
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */

      if (result.isConfirmed) {
        this.removeImage(whichimage);
      }
    });
  }

  removeImage(whichimage: any) {
    switch (whichimage) {
      case "frontview":
        this.store.attributes.storepics[0].filepath = "";
        this.fv_edit = true;
        this.createInventory.addControl("fv_file", this.fv_file);
        break;
      case "frontviewcloseup":
        this.store.attributes.storepics[1].filepath = "";
        this.fvcu_edit = true;
        this.createInventory.addControl("fvcu_file", this.fvcu_file);
        break;
      case "leftside":
        this.store.attributes.storepics[2].filepath = "";
        this.ls_edit = true;
        this.createInventory.addControl("ls_file", this.ls_file);
        break;
      case "rightside":
        this.store.attributes.storepics[3].filepath = "";
        this.rs_edit = true;
        this.createInventory.addControl("rs_file", this.rs_file);
        break;
      case "agreement":
        this.consent_edit = true;
        this.store.attributes.agreement.filepath = "";
        this.createInventory.addControl(
          "consentform_field",
          this.consentform_field
        );
        break;
      case "board":
        this.b_edit = true;
        this.store.attributes.boards.filepath = "";
        this.createInventory.addControl("board_file", this.board_file);
        break;
    }
  }
  downloadFile(path: any) {
    console.log(path);
    window.open(this.env.backendfileURI + path);
  }

  get phaseBlocksControls() {
    return (<FormArray>this.societyForm.get(["societyInfo", "phase_blocks"]))
      .controls;
  }

  get PhasesControls() {
    return (<FormArray>this.societyForm.get("phases")).controls;
  }

  getblocksControls(data: FormGroup) {
    return (<FormArray>data.get("blocks")).controls;
  }

  getinventoryControls(data: FormGroup) {
    return (<FormArray>data.get("inventories")).controls;
  }

  getImg(phaseIndex: number, blockIndex: number, inventoryIndex: number) {
    return (<FormControl>(
      this.societyForm.get([
        "phases",
        phaseIndex,
        "blocks",
        blockIndex,
        "inventories",
        inventoryIndex,
        "previewImage",
      ])
    )).value;
  }

  setImgPreviewControlValue(
    event: any,
    preview: any,
    phaseIndex: number,
    blockIndex: number,
    inventoryIndex: number,
    phaseId: any,
    invIndex: any
  ) {
    console.log(phaseIndex, blockIndex, inventoryIndex);
    if (event.target.files[0]) {
      if (event.target.files[0]) {
        let selectedFile = <File>event.target.files[0];
        // this.societyImages[phaseIndex][blockIndex][inventoryIndex] = {
        //   name: `files`,
        //   value: selectedFile,
        //   fileName: selectedFile.name,
        // };
        let updatedImg = true;
        if (phaseId === null) {
          updatedImg = false;
        }
        this.societyImages[phaseIndex][blockIndex][inventoryIndex] = {
          phaseno: phaseIndex,
          blockno: blockIndex,
          invno: inventoryIndex,
          invid: phaseId,
          invIndex: invIndex,
          isUpdated: updatedImg,
          data: {
            name: "files",
            value: selectedFile,
            fileName: selectedFile.name,
          },
        };
      }
      var reader = new FileReader();
      reader.readAsDataURL(event.target.files[0]);
      reader.onload = (event: any) => {
        let url = event.target.result;
        preview.src = url;
      };
    }
    console.log(this.societyImages);
  }

  countNoOfBlocks() {
    let totalPhases = (<FormControl>(
      this.societyForm.get(["societyInfo", "no_phases"])
    )).value;
    let i: number = 0;
    let totelBlocks = 0;
    for (i; i < totalPhases; i++) {
      totelBlocks =
        totelBlocks +
        (<FormArray>this.societyForm.get(["societyInfo", "phase_blocks", i]))
          .value;
    }
    (<FormControl>this.societyForm.get(["societyInfo", "no_blocks"])).setValue(
      totelBlocks
    );
  }

  onAddPhaseBlocksFields() {
    (<FormArray>this.societyForm.get(["phases"])).clear();
    this.societyImages = [];
    (<FormArray>this.societyForm.get(["societyInfo", "phase_blocks"])).clear();
    let num = (<FormControl>this.societyForm.get(["societyInfo", "no_phases"]))
      .value;
    if (num === 0) {
      (<FormControl>(
        this.societyForm.get(["societyInfo", "no_phases"])
      )).setValue(1);
      num = (<FormControl>this.societyForm.get(["societyInfo", "no_phases"]))
        .value;
    }
    let i: number;
    for (i = 0; i < num; i++) {
      if (this.phaseData[i]) {
        (<FormArray>this.societyForm.get(["societyInfo", "phase_blocks"])).push(
          new FormControl(this.phaseData[i].blocks.length, Validators.required)
        );
        <FormArray>this.societyForm.get(["phases"]).push(
          new FormGroup({
            phaseName: new FormControl(
              this.phaseData[i].phasename,
              Validators.required
            ),
            blocks: new FormArray([
              new FormGroup({
                blockName: new FormControl("", Validators.required),
                inventories: new FormArray([
                  new FormGroup({
                    inventoryType: new FormControl("", Validators.required),
                    inventoryImage: new FormControl(null, Validators.required),
                    previewImage: new FormControl(""),
                  }),
                ]),
              }),
            ]),
          })
        );
        this.societyImages.push([[{}]]);
      } else {
        (<FormArray>this.societyForm.get(["societyInfo", "phase_blocks"])).push(
          new FormControl(1, Validators.required)
        );
        this.onAddPhase();
      }
    }
    if (this.phaseData) {
      for (i = 0; i < num; i++) {
        this.onAddBlocksToPhase(i);
      }
    }
    this.countNoOfBlocks();
  }

  onAddBlocksToPhase(phaseBlockIndex: number) {
    let num = (<FormControl>(
      this.societyForm.get(["societyInfo", "phase_blocks", phaseBlockIndex])
    )).value;
    if (num === 0) {
      (<FormControl>(
        this.societyForm.get(["societyInfo", "phase_blocks", phaseBlockIndex])
      )).setValue(1);
      num = (<FormControl>(
        this.societyForm.get(["societyInfo", "phase_blocks", phaseBlockIndex])
      )).value;
    }
    (<FormArray>(
      this.societyForm.get(["phases", phaseBlockIndex, "blocks"])
    )).clear();
    this.societyImages[phaseBlockIndex] = [];
    let i: number = 0;
    for (i; i < num; i++) {
      if (this.phaseData[phaseBlockIndex]?.blocks[i]) {
        let invs = []
        var newArray: FormArray = new FormArray([]);
        for (
          let j = 0;
          j < this.phaseData[phaseBlockIndex].blocks[i].invs.length;
          j++
        ) {
          newArray.push(
            new FormGroup({
              inventoryType: new FormControl(
                this.phaseData[phaseBlockIndex].blocks[i].invs[j].invType,
                Validators.required
              ),
              inventoryImage: new FormControl(""),
              previewImage: new FormControl(
                this.phaseData[phaseBlockIndex].blocks[i].invs[j].invImage
              ),
            })
          );
          invs.push({});
        }
        <FormArray>(
          this.societyForm.get(["phases", phaseBlockIndex, "blocks"]).push(
            new FormGroup({
              blockName: new FormControl(
                this.phaseData[phaseBlockIndex].blocks[i].blockname,
                Validators.required
              ),
              inventories: newArray,
            })
          )
        );
        this.societyImages[phaseBlockIndex].push(invs);
        console.log(this.societyImages);
      } else {
        this.onAddBlock(phaseBlockIndex);
      }
    }
    this.countNoOfBlocks();
  }

  onAddInventory(
    phaseIndex: number,
    blockIndex: number,
    inventoryIndex: number
  ) {
    <FormArray>(
      this.societyForm
        .get(["phases", phaseIndex, "blocks", blockIndex, "inventories"])
        .insert(
          inventoryIndex + 1,
          new FormGroup({
            inventoryType: new FormControl("", Validators.required),
            inventoryImage: new FormControl("", Validators.required),
            previewImage: new FormControl(""),
          })
        )
    );
    this.societyImages[phaseIndex][blockIndex][inventoryIndex + 1] = {};
  }

  onAddBlock(phaseIndex: number) {
    <FormArray>this.societyForm.get(["phases", phaseIndex, "blocks"]).push(
      new FormGroup({
        blockName: new FormControl("", Validators.required),
        inventories: new FormArray([
          new FormGroup({
            inventoryType: new FormControl("", Validators.required),
            inventoryImage: new FormControl("", Validators.required),
            previewImage: new FormControl(""),
          }),
        ]),
      })
    );
    this.societyImages[phaseIndex].push([[{}]]);
  }

  onAddPhase() {
    <FormArray>this.societyForm.get(["phases"]).push(
      new FormGroup({
        phaseName: new FormControl("", Validators.required),
        blocks: new FormArray([
          new FormGroup({
            blockName: new FormControl("", Validators.required),
            inventories: new FormArray([
              new FormGroup({
                inventoryType: new FormControl("", Validators.required),
                inventoryImage: new FormControl(null, Validators.required),
                previewImage: new FormControl(""),
              }),
            ]),
          }),
        ]),
      })
    );
    this.societyImages.push([[{}]]);
    console.log(this.societyImages);
  }

  onDeletePhase(phaseIndex: number) {
    if (phaseIndex == 0) {
      return;
    }
    this.no_phases = this.no_phases - 1;
    (<FormControl>this.societyForm.get(["societyInfo", "no_phases"])).setValue(
      this.no_phases
    );
    <FormArray>this.societyForm.get(["phases"]).removeAt(phaseIndex);
  }

  onDeleteBlock(phaseIndex: number, blockIndex: number) {
    if (blockIndex == 0) {
      return;
    }
    this.no_blocks = this.no_blocks - 1;
    (<FormControl>this.societyForm.get(["societyInfo", "no_blocks"])).setValue(
      this.no_blocks
    );
    <FormArray>(
      this.societyForm
        .get(["phases", phaseIndex, "blocks"])
        .removeAt(blockIndex)
    );
  }

  async onDeleteInventory(
    phaseIndex: number,
    blockIndex: number,
    inventoryIndex: number
  ) {
    if (inventoryIndex == 0) {
      return;
    }
    <FormArray>(
      this.societyForm
        .get(["phases", phaseIndex, "blocks", blockIndex, "inventories"])
        .removeAt(inventoryIndex)
    );
    console.log(phaseIndex, blockIndex, inventoryIndex);
    console.log(this.societyImages[phaseIndex][blockIndex]);
    this.societyImages[phaseIndex][blockIndex].splice(inventoryIndex, 1);
    this.societyImages = this.societyImages
    console.log(this.societyImages);
  }

  phaseNameChanged(phaseIndex: number) {
    for (let i = 0; i < (this.store.attributes.invpics).length; i++) {
      if (this.store.attributes.invpics[i].metadata.phaseno == phaseIndex) {
        let value = (<FormControl>this.societyForm.get(['phases', phaseIndex, 'phaseName'])).value
        console.log(value);
        this.store.attributes.invpics[i].metadata.phasename = value
      }
    }
  }

  blockNameChanged(phaseIndex: number, blockIndex: number) {
    for (let i = 0; i < (this.store.attributes.invpics).length; i++) {
      if (this.store.attributes.invpics[i].metadata.phaseno == phaseIndex && this.store.attributes.invpics[i].metadata.blockno == blockIndex) {
        let value = (<FormControl>this.societyForm.get(['phases', phaseIndex, 'blocks', blockIndex, 'blockName'])).value;
        console.log(value);
        this.store.attributes.invpics[i].metadata.blockname = value
      }
    }
  }

  inventoryTypeChanged(phaseId: number, blockId: number, inventoryId: number, id: number) {
    if (id) {
      let value = (<FormControl>this.societyForm.get(['phases', phaseId, 'blocks', blockId, 'inventories', inventoryId, 'inventoryType'])).value;
      for (let i = 0; i < (this.store.attributes.invpics).length; i++) {
        if (this.store.attributes.invpics[i].id === id) {
          this.store.attributes.invpics[i].metadata.postertype = value;
        }
      }
    }
  }

  async societyFormSubmit() {
    if (this.societyForm.valid) {
      // get existing phase data changes
    let isImageUpdateFinished = true;
    let isnewImageUploded = true;
    let isError = false;
    let deletedImagesIds = [];
    let invData = [];
    for (let l of this.store?.attributes?.invpics) {
      let phaseno = l.metadata.phaseno;
      let blockno = l.metadata.blockno;
      let inventoryno = l.metadata.inventoryno;
      if (this.societyImages[phaseno]) {
        if (this.societyImages[phaseno][blockno]) {
          if (this.societyImages[phaseno][blockno][inventoryno]) {
            console.log(this.societyImages[phaseno][blockno][inventoryno]);
            invData.push(l);
          } else {
            deletedImagesIds.push(+l.fileid);
          }
        } else {
          deletedImagesIds.push(+l.fileid);
        }
      } else {
        deletedImagesIds.push(+l.fileid);
      }
    }

    console.log(invData);

    console.log(deletedImagesIds);

    // update existing images
    let newImages = [];
    let updatedImages = [];
    for (let phaseId = 0; phaseId < this.societyImages.length; phaseId++) {
      for (
        let blockId = 0;
        blockId < this.societyImages[phaseId].length;
        blockId++
      ) {
        for (
          var invId = 0;
          invId < this.societyImages[phaseId][blockId].length;
          invId++
        ) {
          if (this.societyImages[phaseId][blockId][invId]) {
            if (
              this.societyImages[phaseId][blockId][invId].isUpdated == false &&
              this.societyImages[phaseId][blockId][invId].data
            ) {
              newImages.push(this.societyImages[phaseId][blockId][invId]);
            }
            if (
              this.societyImages[phaseId][blockId][invId].isUpdated == true &&
              this.societyImages[phaseId][blockId][invId].data
            ) {
              updatedImages.push(this.societyImages[phaseId][blockId][invId]);
            }
          }
        }
      }
    }

    // newImages
    if ((newImages).length && isImageUpdateFinished) {
      isnewImageUploded = false;
      let newFormData = new FormData();
      for (let imgData of newImages) {
        newFormData.append(
          imgData.data.name,
          imgData.data.value,
          imgData.data.filename
        );
      }
      await this.http
        .post(environment.backend + "upload", newFormData)
        .toPromise()
        .then((res: any) => {
          if (res) {
            let index = 0;
            for (let pic of res) {
              let picData = {
                photo: `${pic.id}`,
                fileid: `${pic.id}`,
                filepath: pic.url,
                viewtype: "",
                latitude: this.currLat,
                longitude: this.currLng,
                metadata: {
                  phaseno: newImages[index].phaseno,
                  phasename: (<FormControl>(
                    this.societyForm.get([
                      "phases",
                      newImages[index].phaseno,
                      "phaseName",
                    ])
                  )).value,
                  blockno: newImages[index].blockno,
                  blockname: (<FormControl>(
                    this.societyForm.get([
                      "phases",
                      newImages[index].phaseno,
                      "blocks",
                      newImages[index].blockno,
                      "blockName",
                    ])
                  )).value,
                  inventoryno: newImages[index].invno,
                  postertype: (<FormControl>(
                    this.societyForm.get([
                      "phases",
                      newImages[index].phaseno,
                      "blocks",
                      newImages[index].blockno,
                      "inventories",
                      newImages[index].invno,
                      "inventoryType",
                    ])
                  )).value,
                },
              };
              invData.push(picData);
              index = +1;
            }
            isnewImageUploded = true;
          }
        }, async (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating store!",
              {
                timeOut: 3000,
              }
            );
          }
          if ((newImages).length) {
            for (let id of newImages) {
              await this.http.delete(environment.backend + "upload/files/" + id).toPromise().then(
                res => {
                  console.log(res);
                  newImages.shift();
                }
              )
            }
          }
          isError = true;
        });
    }

    // updateImages
    if ((updatedImages).length && isnewImageUploded) {
      isImageUpdateFinished = false
      let newFormData = new FormData();
      for (let imgData of updatedImages) {
        newFormData.append(
          imgData.data.name,
          imgData.data.value,
          imgData.data.filename
        );
      }
      let updateImagesId = [];
      await this.http
        .post(environment.backend + "upload", newFormData)
        .toPromise()
        .then((res: any) => {
          if (res) {
            let index = 0;
            for (let pic of res) {
              let picData = {
                photo: `${pic.id}`,
                fileid: `${pic.id}`,
                filepath: pic.url,
                viewtype: "",
                latitude: this.currLat,
                longitude: this.currLng,
                metadata: {
                  phaseno: updatedImages[index].phaseno,
                  phasename: (<FormControl>(
                    this.societyForm.get([
                      "phases",
                      updatedImages[index].phaseno,
                      "phaseName",
                    ])
                  )).value,
                  blockno: updatedImages[index].blockno,
                  blockname: (<FormControl>(
                    this.societyForm.get([
                      "phases",
                      updatedImages[index].phaseno,
                      "blocks",
                      updatedImages[index].blockno,
                      "blockName",
                    ])
                  )).value,
                  inventoryno: updatedImages[index].invno,
                  postertype: (<FormControl>(
                    this.societyForm.get([
                      "phases",
                      updatedImages[index].phaseno,
                      "blocks",
                      updatedImages[index].blockno,
                      "inventories",
                      updatedImages[index].invno,
                      "inventoryType",
                    ])
                  )).value,
                },
              };
              updateImagesId.push(pic.id);
              for (let j = 0; j < invData.length; j++) {
                if (invData[j].id == updatedImages[index].invIndex) {
                  deletedImagesIds.push(invData[j].fileid);
                  invData[j] = picData;
                }
              }
              index = +1;
            }
            isImageUpdateFinished = true;
          }
        }, async err => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating store!",
              {
                timeOut: 3000,
              }
            );
          }
          if ((updateImagesId).length) {
            for (let id of updateImagesId) {
              await this.http.delete(environment.backend + "upload/files/" + id).toPromise().then(
                res => {
                  console.log(res);
                  updateImagesId.shift();
                  isError = true;
                }
              )
            }
          }
        });
    }

    let societyData = this.societyForm.value;
    let submitData = {
      inventoryname: societyData.societyInfo.societyName,
      inventorytype: this.invState,
      societytype: societyData.societyInfo.societyType,
      no_of_flats: societyData.societyInfo.no_of_flates,
      no_of_phases: societyData.societyInfo.no_phases,
      no_blocks_in_phases: societyData.societyInfo.no_blocks,
      doorno: societyData.societyInfo.door_no,
      streetroad: societyData.societyInfo.street,
      address: societyData.societyInfo.address,
      city: `${societyData.societyInfo.city}`,
      state: `${societyData.societyInfo.state}`,
      pincode: societyData.societyInfo.pincode,
      latitude: this.lat,
      longitude: this.lng,
      contactperson: societyData.contactPersonInfo.contactPersonName,
      contact_designation: societyData.contactPersonInfo.contactDesignation,
      contactno_1: societyData.contactPersonInfo.contact_no_1,
      contactno_2: societyData.contactPersonInfo.contact_no_2,
      contactemail_1: societyData.contactPersonInfo.email_1,
      contactemail_2: societyData.contactPersonInfo.email_2,
      invpics: invData,
      updatedBy: this.authService.userId.value,
      temprefno:
        this.authService.username.value +
        "-" +
        Date.now() +
        "-" +
        this.pincode.value,
      availability: "available",
      status: 1
    };

    if (isImageUpdateFinished && isnewImageUploded && !isError) {
      let societySubmitData = new FormData()
      societySubmitData.append("data", JSON.stringify(submitData));
      await this.http
          .put(environment.backend + "inventories/" + this.store.id, societySubmitData)
          .toPromise()
          .then(
            async (data: any) => {
              if (data) {
                this.toastr.success("Society created!", "Success!", {
                  timeOut: 3000,
                });
                this.societyForm.reset();
                this.router.navigateByUrl("inventory/details?id=" + data.data.id);
              }
              if ((deletedImagesIds).length) {
                for (let imgid of deletedImagesIds) {
                  await this.http.delete(environment.backend + "upload/files/" + imgid).toPromise().then(
                    res => {
                      console.log(res);
                    }
                  )
                }
              }
            },
            async (err) => {
              if (err.error) {
                this.toastr.error(
                  JSON.stringify(err),
                  "Error while creating store!",
                  {
                    timeOut: 3000,
                  }
                );
              }
            }
          );
    }

    if (isError) {
      if ((newImages).length) {
        for (let id of newImages) {
          await this.http.delete(environment.backend + "upload/files/" + id).toPromise().then(
            res => {
              console.log(res);
            }
          )
        }
      }
      if ((updatedImages).length) {
        for (let id of updatedImages) {
          await this.http.delete(environment.backend + "upload/files/" + id).toPromise().then(
            res => {
              console.log(res);
            }
          )
        }
      }
    }
    }
  }

  private initForm() {
    this.societyForm = new FormGroup({
      societyInfo: new FormGroup({
        societyName: new FormControl(
          this.store.attributes?.inventoryname,
          Validators.required
        ),
        societyType: new FormControl(
          this.store.attributes.societytype,
          Validators.required
        ),
        no_of_flates: new FormControl(
          this.store.attributes.no_of_flats,
          Validators.required
        ),
        no_phases: new FormControl(
          this.store.attributes.no_of_phases != 0
            ? this.store.attributes.no_of_phases
            : 1,
          Validators.required
        ),
        no_blocks: new FormControl(
          this.store.attributes.no_blocks_in_phases != 0
            ? this.store.attributes.no_blocks_in_phases
            : 1,
          Validators.required
        ),
        phase_blocks: new FormArray([new FormControl(1, Validators.required)]),
        door_no: new FormControl(
          this.store.attributes.doorno,
          Validators.required
        ),
        street: new FormControl(
          this.store.attributes.streetroad,
          Validators.required
        ),
        address: new FormControl(
          this.store.attributes.address,
          Validators.required
        ),
        city: new FormControl(
          this.store.attributes.city.data.id,
          Validators.required
        ),
        state: new FormControl(
          this.store.attributes.state.data.id,
          Validators.required
        ),
        pincode: new FormControl(
          this.store.attributes.pincode,
          Validators.required
        ),
        latitude: new FormControl(this.store.attributes.latitude),
        longtitude: new FormControl(this.store.attributes.longitude),
      }),
      contactPersonInfo: new FormGroup({
        contactPersonName: new FormControl(
          this.store.attributes.contactperson,
          Validators.required
        ),
        contactDesignation: new FormControl(
          this.store.attributes.contact_designation,
          Validators.required
        ),
        contact_no_1: new FormControl(
          this.store.attributes.contactno_1,
          Validators.required
        ),
        contact_no_2: new FormControl(
          Number(this.store.attributes.contactno_2)
            ? this.store.attributes.contactno_2
            : ""
        ),
        email_1: new FormControl(
          this.store.attributes.contactemail_1,
          Validators.required
        ),
        email_2: new FormControl(this.store.attributes.contactemail_1),
      }),
      phases: new FormArray([]),
    });
  }
}
interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
