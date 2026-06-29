export interface Trip {
  _id?: string;
  name: string;
  code: string;
  length: string;
  start: string;      // keep as string for forms
  resort: string;
  perPerson: number;
  image: string;
  description: string;
}