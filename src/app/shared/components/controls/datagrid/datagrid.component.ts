import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { Inventory } from 'src/app/shared/models/inventory';

@Component({
  selector: 'app-datagrid',
  templateUrl: './datagrid.component.html',
  styleUrls: ['./datagrid.component.scss']
})
export class DatagridComponent implements OnInit {
  pageSize = 10;
  page = 1;
  statusValue = '';
  isEdit = false;
  @Input() list: Inventory[] = [];
  @Input() filterfields: any[] = [];
  @Input() headers: any[] = [];
  @Input() fieldnames: any[] = [];
  @Input() multiselect: boolean;
  @Input() showDelete: boolean;
  @Input() disable: boolean;
  @Output() itemSelected = new EventEmitter<string>();
  @Output() itemDeSelected = new EventEmitter<string>();
  @Output() selectedAll = new EventEmitter<any[]>();
  @Output() saveClicked = new EventEmitter<string>();
  @Output() deleteClicked = new EventEmitter<string>();
  @Output() statusChange = new EventEmitter<string>();
  cities: city[] = [];
  states: any[] = [];
  pincodes: any[] = [];
  loading: any;
  selectedCity: string;
  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.disable) {
      this.disable = changes.disable.currentValue;
    }
    this.authService.projectEditMode.subscribe(res => {
      this.isEdit = res;
    })
    // 
  }
  ngOnInit(): void {
    //console.log(this.list);
  }

  filter(keyword: any) {

  }
  onRowSelect(event) {
    this.itemSelected.emit(event.data);
  }
  onRowUnselect(event) {
    this.itemDeSelected.emit(event.data);
  }
  selectAllRows(event: any) {
    this.selectedAll.emit(this.list);
    //this.selectedConfirmations = this.confirmations;
  }
  saveStores() {
    this.saveClicked.emit();
  }
  removeStore(event) {
    console.log(event);
    this.deleteClicked.emit(event);
  }
  status(event) {
    // console.log(event);
    this.statusChange.emit(event);
  }
}

export interface city {
  id: string;
  cityname: string;
}

