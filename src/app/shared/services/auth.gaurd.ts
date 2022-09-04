import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";
import { AuthService } from "./auth.service";

@Injectable({
  providedIn: "root",
})
export class AuthGaurd implements CanActivate {
  exp: Date = new Date();
  currentUser = "";
  constructor(private router: Router, private auth: AuthService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    this.currentUser = localStorage.getItem("auth_token");
    if (this.currentUser) {
      const today = new Date();
      this.exp = new Date(parseJwt(this.currentUser, "exp"));
      const days_before_expiry = 7;
      const days_with_buffer = this.exp.setDate(today.getDate() + days_before_expiry);
      if (this.isTokenExpired(this.currentUser)) {
        localStorage.clear();
        this.currentUser = "";
        return false;
      }
      return true;
    } else {
      this.router.navigateByUrl("/sessions/signin");
    }
  }

  isTokenExpired(token) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }

}

function parseJwt(token: string | null, req: string): string {
  const base64Url = token?.split(".")[1];
  const base64 = base64Url?.replace(/-/g, "+").replace(/_/g, "/");
  if (base64) {
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    const obj = JSON.parse(jsonPayload);
    return obj[req];
  }
  return "";
}
