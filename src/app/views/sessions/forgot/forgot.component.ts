import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { environment } from 'src/environments/environment';

@Component({
  selector: "app-forgot",
  templateUrl: "./forgot.component.html",
  styleUrls: ["./forgot.component.scss"],
  animations: [SharedAnimations],
})
export class ForgotComponent implements OnInit {
  alertType: string;
  alertText: string;
  forgotPassword: FormGroup;
  email = new FormControl(
    "",
    Validators.compose([Validators.email, Validators.required])
  );
  oldPassword = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);
  newPassword = new FormControl("", [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(30),
  ]);

  constructor(
    private http: HttpClient,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.forgotPassword = fb.group({
      email: this.email,
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    });
  }

  ngOnInit() {}

  forgot() {
    const body = {
      email: this.email.value.toLowerCase(),
      old_password: this.oldPassword.value,
      new_password: this.newPassword.value,
    };
    if (body.email) {
      this.http
        .patch(environment.backend + "accounts/change-password", body)
        .subscribe(
          (data: any) => {
            if (data) {
              this.toastr.success("Password reset Successful!", "Success!", {
                timeOut: 3000,
              });
              this.alertType = "Success";
              this.alertText = data?.message;
              this.router.navigateByUrl('/sessions/login')
            }
          },
          (err) => {
            console.log(err);
            this.toastr.error(err?.error?.message, "Error while login!", {
              timeOut: 3000,
            });
            this.alertType = "Error";
            this.alertText = err?.error?.message;
            this.forgotPassword.reset();
          }
        );
    }
  }
}
