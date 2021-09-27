import Today from './today';

export default class Man {
  today: Today;
  _getInjections() {
    return {
      today: Today
    }
  }
}
