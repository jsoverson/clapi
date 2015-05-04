
import Application from './application';
import Input from './input';
import Output from './output';

export default {
  create : Application.init.bind(Application),
  Application,
  Input,
  Output
};