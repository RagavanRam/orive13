import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from 'src/environments/environment';
import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: "app-users-list",
  templateUrl: "./users-list.component.html",
  styleUrls: ["./users-list.component.scss"],
})
export class UsersListComponent implements OnInit {
  @ViewChild("search") search!: ElementRef;
  userLimit = 100;
  userTotel: any;
  dataPageLimit = 1;
  page = 1;
  timer: any;
  contacts: any[] = [];
  role = "all";
  forgotPassword: FormGroup;
  selectedUser: any;
  newPassword = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);
  confirmPassword = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);
  editProfile: FormGroup;
  email = new FormControl(
    "",
    Validators.compose([Validators.email, Validators.required])
  );
  firstName = new FormControl("", Validators.required);
  lastName = new FormControl("", Validators.required);
  userRole = new FormControl("fieldexecutive", Validators.required);
  emp_type = new FormControl("EMP", Validators.required);
  phone = new FormControl("", [
    Validators.required,
    Validators.maxLength(11),
    Validators.minLength(8),
  ]);
  emp_no = new FormControl("", [
    Validators.maxLength(11),
    Validators.minLength(5),
  ]);
  pincode = new FormControl("", [
    Validators.required,
    Validators.maxLength(5),
    Validators.minLength(6),
  ]);
  worker: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private toastr: ToastrService,
    private modalService: NgbModal
  ) {
    this.forgotPassword = fb.group({
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    });
    this.editProfile = fb.group({
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.userRole,
      phone: this.phone,
      pincode: this.pincode,
      emp_type: this.emp_type,
      emp_no: this.emp_no,
    });
  }

  ngOnInit() {
    this.http
      .get(environment.backend + `userdetails?populate=*&pagination[limit]=100`)
      .subscribe((data: any) => {
        if (data) {
          this.contacts = data.data;
          this.userTotel = data?.meta?.pagination?.total
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
          console.log(this.contacts);
        }
      });
  }

  userPageChange() {
    if (this.userTotel > this.userLimit) {
      if (this.page == this.userLimit) {
        this.userLimit = this.userLimit + 100;
        this.dataPageLimit = this.dataPageLimit + 1;
        let url = `userdetails?populate=*&sort[0]=updatedAt%3Adesc&pagination[limit]=100&pagination[page]=` + this.dataPageLimit;
        this.http
        .get(environment.backend + url)
        .subscribe((data: any) => {
          if (data) {
            this.contacts.push(...data.data);
          }
        });
      }
    }
  }

  roleChanged(role: string) {
    let url = ''
    if (role == 'all') {
      url = `userdetails?populate=*`;
    }else {
      url = `userdetails?populate=*&filters[oriv_role][rolename][$eq]=` + role;
    }
    this.http
      .get(environment.backend + url)
      .subscribe((data: any) => {
        if (data) {
          this.contacts = data.data;
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
        }
      });
  }

  filter(): void {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.http
        .get(
          environment.backend +
          `userdetails?populate=*&filters[$or][0][firstname][$contains]=${this.search.nativeElement.value}&filters[$or][1][lastname][$contains]=${this.search.nativeElement.value}&filters[$or][2][users_permissions_user][username][$contains]=${this.search.nativeElement.value}`
        )
        .subscribe((data: any) => {
          if (data) {
            this.role = "all";
            this.contacts = data.data;
            this.toastr.success(data.message, "Success!", {
              timeOut: 3000,
            });
          }
        });
    }, 1000);
  }

  openModal(content, user, type = "") {
    this.selectedUser = user;
    if (type === 'edituser') {
      this.http
        .get(
          environment.backend +
          `accounts/get-users?username=${this.selectedUser.username}`
        )
        .subscribe((data: any) => {
          if (data) {
            this.selectedUser = data.user;
            this.firstName.setValue(data?.user?.first_name);
            this.lastName.setValue(data?.user?.last_name);
            this.email.setValue(data?.user?.email);
            this.phone.setValue(data?.user?.phone);
            this.userRole.setValue(data?.user?.group);
            this.pincode.setValue(data?.user?.pincode);
            this.emp_type.setValue(data?.user?.emp_type);
            this.emp_no.setValue(data?.user?.emp_no);
            this.worker = data?.user?.emp_type !== "GST";
            this.toastr.success(data.message, "Success!", {
              timeOut: 3000,
            });
          }
        });;
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

  forgot(modal) {
    const body = {
      password: this.newPassword.value,
    };
    if (body.password) {
      this.http
        .put(environment.backend + "users/" + this.selectedUser?.attributes?.users_permissions_user?.data?.id, body)
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success("Password reset Successful!", "Success!", {
                timeOut: 3000,
              });
            }
            modal();
          },
          (err) => {
            console.log(err);
            this.toastr.error(err?.error?.message, "Error while login!", {
              timeOut: 3000,
            });
          }
        );
      this.forgotPassword.reset();
    }
  }

  editUser(modal) {
    const body = {
      username: this.selectedUser.username,
      first_name: this.firstName.value,
      last_name: this.lastName.value,
      role: this.userRole.value,
      phone: this.phone.value,
      pincode: this.pincode.value,
      emp_type: this.worker ? this.emp_type.value : "AG",
      emp_no: this.emp_no.value,
    };
    this.http.patch(environment.backend + "accounts/register", body).subscribe(
      (data: any) => {
        if (data) {
          this.toastr.success("Update Successful!", "Success!", {
            timeOut: 3000,
          });
          modal();
        }
      });
  }

  setWorker() {
    this.worker = !this.worker;
  }
}
