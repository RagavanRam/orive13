import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-project-progress",
  templateUrl: "./project-progress.component.html",
  styleUrls: ["./project-progress.component.scss"],
})
export class ProjectProgressComponent implements OnInit {
  username: string;

  constructor() {}

  ngOnInit() {
    this.username = localStorage.getItem("username");
  }
}
