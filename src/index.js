
import Application from './application';
import Command from './command';

export default {
  create : Application.init.bind(Application),
  Application,
  Command
};