import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { NgbModal, NgbToastHeader } from '@ng-bootstrap/ng-bootstrap';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
// import { stringify } from 'querystring';
import { AuthService } from 'src/app/shared/services/auth.service';
import { getLocaleDateTimeFormat } from '@angular/common';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as html2pdf from 'html2pdf.js'
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Inventory, ROLE, SubTask } from 'src/app/shared/models/inventory';
@Component({
  selector: 'app-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent implements OnInit {
  @ViewChild('content', { static: false }) element: ElementRef | any;
  @ViewChild('installation', { static: false }) inselement: ElementRef | any;
  @ViewChild('audit', { static: false }) auelement: ElementRef | any;

  auditTask = [];
  installationPdfData = [];
  auditPdfData = [];
  invCount = 0;

  view = 'Project Detail'
  projectid: any;
  editMode = false;
  reccePdfData = []
  disable = false;
  project: any;
  env = environment;
  brand_list = [];
  user_list = [];
  user_list_All = [];
  user_list_ins = [];
  pageSize = 10;
  page = 1;
  stores_available: Inventory[] = [];
  stores_selected: any[] = [];
  stores_tobedeleted: any[] = [];
  stores_selected_task: any[] = [];
  pincodes_list: any[] = [];
  tabstep = 1;
  createproject: FormGroup;
  storeType: FormGroup;
  stateName: FormGroup;
  brandName: FormGroup;
  boardType: FormGroup;
  projectname = new FormControl("", Validators.required);
  projrefid = new FormControl("", Validators.required);
  board_type = new FormControl("", Validators.required);
  startdate = new FormControl("", Validators.required);
  enddate = new FormControl("", Validators.required);
  unitcost = new FormControl(0, Validators.required);
  no_of_units = new FormControl(this.invCount, Validators.required);
  duration = new FormControl(0, Validators.required);
  totel_cost = new FormControl(0, Validators.required);
  auditinterval = new FormControl("", [
    Validators.required,
    Validators.maxLength(3),
    Validators.minLength(1),
  ]);
  brand = new FormControl("", [
    Validators.required,
    Validators.maxLength(11),
    Validators.minLength(8),
  ]);
  desc = new FormControl("");
  newBrand = new FormControl("", Validators.required);
  newContactPerson = new FormControl("", Validators.required);
  newContactEmail = new FormControl("", [
    Validators.required,
    Validators.email
  ]);
  newContactMobile = new FormControl("", [
    Validators.required,
    Validators.maxLength(10),
    Validators.minLength(10),
  ]);
  assigned = new FormControl("");
  newgstin = new FormControl("");
  pincode = new FormControl("", [
    Validators.maxLength(6),
    Validators.minLength(6),
  ]);
  selectedpincodes = new FormControl("");

  //#region tasks related Modal

  task_list = [];
  task_type_list = ["CreateInventory", "Installation", "Audit"];
  task_status = ["Assigned", "InProgress", "Completed"];
  selectedTask: any;
  taskFrmGp: FormGroup;
  tasktype = new FormControl("", Validators.required);
  tassigned = new FormControl("", Validators.required);
  taskdec = new FormControl("", Validators.required);
  t_plandateofcomp = new FormControl("", Validators.required);
  t_actualdateofcomp = new FormControl("", Validators.required);
  tstatus = new FormControl("", Validators.required);

  dropdown = new FormControl("", Validators.required);
  womlogs: any = [];
  grid_headers = ["S.No", "Name", "Ref.Id", "Address", "City", "State", "Pincode", "Availability"];
  field_names = ["Inventory.inventoryname",
    "Inventory.refno",
    "store.attributes?.city?.data?.attributes?.cityname",
    "store.attributes?.state?.data?.attributes?.statename",
    "store.attributes?.pincode"
  ];
  filter_fields = ["store.attributes?.state?.data?.attributes?.statename",
    "store.attributes?.city?.data?.attributes?.cityname",
    "store.attributes?.pincode"
  ];
  storedataloaded = false;
  // isReserved: any = false;
  store_Status: string = 'booked';
  stores_for_task: any[] = [];
  //   viewMode: 'list' | 'grid' = 'list';
  //#endregion
  public task;
  subtasks: SubTask[] = [];
  public selectedSubTask: SubTask;
  public selectedSubTaskLog: any[] = [];
  public showFEUsers = false;
  public showINSTALLUsers = false;
  public showSubtaskDelete = true;

  constructor(config: NgbCarouselConfig, fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    private dataservice: DataLayerService,
    private authService: AuthService,
    private route: ActivatedRoute) {
    this.createproject = fb.group({
      projectname: this.projectname,
      projrefid: this.projrefid,
      board_type: this.board_type,
      startdate: this.startdate,
      enddate: this.enddate,
      brand: this.brand,
      auditinterval: this.auditinterval,
      desc: this.desc,
      assigned: this.assigned,
      pincode: this.pincode,
      selectedpincodes: this.selectedpincodes,
      unitcost: this.unitcost,
      no_of_units: this.no_of_units,
      duration: this.duration,
      totel_cost: this.totel_cost
    });
    config.interval = 2000;
    config.keyboard = true;
    config.pauseOnHover = true;
    this.brandName = fb.group({ newBrand: this.newBrand, newContactPerson: this.newContactPerson, newContactEmail: this.newContactEmail, newContactMobile: this.newContactMobile, newgstin: this.newgstin });
    this.taskFrmGp = fb.group({ tasktype: this.tasktype, tassigned: this.tassigned, taskdec: this.taskdec, t_plandateofcomp: this.t_plandateofcomp, tstatus: this.tstatus, t_actualdateofcomp: this.t_actualdateofcomp, dropdown: this.dropdown });
  }

  ngOnInit(): void {
    this.authService.projectEditMode.next(this.editMode);
    this.route.queryParams.subscribe((params) => {
      this.projectid = params["id"];
      if (this.projectid) {
        this.editMode = true;
        this.loadProjectData();
        this.createproject.disable();
        this.disable = true;
        this.loadProjectTasks();
        this.generateRecceData();
        //console.log(this.stores_available);
      }
    });
    this.loadMasterData();
  }

  enableEdit() {
    this.createproject.enable();
    this.createproject.get(['no_of_units']).disable();
    this.createproject.get(['duration']).disable();
    this.createproject.get(['totel_cost']).disable();
    this.disable = false;
    this.taskFrmGp.reset();
    this.selectedTask = undefined;
    this.authService.projectEditMode.next(true);
  }
  disableEdit() {
    this.createproject.disable();
    this.disable = true;
    this.taskFrmGp.reset();
    this.selectedTask = undefined;
    this.authService.projectEditMode.next(false);
  }
  loadMasterData() {

    this.dataservice.getBrands().subscribe((data: any) => {
      if (data) {
        this.brand_list = data.data;
      }
    });
    this.dataservice.getusers(ROLE.IRR_ADMIN).subscribe((data: any) => {
      if (data) {
        this.user_list = data.data;
      }
    });
    /*this.dataservice.getusers(ROLE.FIELD_EXECUTIVE).subscribe((data: any) => {
      if (data) {
        this.user_list_fe = data.data;
      }
    });*/
    this.dataservice.getAllusers().subscribe((data: any) => {
      if (data) {
        this.user_list_All = data.data;
        this.user_list_ins = this.user_list_All;
      }
    });
    this.loadInventoryList();
  }

  //TODO: Move this code to shared data service or create a new inventory service.
  //loadInventoryList(pincode: any) {
  loadInventoryList() {
    //console.log("load inventory");
    let url = `inventories?populate=*&sort[0]=updatedAt%3Adesc`;
    //url += '&filters[$and][0][status][statusname][$eq]=approved&filters[$and][1][availability][$eq]=Available&filters[$and][1][pincode][$eq]=' + pincode;
    url += '&filters[$and][0][status][statusname][$eq]=Approved&filters[$and][1][availability][$eq]=available';
    this.http
      .get(environment.backend + url)
      .subscribe((data: any) => {
        if (data) {
          if ((data.data).length > 0) {
            var result = data.data.map((storeattr: {
              attributes: {
                id: any,
                inventoryname: any,
                refno: any,
                doorno: any,
                streetroad: any,
                pincode: any,
                latitude: any,
                longitude: any,
                temprefno: any,
                contactperson: any,
                mobileno: any,
                address: any,
                storetype: any,
                city: any,
                state: any,

              }, id: any;
            }) => ({
              id: storeattr.id,
              inventoryname: storeattr.attributes?.inventoryname,
              refno: storeattr.attributes?.refno,
              doorno: storeattr.attributes.doorno,
              streetroad: storeattr.attributes.streetroad,
              address: storeattr.attributes.address,
              pincode: storeattr.attributes.pincode,
              latitude: storeattr.attributes.latitude,
              longitude: storeattr.attributes.longitude,
              temprefno: storeattr.attributes.temprefno,
              contactperson: storeattr.attributes.contactperson,
              mobileno: storeattr.attributes.mobileno,
              storetype: storeattr.attributes?.storetype?.data?.attributes?.typename,
              city: storeattr.attributes?.city?.data?.attributes?.cityname,
              state: storeattr.attributes?.state?.data?.attributes?.statename,

            }));

            //this.stores_available.push(data.data);
            this.stores_available = result;
            console.log(this.stores_available);
            //console.log(this.stores_available);
            this.toastr.success(data.message, "Success!", {
              timeOut: 3000,
            });
          }
          else {
            this.toastr.success("no more inventories available", "Success!", {
              timeOut: 3000,
            });
          }
          this.storedataloaded = true;
          //console.log(data)
        }
        console.log(this.stores_available);
      });
  }
  addToPincodes() {
    var found = false;
    this.pincodes_list.forEach((item, index) => {
      if (item.pincode == this.pincode.value) {
        found = true;
        return;
      }
    });
    if (found == false) {
      this.pincodes_list.push({ pincode: this.pincode.value });
      //this.loadInventoryList(this.pincode.value);
    }
    this.pincode.setValue("");
  }
  removePincode() {
    for (let pincode of this.selectedpincodes.value) {
      this.pincodes_list.forEach((item, index) => {
        if (item.pincode == pincode.pincode) {
          this.pincodes_list.splice(index, 1);
        }
      })
    }

  }
  activateTab(tabindex: any) {
    this.tabstep = tabindex;
  }

  selectStore(event: any) {
    this.stores_selected.push(event);
    this.invCount = this.invCount + 1;
    this.no_of_units.setValue(this.invCount);
    this.unitCostChanges();
    console.log(this.stores_selected);
  }
  removeStore(data: any) {
    this.stores_selected.forEach((item, index: any) => {
      if (item.id == data.id) { 
        this.stores_tobedeleted.push(item);
        this.stores_selected.splice(index, 1);
      };
    });
    //console.log(this.stores_selected);
  }

  selectStoreForTask(event: any) {
    this.stores_selected_task.push(event);
  }

  removeStoreForTask(data: any) {
    this.stores_selected_task.forEach((item, index) => {
      if (item.id == data.id) this.stores_selected_task.splice(index, 1);
    });
    //console.log(this.stores_selected);
  }
  selectAllStores(event: any) {
    console.log(event);
    this.stores_selected_task = event;
  }

  projectInfoSubmit(e): void {
    var storesSelected = [];
    this.stores_selected.forEach((item, index) => {
      storesSelected.push(item.id);
    });
    const projectdata = {
      projectname: this.projectname.value,
      refno: this.projrefid.value,
      start_date: this.startdate.value,
      end_date: this.enddate.value,
      brand: this.brand.value,
      brandid: this.brand.value,
      auditinterval: Number(this.auditinterval.value),
      description: this.desc.value,
      status: "Created",
      assignedto: this.assigned.value,
      assigneduserid: this.assigned.value,
      createdby: Number(this.authService.userId.value),
      duration: this.duration.value,
      unitcost: this.unitcost.value,
      inventorytotal: this.no_of_units.value,
      totalcost: this.totel_cost.value,
      pincodes: this.pincodes_list,
      inventories: storesSelected
    };
    const storeFormData = new FormData();
    storeFormData.append('data', JSON.stringify(projectdata));
    let availabilityst = this.store_Status;
    if (this.editMode == true) {
      //Update Project Information

      this.http.put(environment.backend + "projects/" + this.projectid, storeFormData)
        .subscribe(
          (data: any) => {
            if (data) {
              var projectid = data.data.id;
              console.log(projectid);
              this.stores_selected.forEach((item, index) => {
                this.http
                  .put(environment.backend + `inventories/` + item.id, { data: { availability: availabilityst } })
                  .subscribe((data: any) => {

                  });
              });
              this.stores_tobedeleted.forEach((item, index) => {
                this.http
                  .put(environment.backend + `inventories/` + item.id, { data: { availability: "available" } })
                  .subscribe((data: any) => {

                  });
              });

              this.toastr.success("Project updated!", "Success!", {
                timeOut: 3000,
              });
              location.reload();
            }
          },
          (err) => {
            if (err.error) {
              this.toastr.error(
                JSON.stringify(err),
                "Error while creating Project!",
                {
                  timeOut: 3000,
                }
              );
              this.createproject.reset();
            }
          }
        );
    }
    else {
      this.http.post(environment.backend + "projects", storeFormData)
        .subscribe(
          (data: any) => {
            if (data) {
              var projectid = data.data.id;
              console.log(projectid);
              this.stores_selected.forEach((item, index) => {
                this.http
                  .put(environment.backend + `inventories/` + item.id, { data: { availability: availabilityst } })
                  .subscribe((data: any) => {
                  });
              });
              this.toastr.success("Project Created!", "Success!", {
                timeOut: 3000,
              });
              location.reload();
            }
          },
          (err) => {
            if (err.error) {
              this.toastr.error(
                JSON.stringify(err),
                "Error while creating Project!",
                {
                  timeOut: 3000,
                }
              );
              this.createproject.reset();
            }
          }
        );
    }
  }

  loadProjectData() {
    //this.http.get(environment.backend + "projects?&populate[stores][populate][0]=storepics&populate=*&filters[id][$eq]=" + this.projectid).subscribe(
    this.http.get(environment.backend + "projects?[populate][inventories][populate]=*&filters[id][$eq]=" + this.projectid).subscribe(
      (data: any) => {
        if (data) {
          this.project = data?.data[0];
          this.projectname.setValue(this.project.attributes?.projectname);
          this.projrefid.setValue(this.project.attributes?.refno);
          this.startdate.setValue(this.project.attributes?.start_date);
          this.enddate.setValue(this.project.attributes?.end_date);
          this.auditinterval.setValue(this.project.attributes?.auditinterval);
          this.desc.setValue(this.project.attributes?.description);
          this.brand.setValue(this.project.attributes?.brandid);
          this.assigned.setValue(this.project.attributes?.assigneduserid);
          this.unitcost.setValue(this.project.attributes?.unitcost? this.project.attributes?.unitcost: 0);
          this.invCount = this.project.attributes?.inventorytotal? this.project.attributes?.inventorytotal: 0;
          this.no_of_units.setValue(this.invCount);
          this.duration.setValue(this.project.attributes?.duration? this.project.attributes?.duration: 0);
          this.totel_cost.setValue(this.project.attributes?.totalcost? this.project.attributes?.totalcost: 0);
          this.pincodes_list = this.project.attributes?.pincodes;
          if (this.project.attributes?.start_date && this.project.attributes?.end_date) {
            let start: any = new Date(this.project.attributes?.start_date);
            let end: any = new Date(this.project.attributes?.end_date);
      
            let durationDays = (end - start) / (1000 * 3600 * 24);
            this.duration.setValue(durationDays);
          }

          //this.stores_selected = this.project.attributes?.stores?.data;
          var result = data?.data[0].attributes?.inventories.data.map((storeattr: {
            attributes: {
              id: any,
              inventoryname: any,
              refno: any,
              doorno: any,
              streetroad: any,
              pincode: any,
              latitude: any,
              longitude: any,
              temprefno: any,
              contactperson: any,
              mobileno: any,
              address: any,
              storetype: any,
              city: any,
              state: any,
              availability: any;

            }, id: any;
          }) => ({
            id: storeattr.id,
            inventoryname: storeattr.attributes?.inventoryname,
            refno: storeattr.attributes?.refno,
            doorno: storeattr.attributes.doorno,
            streetroad: storeattr.attributes.streetroad,
            address: storeattr.attributes.address,
            pincode: storeattr.attributes.pincode,
            latitude: storeattr.attributes.latitude,
            longitude: storeattr.attributes.longitude,
            temprefno: storeattr.attributes.temprefno,
            contactperson: storeattr.attributes.contactperson,
            mobileno: storeattr.attributes.mobileno,
            city: storeattr.attributes?.city?.data.attributes.cityname,
            state: storeattr.attributes?.state.data.attributes.statename,
            availability: storeattr.attributes?.availability

          }));
          this.stores_selected = result;
          this.loadInventoryList;
          console.log(this.stores_selected)
          //console.log(this.stores_selected);
          //console.log(this.project);
        }
      },
      (err) => {
        if (err.error) {
          this.toastr.error(JSON.stringify(err), "Error while fetching data!", {
            timeOut: 3000,
          });
        }
      }
    );
  }
  onFileChanged(event, view: string) {
    // const file = event.target.files[0];
    //this.fv_imagefile = event.target.files[0];
    // this.fv_file.setValue(file);

  }

  openModal(content: any, task: any) {
    this.task = task;
    this.stores_for_task = this.stores_selected;
    this.womlogs = [];
    if (task == null) {
      this.disable = false;
    } else {
      this.disable = true;
    }
    let storesavailableinsubtask = this.stores_selected;
    if (this.disable) {
      for (let subtask of task.attributes.workorder) {
        storesavailableinsubtask.forEach((item, index) => {
          if (item.id == subtask.storeid) storesavailableinsubtask.splice(index, 1);
        });
      }
      this.stores_for_task = storesavailableinsubtask;
    }

    if (task && this.disable == true) {
      this.selectedTask = task;
      this.selectedTask.attributes?.workorder.forEach(item => {
        this.womlogs.push(item.log);
      });

      if (task.attributes?.type == 'Installation') {
        var result = this.user_list_All.filter(item => item.attributes?.oriv_role?.data?.id == ROLE.INSTALLATION);
        this.user_list_ins = result;
      } else if (task.attributes?.type == 'Audit' || task.attributes?.type == 'CreateInventory') {
        var result = this.user_list_All.filter(item => item.attributes?.oriv_role?.data?.id == ROLE.FIELD_EXECUTIVE);
        this.user_list_ins = result;
      }
      this.taskFrmGp.patchValue({
        tstatus: task.attributes?.status,
        taskdec: task.attributes?.description,
        tasktype: task.attributes?.type,
        t_plandateofcomp: task.attributes?.completiondate_planned,
        t_actualdateofcomp: task.attributes?.completiondate_actual,
        tassigned: task.attributes?.assigneduserid,
      });
    }
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title", size: 'lg' })
      .result.then(
        (result) => {
          console.log(result);
        },
        (reason) => {
          console.log("Err!", reason);
        }
      );
  }
  openSubTaskModal(content: any, selectedtask: any) {
    this.task = selectedtask;
    this.subtasks = [];
    let filters = '';
    let i = 0;
    for (let workorder of this.task.attributes.workorder) {

      if (workorder.storeid) {


        let wom: SubTask = <SubTask>{};
        //console.log(workorder);
        this.http
          .get(environment.backend + 'inventories/' + workorder.storeid + '?populate=*')
          .subscribe((data: any) => {
            if (data) {

              wom.id = workorder.id;
              wom.storeInfo = data.data;
              wom.store = workorder.storeid;
              wom.type = workorder.type;
              wom.status = workorder.status;
              wom.log = workorder.log;
              this.subtasks.push(wom);
              //console.log(this.stores);
              /*this.toastr.success(data.message, "Success!", {
                timeOut: 3000,
              });*/
              console.log(this.subtasks);
            }
          });
      }
    }
    const modalRef = this.modalService.open(content, { ariaLabelledBy: "modal-basic-title", size: 'lg' });
    modalRef.result.then(
      (result) => {
        console.log(result);
      },
      (reason) => {
        console.log("Err!", reason);
      }
    );
  }
  openSubTaskGalleryModal(content: any, selectedSubTask: any) {
    this.selectedSubTask = selectedSubTask;
    this.selectedSubTaskLog = this.selectedSubTask.log;
    console.log(this.selectedSubTaskLog);
    const modalRef = this.modalService.open(content, { ariaLabelledBy: "modal-basic-title" });
    modalRef.result.then(
      (result) => {
        console.log(result);
      },
      (reason) => {
        console.log("Err!", reason);
      }
    );
  }

  createBrand(modal) {
    if (this.newBrand.value == "") {
      this.toastr.error("Brand name cannot be empty!", "error!", {
        timeOut: 3000,
      });
      return;
    }

    console.log("brand create");
    this.http
      .post(environment.backend + "brands", {
        data: { brandname: this.newBrand.value, contact_phone: Number(this.newContactMobile.value), contact_person: this.newContactPerson.value, contact_email: this.newContactEmail.value, gstin: this.newgstin.value }
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.dataservice.getBrands().subscribe((data: any) => {
              if (data) {
                this.brand_list = data?.data;
                this.toastr.success("Brand created!", "Success!", {
                  timeOut: 3000,
                });
              }
            });
            modal();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while creating brand!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
  }

  filter(keyword: any) {

  }
  updateProjectStatus(status: any, id: any) {
    var body = {
      data: { status: status }
    };
    this.http
      .put(environment.backend + `projects/` + id, body)
      .subscribe((data: any) => {
        if (data) {
          this.toastr.success(data.message, "Status Updated Successfully!", {
            timeOut: 3000,
          });
          this.project.attributes.status = status;
          if ((this.stores_selected).length) {
            if (status == 'Installed') {
              for (let store of this.stores_selected) {
                this.http.put(environment.backend + 'inventories/' + store.id, {data: {
                  availability: 'occupied'
                }}).subscribe();
              }
            }
            if (status == 'Created') {
              for (let store of this.stores_selected) {
                this.http.put(environment.backend + 'inventories/' + store.id, {data: {
                  availability: 'booked'
                }}).subscribe();
              }
            }
          }
          window.location.reload();
        }
      });
  }
  generatePdfData() {
    for (let item of this.task_list) {
      for (let workorder of item.attributes.workorder) {

        if (workorder.storeid) {
          let wom: SubTask = <SubTask>{};
          //console.log(workorder);
          this.http
            .get(environment.backend + 'inventories/' + workorder.storeid + '?populate=*')
            .subscribe((data: any) => {
              if (data) {
                //console.log(this.stores);
                /*this.toastr.success(data.message, "Success!", {
                  timeOut: 3000,
                });*/
                if (workorder.type == 'Installation') {
                  let item = {...data.data, subTasks: workorder.log};
                  // console.log(taskData);
                  let invs = []
                  if ((item.subTasks).length) {
                    let imgData = []
                    for (let inv of item.subTasks) {
                      let subitem = {
                        imgPath: inv?.photo_filepath? this.env.backendfileURI + inv?.photo_filepath: 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                        imgTitle: `Uploaded At: ${inv.uploadeddatetime}`,
                        imgGeo: inv?.latitude && inv?.longitude ? `https://maps.google.com/?q=${inv?.latitude},${inv?.longitude}` : ''
                      }
                      imgData.push(subitem);
                      if ((imgData).length == 4) {
                        invs.push(imgData);
                        imgData = [];
                      }
                    }
                    if ((imgData).length) {
                      invs.push(imgData);
                    }
                  }
                  let pdfdata = {
                    inventorytype: item?.attributes?.inventorytype,
                    inventoryname: item?.attributes?.inventoryname,
                    pdfType: 'Installation Report',
                    inventoryContact: {
                      contactno_1: item.attributes.contactno_1 ? item.attributes.contactno_1 : '-',
                      contactno_2: item.attributes.contactno_2 ? item.attributes.contactno_2 : '-'
                    },
                    inventoryAddress: `${item.attributes.doorno}, ${item.attributes.streetroad}, ${item.attributes.address}, ${item.attributes.city?.data?.attributes?.cityname}, ${item.attributes.state?.data?.attributes?.statename} - ${item.attributes.pincode}`,
                    boardSize: item.attributes.boards?.width && item.attributes.boards?.height? `${item.attributes.boards?.width} x ${item.attributes.boards?.height} ft`: 'Board Size Not Available',
                    societyType: item.attributes?.societytype? item.attributes?.societytype: '',
                    geoLocation: item.attributes.latitude && item.attributes.longitude ? `https://maps.google.com/?q=${item.attributes.latitude},${item.attributes.longitude}` : 'Location Not Available',
                    date: `${new Date(item.attributes.createdAt).getDate()}-${new Date(item.attributes.createdAt).getMonth()}-${new Date(item.attributes.createdAt).getFullYear()}, ${new Date(item.attributes.createdAt).getHours()}:${new Date(item.attributes.createdAt).getMinutes()}`,
                    images: invs
                  }
                  this.installationPdfData.push(pdfdata);
                  // console.log(this.installationTaks);
                }
                if (workorder.type == 'Audit') {
                  let item = {...data.data, subTasks: workorder.log};
                  // console.log(taskData);
                  let invs = []
                  if ((item.subTasks).length) {
                    let imgData = []
                    for (let inv of item.subTasks) {
                      let subitem = {
                        imgPath: inv?.photo_filepath? this.env.backendfileURI + inv?.photo_filepath: 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                        imgTitle: `Uploaded At: ${inv.uploadeddatetime}`,
                        imgGeo: inv?.latitude && inv?.longitude ? `https://maps.google.com/?q=${inv?.latitude},${inv?.longitude}` : ''
                      }
                      imgData.push(subitem);
                      if ((imgData).length == 4) {
                        invs.push(imgData);
                        imgData = [];
                      }
                    }
                    if ((imgData).length) {
                      invs.push(imgData);
                    }
                  }
                  let pdfdata = {
                    inventorytype: item?.attributes?.inventorytype,
                    inventoryname: item?.attributes?.inventoryname,
                    pdfType: 'Audit Report',
                    inventoryContact: {
                      contactno_1: item.attributes.contactno_1 ? item.attributes.contactno_1 : '-',
                      contactno_2: item.attributes.contactno_2 ? item.attributes.contactno_2 : '-'
                    },
                    inventoryAddress: `${item.attributes.doorno}, ${item.attributes.streetroad}, ${item.attributes.address}, ${item.attributes.city?.data?.attributes?.cityname}, ${item.attributes.state?.data?.attributes?.statename} - ${item.attributes.pincode}`,
                    boardSize: item.attributes.boards?.width && item.attributes.boards?.height? `${item.attributes.boards?.width} x ${item.attributes.boards?.height} ft`: 'Board Size Not Available',
                    societyType: item.attributes?.societytype? item.attributes?.societytype: '',
                    geoLocation: item.attributes.latitude && item.attributes.longitude ? `https://maps.google.com/?q=${item.attributes.latitude},${item.attributes.longitude}` : 'Location Not Available',
                    date: `${new Date(item.attributes.createdAt).getDate()}-${new Date(item.attributes.createdAt).getMonth()}-${new Date(item.attributes.createdAt).getFullYear()}, ${new Date(item.attributes.createdAt).getHours()}:${new Date(item.attributes.createdAt).getMinutes()}`,
                    images: invs
                  }
                  this.auditPdfData.push(pdfdata);
                }
              }
            });
        }
      }
    }
  }

  generateRecceData() {
    var stores = [];
    this.http.get(environment.backend + "inventories?populate=*&filters[projects][id][$eq]=" + this.projectid).subscribe(
      (data: any) => {
        if (data) {
          stores = data.data;
          // this.reccePdfData = data.data;
          let pdfDataArray = []
          for (let item of stores) {
            let invs = []
            if (item.attributes.inventorytype === 'society') {
              let imgData = []
              for (let inv of item.attributes.invpics) {
                let item = {
                  imgPath: inv.filepath? this.env.backendfileURI + inv?.filepath: 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                  imgTitle: `Phase No: ${inv.metadata.phaseno + 1} / Block No : ${inv.metadata.blockno + 1}`,
                  imgGeo: inv?.latitude && inv?.longitude ? `https://maps.google.com/?q=${inv?.latitude},${inv?.longitude}` : ''
                }
                imgData.push(item);
                if ((imgData).length == 4) {
                  invs.push(imgData);
                  imgData = [];
                }
              }
              if ((imgData).length) {
                invs.push(imgData);
              }
            }else {
              let data = [
                {
                  imgTitle: 'Front View',
                  imgPath: item.attributes.invpics[0]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[0]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                  imgGeo: item.attributes.invpics[0]?.latitude && item.attributes.invpics[0]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[0]?.latitude},${item.attributes.invpics[0]?.longitude}` : ''
                },
                {
                  imgTitle: 'Front CloseUp View',
                  imgPath: item.attributes.invpics[1]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[1]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                  imgGeo: item.attributes.invpics[1]?.latitude && item.attributes.invpics[1]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[1]?.latitude},${item.attributes.invpics[1]?.longitude}` : ''
                },
                {
                  imgTitle: 'Left Side View',
                  imgPath: item.attributes.invpics[2]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[2]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                  imgGeo: item.attributes.invpics[2]?.latitude && item.attributes.invpics[2]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[2]?.latitude},${item.attributes.invpics[2]?.longitude}` : ''
                },
                {
                  imgTitle: 'Right Side View',
                  imgPath: item.attributes.invpics[3]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[3]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
                  imgGeo: item.attributes.invpics[3]?.latitude && item.attributes.invpics[3]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[3]?.latitude},${item.attributes.invpics[3]?.longitude}` : ''
                }
              ]
              invs.push(data);
            }
            let pdfdata = {
              inventorytype: item.attributes.inventorytype,
              inventoryname: item.attributes.inventoryname,
              pdfType: 'Recce',
              inventoryContact: {
                contactno_1: item.attributes.contactno_1 ? item.attributes.contactno_1 : '-',
                contactno_2: item.attributes.contactno_2 ? item.attributes.contactno_2 : '-'
              },
              inventoryAddress: `${item.attributes.doorno}, ${item.attributes.streetroad}, ${item.attributes.address}, ${item.attributes.city?.data?.attributes?.cityname}, ${item.attributes.state?.data?.attributes?.statename} - ${item.attributes.pincode}`,
              boardSize: item.attributes.boards?.width && item.attributes.boards?.height? `${item.attributes.boards?.width} x ${item.attributes.boards?.height} ft`: 'Board Size Not Available',
              societyType: item.attributes?.societytype? item.attributes?.societytype: '',
              geoLocation: item.attributes.latitude && item.attributes.longitude ? `https://maps.google.com/?q=${item.attributes.latitude},${item.attributes.longitude}` : 'Location Not Available',
              date: `${new Date(item.attributes.createdAt).getDate()}-${new Date(item.attributes.createdAt).getMonth()}-${new Date(item.attributes.createdAt).getFullYear()}, ${new Date(item.attributes.createdAt).getHours()}:${new Date(item.attributes.createdAt).getMinutes()}`,
              images: invs
            }
            pdfDataArray.push(pdfdata);
          }
          this.reccePdfData = pdfDataArray
        }
      });
    //"env.backendfileURI + item?.filepath attributes.storepics

    // html2pdf().from(DATA).set(opt).save();
  }
  generateAudit() {
    // this.toastr.success("Audit Report Generation Started", "Success!", {
    //   timeOut: 3000,
    // });
    // var stores = [];
    // var tasks = [];
    // this.http.get(environment.backend + "inventories?populate=*&filters[projects][id][$eq]=" + this.projectid).subscribe(
    //   (data: any) => {
    //     if (data) {
    //       stores = data.data;
    //       this.http.get(environment.backend + "orivetasks?[populate][workorder][populate][log][populate]=*&filters[$and][0][project][id][$eq]=" + this.projectid + "&filters[$and][1][workorder][type][$eq]=audit").subscribe(
    //         (data: any) => {
    //           tasks = data.data;
    //           this.generateReportsPDF(stores, tasks, "audit");
    //         });

    //     }
    //   });

    if (this.reccePdfData.length) {
      this.toastr.success("Audit Report Generation Started", "Success!", {
        timeOut: 3000,
      });
      let doc = new jsPDF('l', 'px', [960, 768]);
      doc.html(this.auelement.nativeElement, {
        callback: doc => {
          window.open(URL.createObjectURL(doc.output('blob')))
          this.toastr.success("Audit Report", "Success!", {
            timeOut: 3000,
          });
          // pdf.save("demo.pdf");
        }
      })
    } else {
      this.toastr.error("Audit Report Data Empty", "Error!", {
        timeOut: 3000,
      });
    }

    //"env.backendfileURI + item?.filepath attributes.storepics

    // html2pdf().from(DATA).set(opt).save();
  }
  // generatePDF(stores: any) {
  //   let DATA = "<html><body>";
  //   var doc = new jsPDF();
  //   let i = 1;
  //   for (let store of stores) {
  //     if (store.attributes.status?.data?.attributes?.statusname == "Approved") {
  //       doc.setFontSize(10);
  //       doc.setDrawColor(0);
  //       doc.setFillColor(64, 64, 64);
  //       doc.rect(0, 0, 210, 297, 'FD');
  //       doc.setTextColor(245, 245, 245);
  //     }
  //     doc.text(store.attributes.refno, 10, 10);
  //     doc.text(store.attributes.storename, 10, 15);
  //     doc.text(store.attributes.storetype.data.attributes.typename, 10, 20);
  //     doc.text(String(store.attributes.latitude) + " / " + String(store.attributes.longitude), 10, 25);
  //     doc.text(store.attributes.doorno + " " + store.attributes.streetroad, 10, 30);
  //     doc.text(store.attributes.city.data.attributes.cityname + " " + store.attributes.state.data.attributes.statename + " " + String(store.attributes.pincode), 10, 35);
  //     //var body = "<h1>" + store.attributes.refno + "</h1>";

  //     for (let img of store.attributes.storepics) {
  //       let myimg = this.env.backendfileURI + img?.filepath;

  //       doc.rect(8, 38, 154, 104, 'FD');
  //       doc.addImage(myimg, 'JPEG', 10, 40, 150, 100);
  //       doc.text(img.viewtype, 170, 100);

  //       doc.addPage();
  //       doc.setFontSize(10);
  //       doc.setDrawColor(0);
  //       doc.setFillColor(64, 64, 64);
  //       doc.rect(0, 0, 210, 297, 'FD');
  //       doc.setTextColor(245, 245, 245);


  //       //body += "<img src='" + this.env.backendfileURI + img?.filepath + "' style = 'width: 100%; display: block;'/>"
  //     }
  //     let boardImg = this.env.backendfileURI + store.attributes?.boards?.filepath;
  //     doc.rect(8, 38, 154, 104, 'FD');
  //     doc.addImage(boardImg, 'JPEG', 10, 40, 150, 100);
  //     doc.text("Board", 170, 90);
  //     doc.text(String(store.attributes.boards.width) + "X" + String(store.attributes.boards.height) + " ft", 170, 100);
  //     if (i < stores.length) {
  //       doc.addPage();
  //     }
  //     i = i + 1;
  //     //body += "<img src=" + this.env.backendfileURI + store.attributes?.boards?.filepath + "style = 'width: 100%; display: block;'/>"

  //     //DATA += body;
  //   }

  //   // DATA += "</body></html>";
  //   //console.log(DATA);
  //   var opt = {
  //     margin: [10, 0, 0, 0],
  //     filename: this.project.attributes.projectname + "_reccee.pdf",
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { dpi: 192, scale: 2, letterRendering: true },
  //     jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
  //     pageBreak: { mode: 'css', before: '#nextpage1' }
  //   };
  //   doc.save(this.project.attributes.projectname + "_reccee.pdf");
  //   this.toastr.success("Recce Generation Completed", "Success!", {
  //     timeOut: 3000,
  //   });
  // }
  generateRecce() {
    if (this.reccePdfData.length) {
      this.toastr.success("Recce Generation Started", "Success!", {
        timeOut: 3000,
      });
      let doc = new jsPDF('l', 'px', [960, 768]);
      doc.html(this.element.nativeElement, {
        callback: doc => {
          window.open(URL.createObjectURL(doc.output('blob')))
          this.toastr.success("Recce Generation Completed", "Success!", {
            timeOut: 3000,
          });
          // pdf.save("demo.pdf");
        }
      })
    } else {
      this.toastr.error("Inventory Data Empty", "Error!", {
        timeOut: 3000,
      });
    }
  }
  generateInstallation() {
    if (this.reccePdfData.length) {
      this.toastr.success("Installation Report Generation Started", "Success!", {
        timeOut: 3000,
      });
      let doc = new jsPDF('l', 'px', [960, 768]);
      doc.html(this.inselement.nativeElement, {
        callback: doc => {
          window.open(URL.createObjectURL(doc.output('blob')))
          this.toastr.success("Installation Report", "Success!", {
            timeOut: 3000,
          });
          // pdf.save("demo.pdf");
        }
      })
    } else {
      this.toastr.error("Installation Report Data Empty", "Error!", {
        timeOut: 3000,
      });
    }
  }
  generateReportsPDF(stores: any, tasks: any, filename: any) {
    console.log(tasks);
    let DATA = "<html><body>";
    var doc = new jsPDF();
    let i = 1;
    //for (let store of stores) {
    for (let task of tasks) {

      doc.setFontSize(10);
      doc.setDrawColor(0);
      doc.setFillColor(64, 64, 64);
      doc.rect(0, 0, 210, 297, 'FD');
      doc.setTextColor(245, 245, 245);


      if (task.attributes.workorder) {
        for (let wom of task.attributes.workorder) {
          for (let store of stores) {
            if (wom.storeid == store.id) {
              doc.text(store.attributes.refno, 10, 10);
              doc.text(store.attributes.storename, 10, 15);
              doc.text(store.attributes.storetype.data.attributes.typename, 10, 20);
              doc.text(String(store.attributes.latitude) + " / " + String(store.attributes.longitude), 10, 25);
              doc.text(store.attributes.doorno + " " + store.attributes.streetroad, 10, 30);
              doc.text(store.attributes.city.data.attributes.cityname + " " + store.attributes.state.data.attributes.statename + " " + String(store.attributes.pincode), 10, 35);
              //var body = "<h1>" + store.attributes.refno + "</h1>";*/
              for (let log of wom.log) {

                let myimg = this.env.backendfileURI + log?.photo_filepath;

                doc.rect(8, 38, 154, 104, 'FD');
                doc.addImage(myimg, 'JPEG', 10, 40, 150, 100);
                doc.text("Proof", 170, 100);

                doc.addPage();
                doc.setFontSize(10);
                doc.setDrawColor(0);
                doc.setFillColor(64, 64, 64);
                doc.rect(0, 0, 210, 297, 'FD');
                doc.setTextColor(245, 245, 245);


                //body += "<img src='" + this.env.backendfileURI + img?.filepath + "' style = 'width: 100%; display: block;'/>"
              }
            }
          }
        }
      }
      /*let boardImg = this.env.backendfileURI + store.attributes?.boards?.filepath;
      doc.rect(8, 38, 154, 104, 'FD');
      doc.addImage(boardImg, 'JPEG', 10, 40, 150, 100);
      doc.text("Board", 170, 90);
      doc.text(String(store.attributes.boards.width) + "X" + String(store.attributes.boards.height) + " ft", 170, 100);
      if (i < stores.length) {
        doc.addPage();
      }
      i = i + 1;*/
      //body += "<img src=" + this.env.backendfileURI + store.attributes?.boards?.filepath + "style = 'width: 100%; display: block;'/>"

      //DATA += body;
      if (i < tasks.length) {
        doc.addPage();
      }
      i = i + 1;
    }
    //}

    // DATA += "</body></html>";
    //console.log(DATA);
    var opt = {
      margin: [10, 0, 0, 0],
      filename: this.project.attributes.projectname + "_" + filename + ".pdf",
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { dpi: 192, scale: 2, letterRendering: true },
      jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pageBreak: { mode: 'css', before: '#nextpage1' }
    };
    doc.save(this.project.attributes.projectname + "_" + filename + ".pdf");
    this.toastr.success("Recce Generation Completed", "Success!", {
      timeOut: 3000,
    });
  }
  save() {
    this.projectInfoSubmit('');
    location.reload();
  }

  unitCostChanges() {
    let totel = this.unitcost.value * this.no_of_units.value;
    this.totel_cost.setValue(totel);
  }

  durationChanges() {
    if (this.startdate.valid && this.enddate.valid) {
      let start: any = new Date(this.startdate.value);
      let end: any = new Date(this.enddate.value);

      let durationDays = (end - start) / (1000 * 3600 * 24);
      this.duration.setValue(durationDays);
    }
  }

  createTask(modal) {
    if (this.tasktype.value == "") {
      this.toastr.error("Task type cannot be empty!", "error!", {
        timeOut: 3000,
      });
      return;
    }
    var storesSelected = [];
    var taskstatus = (this.tstatus.value) ? this.tstatus.value : "Assigned";
    const taskUserResult = this.user_list_ins.filter(item => item.attributes.users_permissions_user.data.id == this.tassigned.value);
    console.log(taskUserResult);
    console.log(this.taskFrmGp)
    var taskuser = taskUserResult[0]?.attributes.users_permissions_user.data.attributes.username;

    if (this.disable) {
      this.task.attributes.workorder.forEach(item => {
        storesSelected.push({
          id: item.id,
          storeid: item.storeid, type: item.type, status: item.status,
          updateddate: new Date(),
          log: item.log
        })
      });
      this.stores_selected_task.forEach((item, index) => {
        var itemfound = false;
        storesSelected.forEach(storeitem => {
          if (item.id == storeitem.storeid) {
            itemfound = true;
          }
        });
        if (!itemfound) {
          storesSelected.push({ storeid: item.id, type: this.tasktype.value, status: taskstatus });
        }
        itemfound = false;
      });

      this.http
        .put(environment.backend + "orivetasks/" + this.selectedTask.id, {
          data: {
            type: this.tasktype.value, status: this.tstatus.value, assigned: this.tassigned.value, assigneduserid: this.tassigned.value,
            assignedusername: taskuser, completiondate_actual: this.t_actualdateofcomp.value, completiondate_planned: this.t_plandateofcomp.value,
            description: this.taskdec.value, workorder: storesSelected
          }
        })
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success("Task data updated!", "Success!", {
                timeOut: 3000,
              });
              this.taskFrmGp.reset();
              this.loadProjectTasks();
              modal();
            }
          },
          (err) => {
            if (err.error) {
              this.toastr.error(
                JSON.stringify(err),
                "Error while creating Task!",
                {
                  timeOut: 3000,
                }
              );
            }
          }
        );
    } else {
      this.stores_selected_task.forEach((item, index) => {
        storesSelected.push({ storeid: item.id, type: this.tasktype.value, status: taskstatus });
      });
      this.http
        .post(environment.backend + "orivetasks", {
          data: {
            project: this.projectid, type: this.tasktype.value, status: this.tstatus.value,
            assigned: this.tassigned.value, assigneduserid: this.tassigned.value, assignedusername: taskuser,
            completiondate_planned: this.t_plandateofcomp.value,
            description: this.taskdec.value, workorder: storesSelected

          }
        })
        .subscribe(
          (data: any) => {
            if (data) {
              this.loadProjectTasks();
              modal();
            }
          },
          (err) => {
            if (err.error) {
              this.toastr.error(
                JSON.stringify(err),
                "Error while creating Task!",
                {
                  timeOut: 3000,
                }
              );
            }
          }
        );
    }

  }

  loadProjectTasks() {
    this.http.get(environment.backend + "orivetasks?[populate][workorder][populate][log][populate]=*&filters[project][id][$eq]=" + this.projectid).subscribe(
      (data: any) => {
        if (data) {
          this.task_list = data.data;
          console.log(this.task_list);
          this.generatePdfData();
        }
      });
  }
  onItemSelect(item: any) {
    console.log(item);
  }
  onSelectAll(items: any) {
    console.log(items);
  }
  onDialogClose() {
    this.toastr.success("Inventory Selected,Please save the project to complete adding the selected inventories!", "Success!", {
      timeOut: 3000,
    });
  }
  showMessage() {
    this.toastr.success("Please save the project to complete adding the selected inventories", "Success!", {
      timeOut: 3000,
    });
  }
  deleteRow(event) {
    this.stores_selected.forEach((item, index) => {

      if (item.id == event.id) {
        this.stores_selected.splice(index, 1)
        this.stores_tobedeleted.push(event);
        this.invCount = this.invCount - 1;
        this.no_of_units.setValue(this.invCount);
        this.unitCostChanges();
      };

    });
  }
  storeStatus(event) {
    console.log(event);
    this.store_Status = event.target.value;
  }
  taskTypeChanged(event) {
    this.user_list_ins = [];
    if (event == 'Installation') {
      var result = this.user_list_All.filter(item => item.attributes?.oriv_role?.data?.id == ROLE.INSTALLATION);
      this.user_list_ins = result;
      // this.showINSTALLUsers = true;
      //this.showFEUsers = false;
    } else if (event == 'Audit' || event == 'CreateInventory') {
      var result = this.user_list_All.filter(item => item.attributes?.oriv_role?.data?.id == ROLE.FIELD_EXECUTIVE);
      this.user_list_ins = result;
      //this.showFEUsers = true;
      //this.showINSTALLUsers = false;
    }
    console.log(event);
  }
  removeSubTask(subtask: SubTask) {
    console.log(this.task.attributes.workorder);

    this.subtasks.forEach((item, index) => {
      if (item.id == subtask.id) {
        if (subtask.status == 'Assigned') {
          this.subtasks.splice(index, 1);
          this.task.attributes.workorder.forEach((subitem, i) => {
            this.task.attributes.workorder.splice(i, 1);
          });
        }
        else {
          this.toastr.error("Only Subtasks in assigned status can be deleted!", "Error!", {
            timeOut: 3000,
          });
        }
      }
    });
    console.log(this.task.attributes.workorder);
  }
  saveSubTask(task: any) {
    this.http
      .put(environment.backend + "orivetasks/" + task.id, {
        data: {
          workorder: this.subtasks
        }
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.toastr.success("Task data updated!", "Success!", {
              timeOut: 3000,
            });
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while updating Task!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
  }
  deleteTask(task: any) {
    this.http
      .delete(environment.backend + "orivetasks/" + task.id)
      .subscribe(
        (data: any) => {
          if (data) {
            this.toastr.success("Task deleted!", "Success!", {
              timeOut: 3000,
            });
            location.reload();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while deleting Task!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );
  }
}