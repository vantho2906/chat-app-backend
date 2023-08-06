export default class ResponseObjectSocket {
  type: any;
  data: any;
  constructor(type: any, data: any) {
    this.type = type;
    this.data = data;
  }
}
