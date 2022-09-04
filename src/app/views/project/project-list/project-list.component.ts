import { Component, OnInit } from '@angular/core';
import { HttpClient, JsonpClientBackend } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit {
  projects: any[] = [];
  pageSize = 10;
  page = 1;
  projectLimit = 100;
  projectTotel: any;
  dataPageLimit = 1;
  constructor(private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.loadInventoryList();
  }

  projectPageChange() {
    if (this.projectTotel > this.projectLimit) {
      if (this.page == this.projectLimit) {
        this.projectLimit = this.projectLimit + 100;
        this.dataPageLimit = this.dataPageLimit + 1;
        let url = `projects?populate=*&sort[0]=updatedAt%3Adesc&pagination[limit]=100&pagination[page]=` + this.dataPageLimit;
        if (this.authService.role?.getValue() == 'fieldexecutive') {
          url += '&filters[assignedto][id][$eq]=' + this.authService.userId.getValue();
        } else {
          url += '&filters[createdby][id][$eq]=' + this.authService.userId.getValue();
        }
        this.http
        .get(environment.backend + url)
        .subscribe((data: any) => {
          if (data) {
            this.projects.push(...data.data);
          }
        });
      }
    }
  }

  loadInventoryList() {
    //console.log("load Inventory list");
    let url = `projects?populate=*&sort[0]=updatedAt%3Adesc&pagination[limit]=100`;
    // console.log(this.authService.role.getValue());
    if (this.authService.role?.getValue() == 'fieldexecutive') {
      url += '&filters[assignedto][id][$eq]=' + this.authService.userId.getValue();
    } else {
      url += '&filters[createdby][id][$eq]=' + this.authService.userId.getValue();
    }

    this.http
      .get(environment.backend + url)
      .subscribe((data: any) => {
        if (data) {
          this.projects = data.data;
          //console.log(this.stores);
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
        }
      });
  }
  filter(keyword: any) {

  }
  navigate() {
    this.router.navigateByUrl("/projects/createproject");
  }
  navigateProjectEdit(id: any) {
    this.router.navigateByUrl("projects/createproject?id=" + id);
  }
}
