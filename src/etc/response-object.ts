export default class ResponseObject {
  statusCode: number;
  message: string;
  data: any;
  error: any;

  constructor(status: number, message: string, data: any, err: any) {
    this.statusCode = status;
    this.message = message;
    this.data = data;
    this.error = err;
  }
}
