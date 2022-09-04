export class Inventory {
    id: any;
    storename: any;
    storeRefId: any;
    doorno: any;
    streetroad: any;
    pincode: any;
    latitude: any;
    longitude: any;
    temprefno: any;
    ownername: any;
    mobileno: any;
    address: any;
    storetype: any;
    city: any;
    state: any;
    availability: any;
}
export class SubTask {
    id: any;
    store: any;
    storeInfo: any;
    status: any;
    type: any;
    updatedDate: any;
    isEditable: boolean;
    log: any[];

}

export enum ROLE {
    IRR_ADMIN = 1,
    SUPERVISOR = 2,
    SUPER_ADMIN = 3,
    FIELD_EXECUTIVE = 4,
    INSTALLATION = 5
}