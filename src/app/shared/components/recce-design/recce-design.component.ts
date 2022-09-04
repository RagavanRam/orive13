import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-recce-design',
  templateUrl: './recce-design.component.html',
  styleUrls: ['./recce-design.component.scss']
})
export class RecceDesignComponent implements OnInit {
  @Input() item: any;

  constructor() { }

  ngOnInit(): void {
  }

}
