import { ssg } from '../src/index';

ssg(true).catch((err) => {
  console.error(err);
});
