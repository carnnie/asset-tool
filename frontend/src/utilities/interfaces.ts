export interface Hardware {
  'BRANCH NEW': string;
  Branch: string;
  'Commissioning date': string;
  Created: string;
  Department: string;
  Description: string;
  'INV No': string;
  'Inventory No': string;
  'Invoice No': string;
  Key: string;
  Model: string;
  Name: string;
  'Serial No': string;
  State: string;
  Location: string;
  Status: string;
  Store: string;
  Unit_Eq: string;
  Supplier: string;
  'Supplier Agreement': string;
  'Part No': string;
  'Seal No': string;
  'Maintenance Agreement': string;
  'run-on': string;
  'Planned Replace Date': string;
  Type: string;
  'Type RUS': string;
  'MAC address': string;
  'MAC address WI-FI': string;
  'Host Name': string;
  Updated: string;
  ITRequest: string;
  'Date of prophylaxis': string;
  'Inventory Date': string;
  'SAP number': string;
  'The cost': string;
  'Initial price': string;
  'Depreciation amount': string;
  'Residual value': string;
  'Invoice date': string;
  Service_Status: string;
  In_network: boolean;
  'Equip Type In Matrix': string;
  Pallet: string;
  User: string;
  HWUserUpdate: string;
  id: string;
  link: string;
}

export interface Store {
  [key: string]: string;
}

export interface marsParams {
  iql: string;
  itemType: string;
  orderField?: string;
}

export interface anyInsightObj {
  [key: string]: string;
}

export interface option {
  id: number;
  label: string;
  key?: string;
}

export interface anyOptionsState {
  [key: string]: Array<option>;
}

export interface editData {
  [key: string]: { [key: string]: string }; // IN-123456: {Unit_Eq: "Till_01", Location: "EDP Storage"}
}