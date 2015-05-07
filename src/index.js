
import Application from './application';
import Command from './command';
import Input from './input';
import Output from './output';

export default {
  create : Application.init.bind(Application),
  Application,
  Command,
  Input,
  Output
};