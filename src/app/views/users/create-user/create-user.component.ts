import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { DataLayerService } from 'src/app/shared/services/data-layer.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-create-user",
  templateUrl: "./create-user.component.html",
  styleUrls: ["./create-user.component.scss"],
})
export class CreateUserComponent implements OnInit {
  roles: any[] = [];
  env = environment;
  register: FormGroup;
  alertType: string;
  alertText: string;
  email = new FormControl(
    null,
    Validators.compose([Validators.email, Validators.required])
  );
  firstName = new FormControl(null, Validators.required);
  lastName = new FormControl(null, Validators.required);
  role = new FormControl(null, Validators.required);
  emp_type = new FormControl("EMP", Validators.required);
  phone = new FormControl(null, [
    Validators.required,
    Validators.maxLength(11),
    Validators.minLength(8),
  ]);
  emp_no = new FormControl(null);
  pincode = new FormControl(null, [
    Validators.required,
    Validators.maxLength(5),
    Validators.minLength(6),
  ]);
  pwd = new FormControl(null, [
    Validators.required,
    Validators.maxLength(11),
    Validators.minLength(3),
  ]);
  worker: boolean = false;
  state_list = [];
  state = new FormControl(null, Validators.required);
  deploystate = new FormControl("");
  confirmpwd = new FormControl(null, Validators.required);
  disableBtn: boolean = true;
  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private dataservice: DataLayerService,
  ) {
    this.confirmpwd = new FormControl(null, [Validators.required, CustomValidators.passwordsMatch('pwd', 'confirmpwd').bind(this)]);

    this.register = fb.group({

      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      role: this.role,
      phone: this.phone,
      state: this.state,
      emp_no: this.emp_no,
      deploystate: this.deploystate,
      pwd: this.pwd,
      confirmpwd: this.confirmpwd,
    });
    //form control value changes to check for form validity. might be useful for custom validations
    /*this.register.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = this.register.valid;
        console.log(this.disableBtn);
      });*/
  }

  ngOnInit(): void {
    this.loadUserRoles();
    this.loadStates();
  }

  loadStates() {
    this.dataservice.getStates().subscribe((data: any) => {
      if (data) {
        this.state_list = data.data;
      }
    });
  }
  setWorker() {
    this.worker = !this.worker;
  }

  onSubmit(): void {

    const body = {
      first_name: this.firstName.value,
      last_name: this.lastName.value,
      role: this.role.value,
      email: this.email.value.toLowerCase(),
      phone: this.phone.value,
      emp_type: this.worker ? this.emp_type.value : "AG",
      emp_no: this.emp_no.value,
      pwd: this.pwd.value,
    };

    const user_permissions_body = {

      email: this.email.value.toLowerCase(),
      username: this.phone.value,
      orivrole: this.role.value,
      password: this.pwd.value,
    };
    this.http.get(environment.backend + "userdetails?populate=*&filters[$or][0][users_permissions_user][username][$eq]=" + this.phone.value + "&filters[$or][1][users_permissions_user][email][$eq]=" + this.email.value.toLowerCase()).subscribe(

      (data: any) => {
        if (data?.data.length > 0) {
          this.toastr.error("User already exists!", "Error!", {
            timeOut: 3000,
          });
          //return;
        }
        else {
          this.http.post(environment.backend + "auth/local/register", user_permissions_body).subscribe(
            (data: any) => {
              if (data) {
                this.toastr.success("User Creation Successful!", "Success!", {
                  timeOut: 3000,
                });
                const user_details_body = {
                  data: {
                    firstname: this.firstName.value,
                    lastname: this.lastName.value,
                    users_permissions_user: data.user.id,
                    oriv_role: this.role.value,
                    employeeid: this.emp_no.value,
                    state: this.state.value,
                    deploystate: this.deploystate.value
                  }
                }
                this.http.post(environment.backend + "userdetails", user_details_body).subscribe(
                  (data: any) => {
                    if (data) {
                      this.toastr.success("User Details update Successful!", "Success!", {
                        timeOut: 3000,
                      });

                      this.router.navigate(["users/list"]);
                    }
                  });
              }
            },
            (err) => {
              if (err.error) {
                this.toastr.error(JSON.stringify(err), "Error while registering!", {
                  timeOut: 3000,
                });
                this.alertType = "Error";
                this.alertText = JSON.stringify(err);
                this.register.reset();
              } else {
                this.alertType = "Error";
                this.alertText = err;
              }
            }
          );
        }
      });


  }

  loadUserRoles() {
    this.http.get(environment.backend + "orivroles").subscribe(
      (data: any) => {
        if (data) {
          this.toastr.success("Data loaded Successfully!", "Success!", {
            timeOut: 3000,
          });
          this.roles = data.data;
        }
      },
      (err) => {
        if (err.error) {
          this.toastr.error(JSON.stringify(err), "Error while fetching data!", {
            timeOut: 3000,
          });
          this.alertType = "Error";
          this.alertText = JSON.stringify(err);
        } else {
          this.alertType = "Error";
          this.alertText = err;
        }
      }
    );
  }
}
export class CustomValidators {

  public static passwordsMatch(password: string, confirmedPassword: string) {

    return (control: FormControl): { [s: string]: boolean } => {
      //getting undefined values for both variables
      let password1 = (<HTMLInputElement>document?.getElementById(password))?.value
      let password2 = (<HTMLInputElement>document?.getElementById(confirmedPassword))?.value
      //console.log(password1, password2);
      //if I change this condition to === it throws the error if the
      //  two fields are the same, so this part works
      if (password1 && password2) {
        if (password1 === password2) {
          //console.log("username exists false")
          return null;
        } else {
          //console.log("username exists true")
          //it always gets here no matter what
          return { 'passwordMismatch': true }
          //return null;
        }
      }
      else {
        return { 'passwordMismatch': true }
      }

    }
  }
  public static Usernameexists(username: any, httpclient: HttpClient) {
    if (username) {
      return (control: FormControl): { [s: string]: boolean } => {
        let usernameVal = (<HTMLInputElement>document?.getElementById(username))?.value
        //getting undefined values for both variables
        httpclient.get(environment.backend + "populate=*&filters[users_permissions_user][username][$eq]=" + usernameVal).subscribe(
          (data: any) => {
            if (data) {
              return null;
            } else {
              return { 'usernameexists': true }
            }
          });
        return { 'usernameexists': true };
      }
    }
    else {
      return { 'usernameexists': true };
    }

  }
}

