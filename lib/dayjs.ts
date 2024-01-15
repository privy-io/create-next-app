import dayjs from "dayjs";
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

// add .fromNow typescript support
declare module "dayjs" {
  interface Dayjs {
    fromNow(): string;
  }
}

export { dayjs };
