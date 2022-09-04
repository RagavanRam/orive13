import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './project-routing.module';
import { AboutProjectComponent } from "./about-project/about-project.component";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectStoresComponent } from "./project-stores/project-stores.component";
import { ProjectProgressComponent } from './project-progress/project-progress.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TasksComponent } from './tasks/tasks.component';
import { SharedComponentsModule } from '../../shared/components/shared-components.module'
import { CreatetaskComponent } from './create-tasks/createtask.component';
import { RecceDesignModule } from '../../shared/components/recce-design/recce-design.module';
@NgModule({
  imports: [FormsModule, ReactiveFormsModule, CommonModule, NgbModule, PagesRoutingModule, NgxPaginationModule, SharedComponentsModule, RecceDesignModule],
  declarations: [
    AboutProjectComponent,
    ProjectStoresComponent,
    ProjectProgressComponent,
    ProjectListComponent,
    ProjectCreateComponent,
    TasksComponent,
    CreatetaskComponent,
  ],
})
export class ProjectModule { }
