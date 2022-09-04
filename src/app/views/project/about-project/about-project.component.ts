import { Component, OnInit } from '@angular/core';

@Component({
  selector: "app-about-project",
  templateUrl: "./about-project.component.html",
  styleUrls: ["./about-project.component.scss"],
})
export class AboutProjectComponent implements OnInit {
  username: string;

  constructor() {}

  ngOnInit() {
    this.username = localStorage.getItem("username");
  }
}
