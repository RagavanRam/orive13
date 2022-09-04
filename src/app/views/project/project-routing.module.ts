import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutProjectComponent } from "./about-project/about-project.component";
import { ProjectStoresComponent } from "./project-stores/project-stores.component";
import { ProjectProgressComponent } from './project-progress/project-progress.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { TasksComponent } from './tasks/tasks.component';
import { CreatetaskComponent } from './create-tasks/createtask.component';

const routes: Routes = [
  {
    path: "progress",
    component: ProjectProgressComponent,
  },
  {
    path: "stores",
    component: ProjectStoresComponent,
  },
  {
    path: "about",
    component: AboutProjectComponent,
  },
  {
    path: "list",
    component: ProjectListComponent,
  },
  {
    path: "createproject",
    component: ProjectCreateComponent,
  }, {
    path: "tasks",
    component: TasksComponent,
  },
  {
    path: "createtask",
    component: CreatetaskComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
