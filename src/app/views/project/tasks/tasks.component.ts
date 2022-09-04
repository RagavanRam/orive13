import { Component, Input, OnInit } from '@angular/core';
import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { SubTask } from 'src/app/shared/models/inventory';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})
export class TasksComponent implements OnInit {
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
  @Input() public task;
  @Input() public selectedSubTask: SubTask;
  @Input() public selectedSubTaskLog: any[] = [];
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
  constructor(config: NgbCarouselConfig, fb: FormBuilder, private modalService: NgbModal,
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute) {
    this.taskFrmGp = fb.group({
      project: this.project, taskdec: this.taskdec, t_actualdateofcomp: this.t_actualdateofcomp,
      tstatus: this.tstatus, t_planneddateofcomp: this.t_planneddateofcomp,
      tasktype: this.tasktype,
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
    this.loadProjectTasks();
    //get current location data to store in file attachment log
    navigator.geolocation.getCurrentPosition((geo) => {
      this.lat = this.marker.lat = geo.coords.latitude;
      this.lng = this.marker.lng = geo.coords.longitude;
    });
  }
  loadProjectTasks() {
    this.http.get(environment.backend + "orivetasks?[populate][workorder][populate][log][populate]=*&sort[0]=updatedAt%3Adesc&pagination[limit]=100&filters[assigned][id][$eq]=" + this.authService.userId.getValue()).subscribe(
      (data: any) => {
        if (data) {
          this.task_list = data.data;
          this.toastr.success("Task data loaded", "Success!", {
            timeOut: 3000,
          });
        }
      });
  }

  openModal(content: any, selectedtask: any) {
    this.task = selectedtask;
    this.logs = this.task.attributes?.logs;

    this.taskFrmGp.patchValue({
      tstatus: this.task.attributes?.status,
      project: this.task.attributes?.project?.data?.attributes?.projectname,
      taskdec: this.task.attributes?.description,
      tasktype: this.task.attributes?.type,
      t_planneddateofcomp: this.task.attributes?.completiondate_planned,
      t_actualdateofcomp: this.task.attributes?.completiondate_actual
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

  openSubTaskAttachmentModal(content: any, selectedSubTask: any) {
    this.selectedSubTask = selectedSubTask;
    this.inputfile1.setValue("");
    this.inputfile2.setValue("");
    this.imagefile1 = null;
    this.imagefile2 = null;
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

  openSubTaskModal(content: any, selectedtask: any) {
    this.task = selectedtask;
    this.subtasks = [];
    let filters = '';
    let i = 0;
    for (let workorder of this.task.attributes.workorder) {
      console.log(workorder)
      let wom: SubTask = <SubTask>{};
      //console.log(workorder);
      this.http
        .get(environment.backend + 'stores/' + workorder.storeid + '?populate=*')
        .subscribe((data: any) => {
          if (data) {
            //console.log(data);
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
  filter(keyword: any) {

  }
  saveSubTask(modal, wom: any) {
    // var taskstatus = (wom.status) ? wom.status : "Assigned";

    //console.log(this.subtasks);
    var subtaskstobeupdated = [];
    this.subtasks.forEach((item, index) => {
      subtaskstobeupdated.push({ id: item.id, storeid: item.store, type: item.type, status: item.status, updateddate: new Date(), log: item.log });
    });
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
            this.loadProjectTasks();
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
  updateTask(modal) {
    let todospending = false;
    this.task.attributes.workorder.forEach(item => {
      //check for any pending subtasks
      if (item.status !== "Completed") {
        todospending = true;
        return;
      }
    });
    if (todospending) {
      this.toastr.error("Some action items are still Pending!", "Error!", {
        timeOut: 3000,
      });
      return;
    }
    this.http
      .put(environment.backend + "orivetasks/" + this.task.id, {
        data: {
          status: this.tstatus.value,
          completiondate_planned: this.t_planneddateofcomp.value,
          completiondate_actual: this.t_actualdateofcomp.value,
          description: this.taskdec.value,
        }
      })
      .subscribe(
        (data: any) => {
          if (data) {
            this.toastr.success("Task updated", "Success!", {
              timeOut: 3000,
            });
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
  onFileChanged(event, view: string) {
    console.log(event);
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
                  this.loadProjectTasks();
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

  uploadPhotosSubTask(modal, subtask: SubTask) {
    const photoProofFrmData = new FormData();
    photoProofFrmData.append(`files`, this.imagefile1, this.imagefile1?.name);
    photoProofFrmData.append(`files`, this.imagefile2, this.imagefile2?.name);
    let photoIds = (this.selectedSubTask.log) ? this.selectedSubTask.log : [];
    this.http.post(environment.backend + "upload", photoProofFrmData)
      .subscribe(
        (data: any) => {
          for (let pic of data) {
            photoIds.push({
              photo_fileid: pic.id, photo_filepath: pic.url, latitude: this.lat, longitude: this.lng,
              logtype: this.selectedSubTask.type, uploadeddatetime: new Date()
            });
          }

          //update task post fileupload
          var subtaskstobeupdated = [];
          this.subtasks.forEach((item, index) => {
            if (item.id == this.selectedSubTask.id) {
              subtaskstobeupdated.push({
                id: this.selectedSubTask.id, storeid: this.selectedSubTask.store, type: this.selectedSubTask.type,
                status: this.selectedSubTask.status, updateddate: new Date(), log: photoIds
              });
            } else {
              subtaskstobeupdated.push({
                storeid: item.store, type: item.type, status: item.status,
                updateddate: new Date(),
                log: item.log
              });
            }

          });

          this.http
            .put(environment.backend + "orivetasks/" + this.task.id + "?populate=*", {
              data: {
                workorder: subtaskstobeupdated
              }
            })
            .subscribe(
              (data: any) => {
                if (data) {
                  this.toastr.success("Photos uploaded", "Success!", {
                    timeOut: 3000,
                  });
                  this.loadProjectTasks();
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
}
interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}