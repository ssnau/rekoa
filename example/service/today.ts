import Car from './Test/Car';

export default class Today {
  car: Car
  hi() {
    return 'good';
  }
  now() {
    return Date.now();
  }
  carStatus() {
    return this.car.getStatus();
  }
}

Today.INJECTIONS = {
  car: 'Test/Car'
}
