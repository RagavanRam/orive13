import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { HttpClient } from '@angular/common/http';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { environment } from 'src/environments/environment';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SharedAnimations } from 'src/app/shared/animations/shared-animations';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as html2pdf from 'html2pdf.js'
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: "app-store-list",
  templateUrl: "./store-list.component.html",
  styleUrls: ["./store-list.component.scss"],
  animations: [SharedAnimations]
})
export class StoreListComponent implements OnInit {
  @ViewChild('content', { static: false }) el: ElementRef | any;
  selectedList = []
  storeLimit = 100;
  storeTotel: any;
  dataPageLimit = 1;
  // pdfData: any = {
  //   storeName: '',
  //   storeContact: {
  //     mobile: '',
  //     phone: ''
  //   },
  //   storeAddress: '',
  //   boardSize: '',
  //   geoLocation: '',
  //   date: '',
  //   images: {
  //     front: {
  //       src: '',
  //       geolocation: ''
  //     },
  //     frontCloseUp: {
  //       src: '',
  //       geolocation: ''
  //     },
  //     left: {
  //       src: '',
  //       geolocation: ''
  //     },
  //     right: {
  //       src: '',
  //       geolocation: ''
  //     }
  //   }
  // };
  pdfData: any = []
  viewMode: 'list' | 'grid' = 'list';
  allSelected: boolean = false;
  pageSize = 10;
  page = 1;
  timer: any;
  stores: any[] = [];
  store: any;
  @ViewChild("search") search!: ElementRef;
  role: string;
  env = environment;
  searchKeyword: any = "";
  filterStatus: any;
  availability: any;
  comments: any = "";
  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private router: Router,
    private modalService: NgbModal,
    public authService: AuthService,
    private datePipe: DatePipe,
    private route: ActivatedRoute
  ) {
    this.route.params.subscribe((paramsMap) => {
      if (paramsMap.status == "occupied" || paramsMap.status == "available" || paramsMap.status == "booked") {
        this.availability = paramsMap.status;
      } else {
        this.filterStatus = paramsMap.status;
      }
    });
  }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.role = localStorage.getItem("groups");
    this.loadInventoryList();
    this.selectAllRows(this.allSelected);
    console.log(this.allSelected)
  }

  loadInventoryList() {
    //console.log("load Inventory list");
    let filterIndex = 0;
    let url = `inventories?populate=*&sort[0]=updatedAt%3Adesc&pagination[limit]=100`;
    // console.log(this.authService.role.getValue());
    if (this.authService.role?.getValue() == 'fieldexecutive') {
      url += '&filters[createdbyuser][id][$eq][' + filterIndex + ']=' + this.authService.userId.getValue();
      filterIndex = filterIndex + 1;
    }
    if (this.filterStatus) {
      url += '&filters[status][statusname][$eq][' + filterIndex + ']=' + this.filterStatus;
    }
    else if (this.availability) {
      url += '&filters[availability][$eq][' + filterIndex + ']=' + this.availability;
      filterIndex = filterIndex + 1;
      //url += '&filters[status][statusname][$eq][' + filterIndex + ']=' + 'Approved';
    }

    this.http
      .get(environment.backend + url)
      .subscribe((data: any) => {
        if (data) {
          this.stores = data.data;
          this.storeTotel = data?.meta?.pagination?.total
          console.log(this.storeTotel);
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
        }
      });
  }
  filter(status: any): void {
    clearTimeout(this.timer);
    this.selectedList = []
    var filter = "";
    var regex = /\d+/g;
    var string = this.search.nativeElement.value;
    var matches = string.match(regex);
    if (matches) {
      filter += "&filters[pincode][$eq]=" + string;
    }
    else if (string.length > 0) {
      filter += "&filters[$or][0][inventoryname][$contains]=" + this.search.nativeElement.value;
      filter += "&filters[$or][1][city][cityname][$contains]=" + this.search.nativeElement.value;
      filter += "&filters[$or][2][state][statename][$contains]=" + this.search.nativeElement.value;
    }
    if (this.authService.role.value == 'fieldexecutive') {
      filter += '&filters[createdbyuser][id][$eq]=' + this.authService.userId.value
    }
    if (status.length > 0 && this.filterStatus == null) {
      filter += "&filters[status][statusname][$eq]=" + status;
    }// apply route filter
    else if (this.filterStatus && this.filterStatus.length > 0) {
      filter += "&filters[status][statusname][$eq]=" + this.filterStatus;
    } else if (this.availability && this.availability.length > 0) {
      filter += "&filters[availability][$eq]=" + this.availability;
    }
    console.log(filter);
    this.timer = setTimeout(() => {
      this.http
        .get(
          environment.backend +
          `inventories?populate=*` + filter
        )
        .subscribe((data: any) => {
          if (data) {
            this.toastr.success(data.message, "Success!", {
              timeOut: 3000,
            });
            this.stores = data.data;
            console.log(this.stores);
          }
        });
    }, 1000);
  }

  navigate(url, id, name) {
    this.router.navigateByUrl(
      "/inventory/" + url + "?id=" + id + "&name=" + name
    );
  }


  storeDetails(id: any) {

    this.router.navigateByUrl("inventory/details?id=" + id);
    /*this.http
      .get(environment.backend + `stores/id=${id}`)
      .subscribe((data: any) => {
        if (data) {
          this.toastr.success(data.message, "Success!", {
            timeOut: 3000,
          });
          this.store = data.data;
        }
      });
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
      .result.then(
        (result) => {
          console.log(result);
        },
        (reason) => {
          console.log("Err!", reason);
        }
      );*/
  }

  editStore(id: string) {
    localStorage.setItem("store_id", id);
    this.router.navigateByUrl("inventory/edit?id=" + id);
    this.modalService.dismissAll();
  }
  //not used
  pageChangeEvent(e: any) {
    this.page = e;
    console.log("page change");
    this.selectAllRows(this.allSelected);
  }

  selectAll(e) {
    this.allSelected = e.currentTarget.checked;
    this.selectAllRows(e.currentTarget.checked);
    /*this.stores = this.stores.map(p => {
      p.isselected = this.allSelected;
      return p;
    });*/
    if (this.allSelected) {
      this.selectedList = this.stores;
    } else {
      this.selectedList = [];
    }
    console.log(this.allSelected);
    this.createPdfData();
  }

  selectAllRows(selected: boolean) {
    var checkboxes = document.getElementsByTagName('input');
    if (selected) {
      console.log("checkall");
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
          console.log("checkallc");
          checkboxes[i].checked = true;
        }
      }
    } else {
      for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].type == 'checkbox') {
          checkboxes[i].checked = false;
        }
      }
    }
  }

  selected(id: any, store: any) {
    let isHere = false
    if (this.selectedList) {
      for (let item of this.selectedList) {
        if (store.id === item.id) {
          isHere = true;
          this.selectedList = this.selectedList.filter(file => {
            return file.id !== store.id;
          })
        }
      }
    }
    if (!isHere) {
      this.selectedList.push(store);
    }
    this.createPdfData();
  }
  approveInventory(store: any, storeid: any, statusid: any) {
    var body = {};
    //approve 
    if (statusid == 2) {
      var currentday = new Date();
      const refno = store.attributes?.city?.data?.attributes?.category + "-" + store?.attributes?.city?.data?.attributes?.shortcode + "-" + store?.attributes?.storetype?.data?.attributes?.shortcode + "-" + store?.attributes?.pincode + "-" + this.datePipe.transform(currentday, "yyyyMMdd") + storeid;
      body = {
        data: {
          status: statusid, refno: refno, availability: "available"
        }
      };//rework
    } else if (statusid == 3) {
      body = {
        data: { status: statusid, comments: [{ description: this.comments }] }
      };
    }//other statuses
    else {
      body = {
        data: { status: statusid }
      };
    }

    this.http
      .put(environment.backend + `inventories/` + storeid, body)
      .subscribe((data: any) => {
        if (data) {
          this.toastr.success(data.message, "Status Updated Successfully!", {
            timeOut: 3000,
          });
          this.loadInventoryList();
        }
      });
  }

  reworkInventory() {
    console.log(this.comments);
    if (this.comments == "" || this.comments.length == 0) {
      this.toastr.error("Please enter comments for rework", "", {
        timeOut: 3000,
      });
      return;
    }
    this.approveInventory(this.store, this.store.id, 3);
    this.modalService.dismissAll();
  }

  // generateRecce() {
  //   this.toastr.success("Recce Generation Started", "Success!", {
  //     timeOut: 3000,
  //   });

  //   //"env.backendfileURI + item?.filepath attributes.storepics
  //   let DATA = "<html><body>";
  //   var doc = new jsPDF();
  //   let i = 1;
  //   for (let store of this.stores) {
  //     if (store.attributes.status?.data?.attributes?.statusname == "Approved") {
  //       doc.setFontSize(10);
  //       doc.setDrawColor(0);
  //       doc.setFillColor(64, 64, 64);
  //       doc.rect(0, 0, 210, 297, 'FD');
  //       doc.setTextColor(245, 245, 245);
  //     }
  //     doc.text(store.attributes.refno, 10, 10);
  //     doc.text(store.attributes.storename, 10, 15);
  //     doc.text(store.attributes.storetype.data.attributes.typename, 10, 20);
  //     doc.text(String(store.attributes.latitude) + " / " + String(store.attributes.longitude), 10, 25);
  //     doc.text(store.attributes.doorno + " " + store.attributes.streetroad, 10, 30);
  //     doc.text(store.attributes.city.data.attributes.cityname + " " + store.attributes.state.data.attributes.statename + " " + String(store.attributes.pincode), 10, 35);
  //     //var body = "<h1>" + store.attributes.refno + "</h1>";

  //     for (let img of store.attributes.storepics) {
  //       let myimg = this.env.backendfileURI + img?.filepath;

  //       doc.rect(8, 38, 154, 104, 'FD');
  //       doc.addImage(myimg, 'JPEG', 10, 40, 150, 100);
  //       doc.text(img.viewtype, 170, 100);

  //       doc.addPage();
  //       doc.setFontSize(10);
  //       doc.setDrawColor(0);
  //       doc.setFillColor(64, 64, 64);
  //       doc.rect(0, 0, 210, 297, 'FD');
  //       doc.setTextColor(245, 245, 245);


  //       //body += "<img src='" + this.env.backendfileURI + img?.filepath + "' style = 'width: 100%; display: block;'/>"
  //     }
  //     let boardImg = this.env.backendfileURI + store.attributes?.boards?.filepath;
  //     doc.rect(8, 38, 154, 104, 'FD');
  //     doc.addImage(boardImg, 'JPEG', 10, 40, 150, 100);
  //     doc.text("Board", 170, 90);
  //     doc.text(String(store.attributes.boards.width) + "X" + String(store.attributes.boards.height) + " ft", 170, 100);
  //     if (i < this.stores.length) {
  //       doc.addPage();
  //     }
  //     i = i + 1;
  //     //body += "<img src=" + this.env.backendfileURI + store.attributes?.boards?.filepath + "style = 'width: 100%; display: block;'/>"

  //     //DATA += body;
  //   }

  //   // DATA += "</body></html>";
  //   //console.log(DATA);
  //   var opt = {
  //     margin: [10, 0, 0, 0],
  //     filename: "reccee.pdf",
  //     image: { type: 'jpeg', quality: 0.98 },
  //     html2canvas: { dpi: 192, scale: 2, letterRendering: true },
  //     jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' },
  //     pageBreak: { mode: 'css', before: '#nextpage1' }
  //   };
  //   doc.save("recce1212.pdf");
  //   this.toastr.success("Recce Generation Completed", "Success!", {
  //     timeOut: 3000,
  //   });
  //   // html2pdf().from(DATA).set(opt).save();
  // }

  pageChane() {
    console.log(this.page);
    if (this.storeTotel > this.storeLimit) {
      if (this.page == this.storeLimit) {
        this.storeLimit = this.storeLimit + 100;
        this.dataPageLimit = this.dataPageLimit + 1;
        let filterIndex = 0;
        let url = `inventories?populate=*&sort[0]=updatedAt%3Adesc&pagination[limit]=100&pagination[page]=` + this.dataPageLimit;
        if (this.authService.role?.getValue() == 'fieldexecutive') {
          url += '&filters[createdbyuser][id][$eq][' + filterIndex + ']=' + this.authService.userId.getValue();
          filterIndex = filterIndex + 1;
        }
        if (this.filterStatus) {
          url += '&filters[status][statusname][$eq][' + filterIndex + ']=' + this.filterStatus;
        }
        else if (this.availability) {
          url += '&filters[availability][$eq][' + filterIndex + ']=' + this.availability;
          filterIndex = filterIndex + 1;
        }

        this.http
        .get(environment.backend + url)
        .subscribe((data: any) => {
          if (data) {
            this.stores.push(...data.data);
          }
        });
      }
    }
  }

  createPdfData() {
    let pdfDataArray = []
    for (let item of this.selectedList) {
      var invs = []
      if (item.attributes.inventorytype === 'society') {
        var imgData = []
        for (let inv of item.attributes.invpics) {
          let item = {
            imgPath: inv.filepath? this.env.backendfileURI + inv?.filepath: 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
            imgTitle: `Phase No: ${inv.metadata.phaseno + 1} / Block No : ${inv.metadata.blockno + 1}`,
            imgGeo: inv?.latitude && inv?.longitude ? `https://maps.google.com/?q=${inv?.latitude},${inv?.longitude}` : ''
          }
          imgData.push(item);
          if ((imgData).length == 4) {
            invs.push(imgData);
            imgData = [];
          }
        }
        if ((imgData).length) {
          invs.push(imgData);
        }
      }else {
        let data = [
          {
            imgTitle: 'Front View',
            imgPath: item.attributes.invpics[0]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[0]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
            imgGeo: item.attributes.invpics[0]?.latitude && item.attributes.invpics[0]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[0]?.latitude},${item.attributes.invpics[0]?.longitude}` : ''
          },
          {
            imgTitle: 'Front CloseUp View',
            imgPath: item.attributes.invpics[1]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[1]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
            imgGeo: item.attributes.invpics[1]?.latitude && item.attributes.invpics[1]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[1]?.latitude},${item.attributes.invpics[1]?.longitude}` : ''
          },
          {
            imgTitle: 'Left Side View',
            imgPath: item.attributes.invpics[2]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[2]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
            imgGeo: item.attributes.invpics[2]?.latitude && item.attributes.invpics[2]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[2]?.latitude},${item.attributes.invpics[2]?.longitude}` : ''
          },
          {
            imgTitle: 'Right Side View',
            imgPath: item.attributes.invpics[3]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[3]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
            imgGeo: item.attributes.invpics[3]?.latitude && item.attributes.invpics[3]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[3]?.latitude},${item.attributes.invpics[3]?.longitude}` : ''
          }
        ]
        invs.push(data);
      }
      console.log(invs);
      let data = {
        inventorytype: item.attributes.inventorytype,
        inventoryname: item.attributes?.inventoryname,
        pdfType: 'Recce',
        inventoryContact: {
          contactno_1: +item.attributes.contactno_1 ? item.attributes.contactno_1 : '-',
          contactno_2: +item.attributes.contactno_2 ? item.attributes.contactno_2 : '-'
        },
        inventoryAddress: `${item.attributes.doorno}, ${item.attributes.streetroad}, ${item.attributes.address}, ${item.attributes.city?.data?.attributes?.cityname}, ${item.attributes.state?.data?.attributes?.statename} - ${item.attributes.pincode}`,
        boardSize: item.attributes.boards?.width && item.attributes.boards?.height? `${item.attributes.boards?.width} x ${item.attributes.boards?.height} ft`: 'Board Size Not Available',
        societyType: item.attributes?.societytype? item.attributes?.societytype: '',
        geoLocation: item.attributes.latitude && item.attributes.longitude ? `https://maps.google.com/?q=${item.attributes.latitude},${item.attributes.longitude}` : 'Location Not Available',
        date: `${new Date(item.attributes.createdAt).getDate()}-${new Date(item.attributes.createdAt).getMonth()}-${new Date(item.attributes.createdAt).getFullYear()}, ${new Date(item.attributes.createdAt).getHours()}:${new Date(item.attributes.createdAt).getMinutes()}`,
        // images: {
        //   front: {
        //     src: item.attributes.invpics[0]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[0]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
        //     geolocation: item.attributes.invpics[0]?.latitude && item.attributes.invpics[0]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[0]?.latitude},${item.attributes.invpics[0]?.longitude}` : ''
        //   },
        //   frontCloseUp: {
        //     src: item.attributes.invpics[1]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[1]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
        //     geolocation: item.attributes.invpics[1]?.latitude && item.attributes.invpics[1]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[1]?.latitude},${item.attributes.invpics[1]?.longitude}` : ''
        //   },
        //   left: {
        //     src: item.attributes.invpics[2]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[2]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
        //     geolocation: item.attributes.invpics[2]?.latitude && item.attributes.invpics[2]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[2]?.latitude},${item.attributes.invpics[2]?.longitude}` : ''
        //   },
        //   right: {
        //     src: item.attributes.invpics[3]?.filepath ? this.env.backendfileURI + item.attributes?.invpics[3]?.filepath : 'https://media.istockphoto.com/vectors/default-image-icon-vector-missing-picture-page-for-website-design-or-vector-id1357365823?k=20&m=1357365823&s=612x612&w=0&h=ZH0MQpeUoSHM3G2AWzc8KkGYRg4uP_kuu0Za8GFxdFc=',
        //     geolocation: item.attributes.invpics[3]?.latitude && item.attributes.invpics[3]?.longitude ? `https://maps.google.com/?q=${item.attributes.invpics[3]?.latitude},${item.attributes.invpics[3]?.longitude}` : ''
        //   }
        // }
        images: invs
      }
      pdfDataArray.push(data);
    }
    this.pdfData = pdfDataArray
    console.log(pdfDataArray)
  }

  generateRecce() {
    if (this.selectedList.length) {
      this.toastr.success("Recce Generation Started", "Success!", {
        timeOut: 3000,
      });
      let doc = new jsPDF('l', 'px', [960, 768]);
      doc.html(this.el.nativeElement, {
        callback: doc => {
          window.open(URL.createObjectURL(doc.output('blob')))
          this.toastr.success("Recce Generation Completed", "Success!", {
            timeOut: 3000,
          });
          // pdf.save("demo.pdf");
        }
      })
    } else {
      this.toastr.error("Selected Inventory Data Empty", "Error!", {
        timeOut: 3000,
      });
    }
  }
  openModal(content, store: any) {
    this.store = store;
    this.modalService
      .open(content, { ariaLabelledBy: "modal-basic-title" })
      .result.then(
        (result) => {
          console.log(result);
        },
        (reason) => {
          console.log("Err!", reason);
        }
      );
  }
  downloadFile(path: any) {
    console.log(path);
    window.open(this.env.backendfileURI + path);
  }
}
