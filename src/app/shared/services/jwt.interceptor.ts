import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { getCsrfToken } from './cookie';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(
    private authenticationService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {

    const currentUser = this.authenticationService.currentUserValue;
    const isLoggedIn = currentUser;
    const isApiUrl = request.url.startsWith(environment.backend);
    const loading = document.getElementById("loading");
    loading!.style.display = "none";
    //console.log(currentUser);
    if (currentUser) {
      if (request.body instanceof FormData) {
        //console.log("formdata");
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${currentUser}`
          },
        });
      } else {
        //console.log("else");
        request = request.clone({
          setHeaders: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser}`,
          },
        });
      }
    } else {
      //console.log("no auth token");
      request = request.clone({
        setHeaders: {
          "Content-Type": "application/json",
        },
      });
    }
    if (isApiUrl) {
      loading!.style.display = "block";
    }
    return next.handle(request).pipe(
      tap((evt) => {
        if (evt instanceof HttpResponse) {
          loading!.style.display = "none";
        }
      }),
      catchError((err: any) => {
        if (err instanceof HttpErrorResponse) {
          loading!.style.display = "none";
          switch (err.status) {
            case 0:
              this.toastr.success("Backend connection error!!", "Error!", {
                timeOut: 8000,
              });
              break;
            case 401: //unauthorized
              localStorage.clear();
              location.replace("/#/sessions/signin");
              break;
            case 404:
              location.replace("/others/404");
              break;
            case 400:
              this.toastr.error("Invalid username or password!!", "Error!", {
                timeOut: 8000,
              });
              break;
            default:
              if (err?.error) {
                let message = ""
                typeof err?.error?.message === "object"
                  ? (Object.keys(err?.error?.message).forEach(
                    (keys) => message = err?.error?.message[keys][0]
                  ))
                  : (message = err?.error?.message);
                this.toastr.error(err?.error?.message, "Error!", {
                  timeOut: 8000,
                });
              }
          }
        }
        return of(err);
      })
    );
  }
}
