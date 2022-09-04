import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

export interface IMenuItem {
  id?: string;
  title?: string;
  description?: string;
  type: string;       // Possible values: link/dropDown/extLink
  name?: string;      // Used as display text for item and title for separator type
  state?: string;     // Router state
  icon?: string;      // Material icon name
  tooltip?: string;   // Tooltip text
  disabled?: boolean; // If true, item will not be appeared in sidenav.
  sub?: IChildItem[]; // Dropdown items
  badges?: IBadge[];
  active?: boolean;
}
export interface IChildItem {
  id?: string;
  parentId?: string;
  type?: string;
  name: string;       // Display text
  state?: string;     // Router state
  icon?: string;
  sub?: IChildItem[];
  active?: boolean;
}

interface IBadge {
  color: string;      // primary/accent/warn/hex color codes(#fff000)
  value: string;      // Display text
}

interface ISidebarState {
  sidenavOpen?: boolean;
  childnavOpen?: boolean;
}

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  public sidebarState: ISidebarState = {
    sidenavOpen: true,
    childnavOpen: false,
  };
  selectedItem: IMenuItem;
  defaultMenu: IMenuItem[] = [];
  role = this.authenticationService.role.getValue();

  constructor(private authenticationService: AuthService) {
    this.authenticationService.role.subscribe(val => {
      this.role = val;
      this.updateMenu();
    });
  }

  adminMenu: IMenuItem[] = [
    {
      name: "Dashboard",
      description: "Look at the overall trend of the projects",
      type: "dropDown",
      icon: "i-Bar-Chart",
      sub: [
        {
          icon: "i-Bar-Chart-2",
          name: "Dashboard",
          state: "/dashboard",
          type: "link",
        },
      ],
    },
    {
      name: "Inventory",
      // description: "List of all the inventories",
      type: "dropDown",
      icon: "i-Shop-4",
      sub: [
        {
          icon: "i-Right-2",
          name: "Pending",
          state: "/inventory/list/Pending",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Approved",
          state: "/inventory/list/Approved",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Rework",
          state: "/inventory/list/Rework",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Rejected",
          state: "/inventory/list/Rejected",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Occupied",
          state: "/inventory/list/occupied",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Available",
          state: "/inventory/list/available",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Blocked",
          state: "/inventory/list/blocked",
          type: "link",
        },
        {
          icon: "i-Shop-2",
          name: "All Inventories",
          state: "/inventory/list",
          type: "link",
        },
        {
          icon: "i-Shopping-Basket",
          name: "Create new inventory",
          state: "/inventory/create",
          type: "link",
        },
      ],
    },
    // {
    //   name: "My Projects",
    //   description: "Details about all the projects created",
    //   type: "dropDown",
    //   icon: "i-File-Horizontal-Text",
    //   sub: [
    //     {
    //       icon: "i-ID-3",
    //       name: "Active Projects",
    //       state: "/projects/list",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-File-Excel",
    //       name: "Export report",
    //       state: "/projects/report",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-Folder-Hide",
    //       name: "Archived projects",
    //       state: "/projects/archive",
    //       type: "link",
    //     },
    //   ],
    // },
    // {
    //   type: "dropDown",
    //   icon: "i-Windows-2",
    //   sub: [
    //     {
    //       icon: "i-Loading",
    //       name: "Progress",
    //       state: "/project/progress",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-Shop-4",
    //       name: "Stores",
    //       state: "/project/stores",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-Information",
    //       name: "About Project",
    //       state: "/project/about",
    //       type: "link",
    //     },
    //   ],
    // },
    /*{
      name: "Approvals",
      description: "",
      type: "dropDown",
      icon: "i-Globe",
      sub: [
        {
          icon: "i-File-Clipboard-Text--Image",
          name: "Review Inventory",
          state: "/admin/inventory",
          type: "link",
        },
      ],
    },*/
    {
      name: "Users",
      description: "User management",
      type: "dropDown",
      icon: "i-Add-UserStar",
      sub: [
        {
          icon: "i-Checked-User",
          name: "Active users",
          state: "/users/list",
          type: "link",
        },
        {
          icon: "i-Add",
          name: "Create new user",
          state: "/users/create",
          type: "link",
        },
      ],
    },
    {
      name: "Projects",
      // description: "List of all the inventories",
      type: "dropDown",
      icon: "i-Receipt-4",
      sub: [
        {
          icon: "i-ID-3",
          name: "Projects",
          state: "projects/list",
          type: "link",
        },
        {
          icon: "nav-icon i-File-Horizontal",
          name: "Create new Project",
          state: "/projects/createproject",
          type: "link",
        },
      ],
    },
    {
      name: "Brands",
      description: "Manage All Brands",
      type: "dropDown",
      icon: "i-Globe",
      sub: [
        {
          icon: "i-Folder-Cloud",
          name: "All Brands",
          state: "/brands",
          type: "link",
        },
      ],
    },
    {
      name: "Tasks",
      // description: "List of all the inventories",
      type: "dropDown",
      icon: "i-Check",
      sub: [
        {
          icon: "i-Letter-Sent",
          name: "My Tasks",
          state: "/projects/tasks",
          type: "link",
        }
        /*{
          icon: "i-Letter",
          name: "Create Tasks",
          state: "/projects/createtask",
          type: "link",
        },*/
      ],
    },
    /*{
      name: "Brands",
      // description: "List of all the inventories",
      type: "dropDown",
      icon: "i-Building",
      sub: [
        {
          icon: "i-MaleFemale",
          name: "Brands",
          state: "brands/list",
          type: "link",
        },
        {
          icon: "i-Add",
          name: "Create new brand",
          state: "/brands/create",
          type: "link",
        },
      ],
    },*/
  ];
  feMenu: IMenuItem[] = [
    {
      name: "Dashboard",
      description: "Look at the overall trend of the projects",
      type: "dropDown",
      icon: "i-Dashboard",
      sub: [
        {
          icon: "i-Bar-Chart-2",
          name: "Dashboard",
          state: "/dashboard",
          type: "link",
        },
      ],
    },
    {
      name: "Inventory",
      // description: "List of all the inventories",
      type: "dropDown",
      icon: "i-Shop-4",
      sub: [
        {
          icon: "i-Right-2",
          name: "Pending",
          state: "/inventory/list/Pending",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Approved",
          state: "/inventory/list/Approved",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Rework",
          state: "/inventory/list/Rework",
          type: "link",
        },
        {
          icon: "i-Right-2",
          name: "Rejected",
          state: "/inventory/list/Rejected",
          type: "link",
        },
        {
          icon: "i-Shop-2",
          name: "All Inventories",
          state: "/inventory/list",
          type: "link",
        },
        {
          icon: "i-Shopping-Basket",
          name: "Create new inventory",
          state: "/inventory/create",
          type: "link",
        },
      ],
    },
    {
      name: "Tasks",
      // description: "List of all the inventories",
      type: "dropDown",
      icon: "i-Check",
      sub: [
        {
          icon: "i-Letter-Sent",
          name: "My Tasks",
          state: "/projects/tasks",
          type: "link",
        },
      ],
    }
    // {
    //   name: "My Projects",
    //   description: "Details about all the projects created",
    //   type: "dropDown",
    //   icon: "i-File-Horizontal-Text",
    //   sub: [
    //     {
    //       icon: "i-ID-3",
    //       name: "Active Projects",
    //       state: "/projects/list",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-File-Excel",
    //       name: "Export report",
    //       state: "/projects/report",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-Folder-Hide",
    //       name: "Archived projects",
    //       state: "/projects/archive",
    //       type: "link",
    //     },
    //   ],
    // },
    // {
    //   type: "dropDown",
    //   icon: "i-Windows-2",
    //   sub: [
    //     {
    //       icon: "i-Loading",
    //       name: "Progress",
    //       state: "/project/progress",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-Shop-4",
    //       name: "Stores",
    //       state: "/project/stores",
    //       type: "link",
    //     },
    //     {
    //       icon: "i-Information",
    //       name: "About Project",
    //       state: "/project/about",
    //       type: "link",
    //     },
    //   ],
    // },
  ];

  //role = localStorage.getItem("groups");
  menuItems = new BehaviorSubject<IMenuItem[]>(
    this.role == "irradmin" ? this.adminMenu : this.feMenu
  );
  // navigation component has subscribed to this Observable
  menuItems$ = this.menuItems.asObservable();

  // You can customize this method to supply different menu for
  // different user type.
  // publishNavigationChange(menuType: string) {
  //   switch (this.role[0]) {
  //     case 'fieldexecutive':
  //       this.menuItems.next(this.userMenu);
  //       break;
  //     case 'irradmin':
  //       this.menuItems.next(this.adminMenu);
  //       break;
  //     default:
  //       this.menuItems.next(this.defaultMenu);
  //   }
  // }
  updateMenu() {
    this.menuItems.next(
      this.role == "irradmin" ? this.adminMenu : this.feMenu
    );
  }
}
