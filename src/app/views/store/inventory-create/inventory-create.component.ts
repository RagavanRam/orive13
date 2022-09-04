import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  JsonpClientBackend,
} from "@angular/common/http";
import { ToastrService } from "ngx-toastr";
import { ActivatedRoute, Router } from "@angular/router";
import { DataLayerService } from "src/app/shared/services/data-layer.service";
// import { stringify } from "querystring";
import { AuthService } from "src/app/shared/services/auth.service";
import { getLocaleDateTimeFormat } from "@angular/common";
import { MapsAPILoader, MouseEvent } from "@agm/core";
import * as XLSX from "xlsx";
import { fi, fil } from "date-fns/locale";
import { min } from "date-fns";
import { async } from "rxjs/internal/scheduler/async";
declare var google: any;

@Component({
  selector: "app-inventory-create",
  templateUrl: "./inventory-create.component.html",
  styleUrls: ["./inventory-create.component.scss"],
})
export class InventoryCreateComponent implements OnInit {
  uploadType: string = "manual";
  fileName: string = "";
  finalData: {}[] | undefined;
  storeState: string = "retail";
  societyForm: any | undefined;
  societyImages: any = [];

  use(data: any) {
    this.uploadType = data;
  }

  chanegeStoreState() {
    this.storeState =
      this.storeState == "retail"
        ? (this.storeState = "society")
        : (this.storeState = "retail");
  }

