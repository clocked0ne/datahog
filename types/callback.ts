import { Bill } from './bill';

export interface CallbackRequestData {
  uuid: string;
  data: ProviderBilling[];
  url: string;
}


export interface ProviderBilling {
  provider: string;
  billing: Bill[];
}
