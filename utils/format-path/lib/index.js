"use strict";

const path = require("path");

module.exports = function formatPath(p) {
  if (p && typeof p === "String") {
    const sep = path.sep;
    if (setp === "/") {
      return p;
    } else {
      return p.replace("/\\/g", "/");
    }
  }
  return p;
};
