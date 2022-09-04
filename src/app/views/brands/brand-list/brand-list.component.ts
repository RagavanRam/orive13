import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-brand-list',
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.scss']
})
export class BrandListComponent implements OnInit {
  @ViewChild("search") search!: ElementRef;
  brands: any = []
  url: string = '?populate=*&sort[0]=updatedAt%3Adesc'

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getBrands();
  }

  getBrands() {
    this.http.get(environment.backend + 'brands' + this.url).subscribe((res: any) => {
      if (res.data) {
        this.brands = res.data;
        console.log(this.brands);
      }
    })
  }

  searchStore() {
    let filter_url = this.url + '&filters[$or][0][brandname][$contains]=' + this.search.nativeElement.value
    this.http.get(environment.backend + 'brands' + filter_url).subscribe((res: any) => {
      if (res.data) {
        this.brands = res.data;
      }
    })
  }

  updateBrandDetails(id: number) {

  }

}
