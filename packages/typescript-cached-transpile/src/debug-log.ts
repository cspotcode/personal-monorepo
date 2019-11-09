export const DEBUG = false;
export const debug = DEBUG ? console.log.bind(console) : (...args: any[]) => {};
