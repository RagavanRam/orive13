import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from "@angular/forms";
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from "src/environments/environment";
import { AuthService } from '../../../shared/services/auth.service';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "app-signin",
  templateUrl: "./signin.component.html",
  styleUrls: ["./signin.component.scss"],
  animations: [SharedAnimations],
})
export class SigninComponent implements OnInit {
  alertType: string;
  alertText: string;
  login: FormGroup;
  phone = new FormControl(
    "",
    Validators.compose([Validators.maxLength(11), Validators.minLength(8), Validators.required])
  );
  password = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);
  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.login = fb.group({
      phone: this.phone,
      password: this.password,
    });
  }

  ngOnInit() {
    this.alertType = "";
    this.alertText = "";
  }

  signin() {

    const body = {
      identifier: this.phone.value + "",
      password: this.password.value,
    };
    if (body.identifier) {
      this.http.post(environment.backend + "auth/local", body).subscribe(
        (data: any) => {
          let currentUser = data.jwt;
          const headers = { 'Authorization': `Bearer ${currentUser}` }
          this.http.get(environment.backend + "userdetails?populate=*&filters[users_permissions_user][id][$eq]=" + data.user.id, { 'headers': headers }).subscribe(
            (userdetails: any) => {
              if (data) {
                this.toastr.success("Login Successful!", "Success!", {
                  timeOut: 3000,
                });
                /*localStorage.setItem("auth_token", data?.jwt);
                //console.log(localStorage.getItem('auth_token'));
                // localStorage.setItem("refresh_token", data.refresh);
                localStorage.setItem("username", data?.user?.username);
                localStorage.setItem("groups", userdetails.data[0].attributes.oriv_role.data.attributes.rolename);
                localStorage.setItem("userid", data?.user?.id);
                this.router.navigateByUrl("/");*/

                this.auth.signin(data, userdetails.data[0].attributes.oriv_role.data.attributes.rolename, userdetails.data[0].attributes?.state?.data?.attributes?.statename).subscribe(completed => {
                  this.router.navigateByUrl("/");
                  this.alertType = "Success";
                  this.alertText = data?.data?.message;
                });

              }

            });

        },
        (err) => {
          this.toastr.error(err?.error?.message, "Error while login!", {
            timeOut: 3000,
          });
          this.alertType = "Error";
          this.alertText = err?.error?.message;
          this.login.reset();
        }
      );
    }
  }

  closeAlert() {
    this.alertText = "";
    this.alertType = "";
  }
}


