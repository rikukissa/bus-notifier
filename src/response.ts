

export interface IPaging {
  startIndex: number;
  pageSize: number;
  moreData: boolean;
}

export interface IHeaders {
  paging: IPaging;
}

export interface IData {
  headers: IHeaders;
}

export interface IVehicleLocation {
  longitude: string;
  latitude: string;
}

export interface IVehicleLocationAtStop {
  longitude: string;
  latitude: string;
}

export interface ICall {
  vehicleAtStop: boolean;
  expectedArrivalTime: Date;
  expectedDepartureTime: Date;
  aimedArrivalTime: Date;
  aimedDepartureTime: Date;
  departureStatus: string;
  arrivalStatus: string;
  visitNumber: string;
  vehicleLocationAtStop: IVehicleLocationAtStop;
}

export interface IBus {
  lineRef: string;
  directionRef: string;
  vehicleLocation: IVehicleLocation;
  operatorRef: string;
  bearing: string;
  delay: string;
  vehicleRef: string;
  journeyPatternRef: string;
  originShortName: string;
  destinationShortName: string;
  originAimedDepartureTime: Date;
  call: ICall;
}

export interface IBody {
  [key: string]: IBus[];
}

export interface IResponse {
  status: string;
  data: IData;
  body: IBody;
}