  env = environment;
  state_list = [];
  city_list = [];
  board_type_list = [];
  store_type_list = [];
  societyTypeList = ["Flat", "Villas"];
  no_phases = 1;
  no_blocks = 1;
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
  pincode = new FormControl("", Validators.required);
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
  board_imagefile: File;
  consentform_file: File;
  currLat = 0.0;
  currLng = 0.0;
  private geoCoder;
  zoom = 20;
  @ViewChild("search")
  public searchElementRef: ElementRef;
  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private dataservice: DataLayerService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone
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
      fv_file: this.fv_file,
      fvcu_file: this.fvcu_file,
      ls_file: this.ls_file,
      rs_file: this.rs_file,
      consentform_field: this.consentform_field,
      board_file: this.board_file,
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
    /*this.http.get(environment.backend + "stores/store_type").subscribe(
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
    );*/
    navigator.geolocation.getCurrentPosition((geo) => {
      this.lat = this.marker.lat = geo.coords.latitude;
      this.lng = this.marker.lng = geo.coords.longitude;
      this.currLat = geo.coords.latitude;
      this.currLng = geo.coords.longitude;

      /* var latlng = new google.maps.LatLng(this.lat, this.lng);
       this.geoCoder = new google.maps.Geocoder;
       this.geoCoder.geocode({ 'latLng': latlng }, (results, status) => {
         if (status !== google.maps.GeocoderStatus.OK) {
           console.log(status);
         }
         // This is checking to see if the Geoeode Status is OK before proceeding
         if (status == google.maps.GeocoderStatus.OK) {
           console.log(results);
           var address = (results[0].formatted_address);
           console.log(address);
         }
       });*/
      /* Getting Address based on current location
            this.mapsAPILoader.load().then(() => {
              this.setCurrentLocation();
              this.geoCoder = new google.maps.Geocoder;
              let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
              autocomplete.addListener("place_changed", () => {
                this.ngZone.run(() => {
                  //get the place result
                  let place = autocomplete.getPlace();
      
                  //verify result
                  if (place.geometry === undefined || place.geometry === null) {
                    return;
                  }
      
                  //set latitude, longitude and zoom
                  this.lat = this.marker.lat = place.geometry.location.lat();
                  this.lng = this.marker.lng = place.geometry.location.lng();
                  this.zoom = 20;
                });
              });
            });*/
    });
    this.loadMasterData();
    this.initForm();
    this.onAddPhase();
  }

  // Get Current Location Coordinates
  private setCurrentLocation() {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((geo) => {
        this.lat = this.marker.lat = geo.coords.latitude;
        this.lng = this.marker.lng = geo.coords.longitude;
        this.currLat = geo.coords.latitude;
        this.currLng = geo.coords.longitude;
        this.zoom = 8;
        this.getAddress(this.lat, this.lng);
      });
    }
  }
  getAddress(latitude, longitude) {
    this.geoCoder.geocode(
      { location: { lat: latitude, lng: longitude } },
      (results, status) => {
        console.log(results);
        console.log(status);
        if (status === "OK") {
          if (results[0]) {
            this.zoom = 12;
            this.address = results[0].formatted_address;
          } else {
            window.alert("No results found");
          }
        } else {
          window.alert("Geocoder failed due to: " + status);
        }
      }
    );
  }
  markerDragEnd($event: MouseEvent) {
    console.log($event);
    this.lat = this.marker.lat = $event.coords.lat;
    this.lng = this.marker.lng = $event.coords.lng;
    this.getAddress(this.lat, this.lng);
  }

  loadMasterData() {
    this.dataservice.getStoreTypes().subscribe((data: any) => {
      if (data) {
        this.store_type_list = data.data;
      }
    });
    this.dataservice
      .getCities(this.authService.userstate.value)
      .subscribe((data: any) => {
        if (data) {
          this.city_list = data.data;
        }
      });

    this.dataservice
      .getStates(this.authService.userstate.value)
      .subscribe((data: any) => {
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

  mapClicked($event: any): void {
    this.lat = this.marker.lat = $event.coords.lat;
    this.lng = this.marker.lng = $event.coords.lng;
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

    if (
      this.fv_imagefile?.name == null ||
      this.fvcu_imagefile == null ||
      this.ls_imagefile == null ||
      this.rs_imagefile == null
    ) {
      this.toastr.error("Please upload all the store photos!", "error!", {
        timeOut: 3000,
      });
      return;
    }

    var keys = Object.values(this.board_type_list);
    const boardtypename = this.board_type_list.filter(
      (item) => item.id === Number(this.board_type.value)
    );

    const storeImageFormData = new FormData();
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
    storeImageFormData.append(
      `files`,
      this.consentform_file,
      this.consentform_file?.name
    );
    if (this.board_imagefile) {
      storeImageFormData.append(
        `files`,
        this.board_imagefile,
        this.board_imagefile?.name
      );
    }

    const storeFormData = new FormData();

    let storepicIds = [];

    let boardpics;
    let consentform = {};
    //upload store photos in step 1 and in the call back collect the ids and use it for store creation.
    //always upload images in the same order to map to correct view, board pic to be uploaded in the last
    this.http
      .post(environment.backend + "upload", storeImageFormData)
      .subscribe(
        (data: any) => {
          if (data) {
            let i = 0;
            for (let pic of data) {
              //Get uploaded photos in order.
              if (i <= 3) {
                var tag = "";
                switch (i) {
                  case 0:
                    tag = "Store Front View";
                    break;
                  case 1:
                    tag = "Store Closeup View";
                    break;
                  case 2:
                    tag = "Left Side Street View";
                    break;
                  case 3:
                    tag = "Right Side Street View";
                    break;
                }
                storepicIds.push({
                  photo: pic.id,
                  fileid: pic.id,
                  filepath: pic.url,
                  viewtype: tag,
                  latitude: this.currLat,
                  longitude: this.currLng,
                });
              } else if (i == 4) {
                consentform = {
                  photo: pic?.id,
                  fileid: pic.id,
                  filepath: pic.url,
                  description: "store owner agreement",
                };
              } else {
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
              }
              let inc = 1 + i;
              i = inc;
            }
            const storedata = {
              inventoryname: this.storeName.value,
              inventorytype: this.storeState,
              doorno: this.doorno.value,
              streetroad: this.street.value,
              address: this.address.value,
              storetype: this.store_type.value,
              city: this.city.value,
              state: this.state.value,
              pincode: this.pincode.value,
              contactno_1:
                this.phone_no.value?.length > 0 ? this.phone_no.value : null,
              board_type:
                this.board_type.value?.length > 0
                  ? this.board_type?.value
                  : null,
              latitude: this.lat.toString(),
              longitude: this.lng.toString(),
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
              storepics: storepicIds,
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
            };
            storeFormData.append("data", JSON.stringify(storedata));
            console.log(storedata);
            this.http
              .post(environment.backend + "inventories", storeFormData)
              .subscribe(
                (data: any) => {
                  if (data) {
                    this.toastr.success("Inventory created!", "Success!", {
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
                      "Error while creating store!",
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
              "Error while creating store!",
              {
                timeOut: 3000,
              }
            );
            //this.createInventory.reset();
          }
        }
      );
  }

  readFile(event: any) {
    if (event.target.files.length) {
      this.fileName = event.target.files[0].name;
      let file = event.target.files[0];

      let fileReader: FileReader = new FileReader();
      fileReader.readAsBinaryString(file);

      fileReader.onload = (e: any) => {
        var fileData: XLSX.WorkBook = XLSX.read(fileReader.result, {
          type: "binary",
        });
        var sheet: string = fileData.SheetNames[0];
        this.finalData = XLSX.utils.sheet_to_json(fileData.Sheets[sheet]);
      };
    }
  }

  uploadData() {
    let userData = localStorage.getItem("auth_token");
    console.log();
    for (let data of this.finalData) {
      delete data["s.no"];
      console.log(data);

      this.http
        .post(
          environment.backend + "inventories",
          {
            data: {
              inventoryname: data["storename"] ? data["storename"] : null,
              doorno: data["doorno"] ? data["doorno"] : null,
              streetroad: data["streetroad"] ? data["streetroad"] : null,
              address: data["address"] ? data["address"] : null,
              storetype: data["storetype"] ? data["storetype"] : null,
              city: "1",
              state: "1",
              pincode: data["pincode"] ? data["pincode"] : null,
              latitude: data["latitude"] ? data["latitude"] : null,
              longitude: data["longtitude"] ? data["longtitude"] : null,
              contactperson: data["ownername"] ? data["ownername"] : null,
              mobileno: data["mobileno"] ? data["mobileno"] : null,
              gstin: data["gstin"] ? data["gstin"] : null,
              email: data["email"] ? data["email"] : null,
              createdbyuser: +localStorage.getItem("userid"),
              storepics: [],
              boards: {},
              status: "1",
            },
          },
          {
            headers: new HttpHeaders().set(
              "Authorization",
              "Bearer " + userData
            ),
          }
        )
        .subscribe((res) => {
          console.log(res);
        });
    }
  }

  async onFileChanged(event, view: string) {
    const file = event.target.files[0];
    const image = await watermarkimage(file, "./assets/images/logo.png");
    //let image: any = file;
    //var watermarkedfile = this.addWatermarkimage(image, "./assets/images/logo.png");
    console.log(image);
    if (view === "front_view") {
      this.fv_imagefile = event.target.files[0];
      this.fv_file.setValue(file);
    } else if (view === "front_view_close_up") {
      this.fvcu_imagefile = event.target.files[0];
      this.fvcu_file.setValue(file);
    } else if (view === "left_side") {
      this.ls_file.setValue(file);
      this.ls_imagefile = event.target.files[0];
    } else if (view === "right_side") {
      this.rs_file.setValue(file);
      this.rs_imagefile = event.target.files[0];
    } else if (view === "board_file") {
      this.board_file.setValue(file);
      this.board_imagefile = event.target.files[0];
    } else if (view === "consentform_field") {
      this.consentform_field.setValue(file);
      this.consentform_file = event.target.files[0];
    }
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

  createStoreType(modal) {
    this.http
      .post(environment.backend + "store-types", {
        data: { typename: this.newStoreType.value },
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.dataservice.getStoreTypes().subscribe((data: any) => {
              if (data) {
                this.store_type_list = data?.data;
              }
            });
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

  createState(modal) {
    this.http
      .post(environment.backend + "states", {
        data: { statename: this.newState.value },
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.dataservice.getStates().subscribe((data: any) => {
              if (data) {
                this.state_list = data?.data;
              }
            });
            modal();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating state!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
  }
  createCity(modal) {
    this.http
      .post(environment.backend + "cities", {
        data: { cityname: this.newCity.value },
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.dataservice.getCities().subscribe((data: any) => {
              if (data) {
                this.city_list = data?.data;
              }
            });
            modal();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating City!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
  }
  createBoardType(modal) {
    this.http
      .post(environment.backend + "board-types", {
        data: { typename: this.newboardType.value },
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.dataservice.getCities().subscribe((data: any) => {
              if (data) {
                this.board_type_list = data?.data;
              }
            });
            modal();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating City!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
  }
  addStorePhotos() {}
  addWatermarkimage(originalImage: any, watermarkImageURL: any) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let canvasWidth = 0;
    let canvasHeight = 0;
    let img = originalImage;
    let bitmap = createImageBitmap(img);

    canvasWidth = img.width;
    canvasHeight = img.height;
    console.log(img.width);
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    let watermarkImage;
    fetch(watermarkImageURL)
      .then((res) => res.blob()) // Gets the response and returns it as a blob
      .then((blob) => {
        // Here's where you get access to the blob
        // And you can use it for whatever you want
        // Like calling ref().put(blob)

        // Here, I use it to make an image appear on the page
        let objectURL = URL.createObjectURL(blob);
        watermarkImage = new Image();
        watermarkImage.src = objectURL;
        const pattern = context.createPattern(watermarkImage, "no-repeat");

        context.translate(
          canvasWidth - watermarkImage.width,
          canvasHeight - watermarkImage.height
        );
        context.rect(0, 0, canvasWidth, canvasHeight);
        context.fillStyle = pattern;

        return canvas.toDataURL("image/jpeg", 1);
      });
    //const blob = watermarkImage;

    //const image = await createImageBitmap(blob);
  }
  getMeta(url, callback) {
    var img = new Image();
    img.src = url;
    let width;
    let height;
    img.onload = function () {
      callback(width, height);
    };
  }

  // society creation
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

  setImgPreviewControlValue(
    event: any,
    preview: any,
    phaseIndex: number,
    blockIndex: number,
    inventoryIndex: number
  ) {
    console.log(phaseIndex, blockIndex, inventoryIndex);
    if (event.target.files[0]) {
      if (event.target.files[0]) {
        let selectedFile = <File>event.target.files[0];
        this.societyImages[phaseIndex][blockIndex][inventoryIndex] = {
          name: `files`,
          value: selectedFile,
          fileName: selectedFile.name,
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
      (<FormArray>this.societyForm.get(["societyInfo", "phase_blocks"])).push(
        new FormControl(1, Validators.required)
      );
      this.onAddPhase();
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
      this.onAddBlock(phaseBlockIndex);
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

  onDeleteInventory(
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
  }

  async societyFormSubmit() {
    if (!this.societyForm.valid) {
      return;
    }
    let societyData = this.societyForm.value;
    let isError = false;
    let invPicsData = [];
    for (let phaseId = 0; phaseId < this.societyImages.length; phaseId++) {
      for (
        let blockId = 0;
        blockId < this.societyImages[phaseId].length;
        blockId++
      ) {
        let imgFormData = new FormData();
        var inv: { name: string; value: any; fileName: string };
        for (
          var invId = 0;
          invId < this.societyImages[phaseId][blockId].length;
          invId++
        ) {
          inv = this.societyImages[phaseId][blockId][invId];
          imgFormData.append(inv.name, inv.value, inv.fileName);
        }
        await this.http
          .post(environment.backend + "upload", imgFormData)
          .toPromise()
          .then(
            (data: any) => {
              if (data) {
                var invIndex = 0;
                for (let pic of data) {
                  let picData = {
                    photo: `${pic.id}`,
                    fileid: `${pic.id}`,
                    filepath: pic.url,
                    viewtype: "",
                    latitude: this.currLat,
                    longitude: this.currLng,
                    metadata: {
                      phaseno: phaseId,
                      phasename: (<FormControl>(
                        this.societyForm.get(["phases", phaseId, "phaseName"])
                      )).value,
                      blockno: blockId,
                      blockname: (<FormControl>(
                        this.societyForm.get([
                          "phases",
                          phaseId,
                          "blocks",
                          blockId,
                          "blockName",
                        ])
                      )).value,
                      inventoryno: invIndex,
                      postertype: (<FormControl>(
                        this.societyForm.get([
                          "phases",
                          phaseId,
                          "blocks",
                          blockId,
                          "inventories",
                          invIndex,
                          "inventoryType",
                        ])
                      )).value
                    },
                  };
                  invPicsData.push(picData);
                  invIndex = invIndex + 1;
                }
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
                isError = true;
                //this.createInventory.reset();
              }
            }
          );
      }
    }

    if (!isError) {
      let submitData = {
        inventoryname: societyData.societyInfo.societyName,
        inventorytype: this.storeState,
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
        invpics: invPicsData,
        createdbyuser: this.authService.userId.value,
        temprefno: this.authService.username.value + "-" + Date.now() + "-" + this.pincode.value,
        availability: "available",
        status: 1
      };
  
      let societySubmitData = new FormData()
      societySubmitData.append("data", JSON.stringify(submitData));
      await this.http
        .post(environment.backend + "inventories", societySubmitData)
        .toPromise()
        .then(
          (data: any) => {
            if (data) {
              this.toastr.success("Society created!", "Success!", {
                timeOut: 3000,
              });
              this.createInventory.reset();
              console.log(data);
              this.router.navigateByUrl("inventory/details?id=" + data.data.id);
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
            isError = true;
          }
        );
    }

    if (isError) {
      if ((invPicsData).length) {
        for (let pic of invPicsData) {
          await this.http.delete(environment.backend + "upload/files/" + pic.fileid).toPromise().then(
            res => {
              console.log(res);
            }
          )
        }
      }
    }
  }

  private initForm() {
    this.societyForm = new FormGroup({
      societyInfo: new FormGroup({
        societyName: new FormControl("", Validators.required),
        societyType: new FormControl("flat", Validators.required),
        no_of_flates: new FormControl("", Validators.required),
        no_phases: new FormControl(1, Validators.required),
        no_blocks: new FormControl(1, Validators.required),
        phase_blocks: new FormArray([new FormControl(1, Validators.required)]),
        door_no: new FormControl("", Validators.required),
        street: new FormControl("", Validators.required),
        address: new FormControl("", Validators.required),
        city: new FormControl(2, Validators.required),
        state: new FormControl(1, Validators.required),
        pincode: new FormControl(null, Validators.required),
        latitude: new FormControl(this.lat.toString()),
        longtitude: new FormControl(this.lng.toString()),
      }),
      contactPersonInfo: new FormGroup({
        contactPersonName: new FormControl("", Validators.required),
        contactDesignation: new FormControl("", Validators.required),
        contact_no_1: new FormControl("", Validators.required),
        contact_no_2: new FormControl(""),
        email_1: new FormControl("", Validators.required),
        email_2: new FormControl(""),
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
const replacerFunc = () => {
  const visited = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (visited.has(value)) {
        return;
      }
      visited.add(value);
    }
    return value;
  };
};

export async function watermarkimage(originalImage: any, watermarkImage: any) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const canvasWidth = originalImage.width;
  const canvasHeight = originalImage.height;

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const result = await fetch(watermarkImage);
  const blob = await result.blob();

  const image = await createImageBitmap(blob);
  const pattern = context.createPattern(image, "no-repeat");

  context.translate(canvasWidth - image.width, canvasHeight - image.height);
  context.rect(0, 0, canvasWidth, canvasHeight);
  context.fillStyle = pattern;

  return await canvas.toDataURL();
}
