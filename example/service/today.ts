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
  car2Status() {
    return this.car2.getStatus();
  }
}

Today.INJECTIONS = {
  car: 'Test/Car',
  car2: Car
}
