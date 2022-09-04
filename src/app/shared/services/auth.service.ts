import { Injectable } from "@angular/core";
import { LocalStoreService } from "./local-store.service";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, Subject } from "rxjs";
import { NavigationService } from "./navigation.service";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  public currentUserSubject: BehaviorSubject<string> = new BehaviorSubject("");
  private currentUser: Observable<string>;

  email: BehaviorSubject<string> = new BehaviorSubject("");
  role = new BehaviorSubject("");
  userId: BehaviorSubject<string> = new BehaviorSubject("");
  username: BehaviorSubject<string> = new BehaviorSubject("");
  userstate: BehaviorSubject<string> = new BehaviorSubject("");
  projectEditMode: Subject<boolean> = new Subject()

  constructor(private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(
      localStorage.getItem('auth_token')
    );
    this.role = new BehaviorSubject(localStorage.getItem("groups"));
    this.currentUser = this.currentUserSubject.asObservable();
    this.userId = new BehaviorSubject(localStorage.getItem("userid"));
    this.username = new BehaviorSubject(localStorage.getItem("username"));
    this.userstate = new BehaviorSubject(localStorage.getItem("state"));

  }

  public get currentUserValue(): string {
    return this.currentUserSubject.getValue();
  }

  signin(data, group, state): Observable<any> {
    let obs = new Observable(obs => {
      localStorage.setItem("auth_token", data?.jwt);
      //console.log(localStorage.getItem('auth_token'));
      // localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", data?.user?.username);
      localStorage.setItem("groups", group);
      localStorage.setItem("userid", data?.user?.id);
      localStorage.setItem("state", state);
      this.currentUserSubject.next(localStorage.getItem('auth_token'));
      this.role.next(localStorage.getItem("groups"));
      this.userId.next(localStorage.getItem("userid"));
      this.username.next(localStorage.getItem("username"));
      this.userstate.next(localStorage.getItem("state"));
      obs.next(true);
      obs.complete;

    });
    return obs;
    // location.replace("/");
  }

  signout() {
    localStorage.clear();
    this.currentUserSubject.next("");
    this.role.next("");
    this.userId.next("");
    this.username.next("");
    location.replace("/#/sessions/signin");
  }
}
