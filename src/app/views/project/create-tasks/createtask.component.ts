import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { Inventory, SubTask } from 'src/app/shared/models/inventory';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';

@Component({
  selector: 'app-createtask',
  templateUrl: './createtask.component.html',
  styleUrls: ['./createtask.component.scss']
})
export class CreatetaskComponent implements OnInit {
  env = environment;
  task_list = [];
  logs = [];
  pageSize = 10;
  page = 1;
  task_type_list = ["CreateInventory", "Installation", "Audit"];
  task_status = ["Assigned", "InProgress", "Completed"];
  store_list = [];
  taskFrmGp: FormGroup;
  taskAttachmentFrmGrp: FormGroup;
  project = new FormControl("", Validators.required);
  tasktype = new FormControl("", Validators.required);
  taskdec = new FormControl("", Validators.required);
  t_actualdateofcomp = new FormControl("", Validators.required);
  tstatus = new FormControl("", Validators.required);
  t_planneddateofcomp = new FormControl("", Validators.required);
  stores = new FormControl("", Validators.required);
  inputfile1 = new FormControl("", Validators.required);
  inputfile2 = new FormControl("", Validators.required);
  tassigned = new FormControl("", Validators.required);
  @Input() public task;
  subtasks: SubTask[] = [];
  imagefile1: File;
  imagefile2: File;
  lat = 0;
  lng = 0;
  marker: Marker = {
    lat: this.lat,
    lng: this.lng,
    draggable: true,
  };
  projects: any[] = [];
  grid_headers = ["S.No", "Name", "Ref.Id", "Address", "City", "State", "Pincode"];
  field_names = ["Inventory.storename",
    "Inventory.refno",
    "store.attributes?.city?.data?.attributes?.cityname",
    "store.attributes?.state?.data?.attributes?.statename",
    "store.attributes?.pincode"
  ];
  filter_fields = ["store.attributes?.state?.data?.attributes?.statename",
    "store.attributes?.city?.data?.attributes?.cityname",
    "store.attributes?.pincode"
  ];
  stores_available: Inventory[] = [];
  stores_selected: any[] = [];
  disable = false;
  taskid: any;
  user_list = [];
  status = ["Assigned", "InProgress", "Completed"];
  public selectedSubTask: SubTask;
  public selectedSubTaskLog: any[] = [];
  constructor(config: NgbCarouselConfig, fb: FormBuilder, private modalService: NgbModal,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
    private dataservice: DataLayerService) {
    this.taskFrmGp = fb.group({
      project: this.project, taskdec: this.taskdec, t_actualdateofcomp: this.t_actualdateofcomp,
      tstatus: this.tstatus, t_planneddateofcomp: this.t_planneddateofcomp,
      tasktype: this.tasktype,
      tassigned: this.tassigned
    });
    this.taskAttachmentFrmGrp = fb.group({
      stores: this.stores,
      inputfile1: this.inputfile1,
      inputfile2: this.inputfile2
    });
    config.interval = 2000;
    config.keyboard = true;
    config.pauseOnHover = true;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.taskid = params["id"];
      if (this.taskid) { this.disable = true; }
    });
    this.loadTasks();
    this.loadprojects()
    this.loadAvailableInventories();
    this.loadMasterData();

    //get current location data to store in file attachment log
    navigator.geolocation.getCurrentPosition((geo) => {
      this.lat = this.marker.lat = geo.coords.latitude;
      this.lng = this.marker.lng = geo.coords.longitude;
    });
  }
  loadMasterData() {
    this.dataservice.getusers(2).subscribe((data: any) => {
      if (data) {
        this.user_list = data.data;
      }
    });
  }
  loadTasks() {
    this.http.get(environment.backend + "orivetasks?[populate][workorder][populate][log][populate]=*&filters[created][id][$eq]=" + this.authService.userId.getValue()).subscribe(
      (data: any) => {
        if (data) {
          this.task_list = data.data;
          this.toastr.success("Task data loaded", "Success!", {
            timeOut: 3000,
          });
        }
      });
  }
  loadAvailableInventories() {
    let url = `stores?populate=*&sort[0]=updatedAt%3Adesc`;
    //url += '&filters[$and][0][status][statusname][$eq]=approved&filters[$and][1][availability][$eq]=Available&filters[$and][1][pincode][$eq]=' + pincode;
    url += '&filters[$and][0][status][statusname][$eq]=approved&filters[$and][1][availability][$eq]=available&filters';
    this.http
      .get(environment.backend + url)
      .subscribe((data: any) => {
        if (data) {
          if (data.data.length > 0) {
            var result = data.data.map((storeattr: {
              attributes: {
                id: any,
                storename: any,
                refno: any,
                doorno: any,
                streetroad: any,
                pincode: any,
                latitude: any,
                longitude: any,
                temprefno: any,
                ownername: any,
                mobileno: any,
                address: any,
                storetype: any,
                city: any,
                state: any,

              }, id: any;
            }) => ({
              id: storeattr.id,
              storename: storeattr.attributes?.storename,
              refno: storeattr.attributes?.refno,
              doorno: storeattr.attributes.doorno,
              streetroad: storeattr.attributes.streetroad,
              address: storeattr.attributes.address,
              pincode: storeattr.attributes.pincode,
              latitude: storeattr.attributes.latitude,
              longitude: storeattr.attributes.longitude,
              temprefno: storeattr.attributes.temprefno,
              ownername: storeattr.attributes.ownername,
              mobileno: storeattr.attributes.mobileno,
              storetype: storeattr.attributes?.storetype?.data?.attributes?.typename,
              city: storeattr.attributes?.city?.data?.attributes?.cityname,
              state: storeattr.attributes?.state?.data?.attributes?.statename,

            }));

            //this.stores_available.push(data.data);
            this.stores_available = result;
            this.toastr.success(data.message, "Success!", {
              timeOut: 3000,
            });
          }
          else {
            this.toastr.success("no stores available for this pincode", "Success!", {
              timeOut: 3000,
            });
          }
          //this.storedataloaded = true;
        }
      });
  }
  openModal(content: any, selectedtask: any) {
    this.task = selectedtask;
    console.log(selectedtask);
    //this.logs = this.task.attributes?.logs;
    //skip the assigned stores
    if (selectedtask === null) {
      this.disable = false;
    } else {
      this.disable = true;
    }
    if (this.disable) {
      for (let subtask of this.task.attributes.workorder) {
        this.stores_available.forEach((item, index) => {
          if (item.id == subtask.storeid) this.stores_available.splice(index, 1);
        });
      }

      this.taskFrmGp.patchValue({
        tstatus: this.task.attributes?.status,
        project: this.task.attributes?.project?.data?.id,
        taskdec: this.task.attributes?.description,
        tasktype: this.task.attributes?.type,
        t_planneddateofcomp: this.task.attributes?.completiondate_planned,
        t_actualdateofcomp: this.task.attributes?.completiondate_actual,
        tassigned: this.task.attributes?.assigned?.data?.id
      });
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

  openSubTaskModal(content: any, selectedtask: any) {
    this.task = selectedtask;
    this.subtasks = [];
    let filters = '';
    let i = 0;
    for (let workorder of this.task.attributes.workorder) {
      let wom: SubTask = <SubTask>{};
      //console.log(workorder);
      this.http
        .get(environment.backend + 'stores/' + workorder.storeid + '?populate=*')
        .subscribe((data: any) => {
          if (data) {
            console.log(data);
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
          }
        });
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
  openAttachmentModal(content: any, selectedtask: any) {
    this.task = selectedtask;
    this.inputfile1.setValue("");
    this.inputfile2.setValue("");
    this.imagefile1 = null;
    this.imagefile2 = null;
    this.http.get(environment.backend + "projects/" + this.task.attributes?.project?.data?.id + "?populate=*").subscribe(
      (data: any) => {
        if (data) {
          this.store_list = data.data?.attributes?.stores?.data
          console.log("stores for tasks loaded", "Success!");
        }
      });
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

  filter(keyword: any) {

  }

  saveTask(modal) {
    var taskstatus = (this.tstatus.value) ? this.tstatus.value : "Assigned";
    var storesSelected = [];
    this.stores_selected.forEach((item, index) => {
      storesSelected.push({ storeid: item.id, type: this.tasktype.value, status: taskstatus });
    });

    if (this.tasktype.value == "") {
      this.toastr.error("Task type cannot be empty!", "error!", {
        timeOut: 3000,
      });
      return;
    }
    if (this.disable) {
      this.task.attributes.workorder.forEach(item => {
        storesSelected.push({
          id: item.id,
          storeid: item.storeid, type: item.type, status: item.status,
          updateddate: new Date(),
          log: item.log
        })
      });
      this.http
        .put(environment.backend + "orivetasks/" + this.task.id, {
          data: {
            project: this.project.value, type: this.tasktype.value, status: this.tstatus.value, assigned: this.tassigned.value,
            completiondate_actual: this.t_actualdateofcomp.value, completiondate_planned: this.t_planneddateofcomp.value,
            description: this.taskdec.value,
            created: Number(this.authService.userId.value),
            workorder: storesSelected
          }
        })
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success("Task data updated!", "Success!", {
                timeOut: 3000,
              });
              this.taskFrmGp.reset();
              this.loadTasks();
              this.disable = false;
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
      this.http
        .post(environment.backend + "orivetasks", {
          data: {
            project: this.project.value, type: this.tasktype.value, status: this.tstatus.value, assigned: this.tassigned.value,
            completiondate_planned: this.t_planneddateofcomp.value, description: this.taskdec.value,
            created: Number(this.authService.userId.value),
            workorder: storesSelected
          }
        })
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success(data.message, "Success!", {
                timeOut: 3000,
              });
              this.loadTasks();
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
  saveSubTask(modal, wom: any) {
    // var taskstatus = (wom.status) ? wom.status : "Assigned";
    //console.log(this.subtasks);
    var subtaskstobeupdated = [];
    this.subtasks.forEach((item, index) => {
      subtaskstobeupdated.push({ storeid: item.store, type: item.type, status: item.status, updateddate: new Date() });
    });
    console.log(subtaskstobeupdated);
    this.http
      .put(environment.backend + "orivetasks/" + this.task.id, {
        data: {
          workorder: subtaskstobeupdated
        }
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.toastr.success("Actions items data updated!", "Success!", {
              timeOut: 3000,
            });
            this.taskFrmGp.reset();
            this.loadTasks();
          }
        },
        (err) => {
          if (err.error) {
            this.toastr.error(
              JSON.stringify(err),
              "Error while updating action items!",
              {
                timeOut: 3000,
              }
            );
          }
        }
      );

  }

  onFileChanged(event, view: string) {
    if (event.target.files.length > 0) {
      const file = event.target?.files[0];
      if (view === "view1") {
        this.imagefile1 = event.target?.files[0];
        this.inputfile1.setValue(event.target?.files[0]);
      } else if (view === "view2") {
        this.imagefile2 = event.target?.files[0];
        this.inputfile2.setValue(event.target?.files[0]);
      };
    }
  }
  uploadPhotos(modal) {
    const photoProofFrmData = new FormData();
    photoProofFrmData.append(`files`, this.imagefile1, this.imagefile1?.name);
    photoProofFrmData.append(`files`, this.imagefile2, this.imagefile2?.name);
    let photoIds = this.task.attributes?.logs;
    this.http.post(environment.backend + "upload", photoProofFrmData)
      .subscribe(
        (data: any) => {
          for (let pic of data) {
            photoIds.push({
              photo_fileid: pic.id, photo_filepath: pic.url, latitude: this.lat, longitude: this.lng,
              storeid: this.stores.value, logtype: this.task.attributes?.type, uploadeddatetime: new Date()
            });
          }

          //update task post fileupload
          this.http
            .put(environment.backend + "orivetasks/" + this.task.id + "&populate=*", {
              data: {
                logs: photoIds
              }
            })
            .subscribe(
              (data: any) => {
                if (data) {
                  this.toastr.success("Photos uploaded", "Success!", {
                    timeOut: 3000,
                  });
                  this.loadTasks();
                  modal();
                }
              },
              (err) => {
                if (err.error) {
                  this.toastr.error(
                    JSON.stringify(err),
                    "Error while uploading photos!",
                    {
                      timeOut: 3000,
                    }
                  );
                }
              }
            );
        });
  }
  loadprojects() {
    //console.log("load Inventory list");
    let url = `projects?populate=*&sort[0]=updatedAt%3Adesc`;
    // console.log(this.authService.role.getValue());
    if (this.authService.role?.getValue() == 'fieldexecutive') {
      url += '&filters[assignedto][id][$eq]=' + this.authService.userId.getValue();
    } else {
      url += '&filters[createdby][id][$eq]=' + this.authService.userId.getValue();
    }

    this.http
      .get(environment.backend + url)
      .subscribe((data: any) => {
        if (data) {
          this.projects = data.data;
          //console.log(this.stores);
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
        }
      });
  }
  selectStore(event: any) {
    this.stores_selected.push(event);

  }
  removeStore(data: any) {
    this.stores_selected.forEach((item, index) => {
      if (item.id == data.id) this.stores_selected.splice(index, 1);
    });
    console.log(this.stores_selected);
  }

}
interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
