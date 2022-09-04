import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.scss"],
  animations: [SharedAnimations],
})
export class SignupComponent implements OnInit {
  env = environment;
  register: FormGroup;
  alertType: string;
  alertText: string;
  email = new FormControl(
    "",
    Validators.compose([Validators.email, Validators.required])
  );
  password = new FormControl("", [
    Validators.required, Validators.minLength(6),
    Validators.maxLength(30),
  ]);
  username = new FormControl("", Validators.required);

  constructor(
    fb: FormBuilder,
    private http: HttpClient,
    private auth: AuthService,
    private toastr: ToastrService
  ) {
    this.register = fb.group({
      email: this.email,
      username: this.username,
      password: this.password,
    });
  }

  ngOnInit() {
    this.alertType = "";
    this.alertText = "";
  }

  onSubmit(): void {
    const body = {
      email: this.email.value.toLowerCase(),
      password: this.password.value,
      username: this.username.value,
    };
    this.http.post(environment.backend + "accounts/register", body).subscribe(
      (data: any) => {
        if (data) {
          this.toastr.success("Registration Successful!", "Success!", {
            timeOut: 3000,
          });
          this.auth.signin(data.jwt, "", "");
          this.alertType = "Success";
          this.alertText = "Registration Successful!";
        }
      },
      (err) => {
        console.log(err.error);
        if (err.error) {
          this.toastr.error(JSON.stringify(err?.error), "Error while registering!", {
            timeOut: 3000,
          });
          this.alertType = "Error";
          this.alertText = JSON.stringify(err?.error);
          this.register.reset(this.email.value);
        } else {
          this.alertType = "Error";
          this.alertText = err?.error;
        }
      }
    );
  }

  closeAlert() {
    this.alertText = "";
    this.alertType = "";
  }
}
