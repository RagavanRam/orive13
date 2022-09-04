import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-project-stores",
  templateUrl: "./project-stores.component.html",
  styleUrls: ["./project-stores.component.scss"],
})
export class ProjectStoresComponent implements OnInit {
  username: string;

  constructor() {}

  ngOnInit() {
    this.username = localStorage.getItem("username");
  }
}
