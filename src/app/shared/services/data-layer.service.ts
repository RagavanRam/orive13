import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Utils } from '../utils';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class DataLayerService {

    constructor(
        private http: HttpClient
    ) { }


    getInvoices() {
        return this.http.get<any[]>('/api/invoices');
    }
    getInvoice(id) {
        return this.http.get<any[]>('/api/invoices/' + id);
    }
    saveInvoice(invoice) {
        if (invoice.id) {
            return this.http.put<any[]>('/api/invoices/' + invoice.id, invoice);
        } else {
            invoice.id = Utils.genId();
            return this.http.post<any[]>('/api/invoices/', invoice);
        }
    }
    deleteInvoice(id) {
        return this.http.delete<any[]>('/api/invoices/' + id);
    }
    getCountries() {
        return this.http.get<any[]>('/api/countries');
    }
    getProducts() {
        return this.http.get<any[]>('api/products');
    }
    getCities(forState?: any) {
        if (forState) {
            return this.http.get<any[]>(environment.backend + 'cities?filters[state][statename][$in]=' + forState);
        }
        else {
            return this.http.get<any[]>(environment.backend + 'cities');
        }
    }
    getStates(forState?: any) {
        if (forState) {
            return this.http.get<any[]>(environment.backend + 'states?filters[statename][$eq]=' + forState);
        }
        else {
            return this.http.get<any[]>(environment.backend + 'states');
        }
    }
    getStoreTypes() {
        return this.http.get<any[]>(environment.backend + 'store-types');
    }
    getBoardTypes() {
        return this.http.get<any[]>(environment.backend + 'board-types');
    }

    getBrands() {
        return this.http.get<any[]>(environment.backend + 'brands');
    }
    getusers(roleid: any) {
        return this.http.get<any[]>(environment.backend + 'userdetails?populate=*&filters[oriv_role][id][$eq]=' + roleid);
    }
    getAllusers() {
        return this.http.get<any[]>(environment.backend + 'userdetails?populate=*');
    }


    getAvailableInventory() {

    }
}

