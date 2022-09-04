import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = environment.name;

  constructor(private router: Router) {

    router.events.forEach((event) => {
      //console.log("route change");

      if (event instanceof NavigationStart) {
        // console.log(event['url']);
      }
    });
  }
}
