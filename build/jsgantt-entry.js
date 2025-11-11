const JSGanttModule = require('jsgantt-improved/dist/src/jsgantt');

const JSGantt = JSGanttModule.JSGantt || JSGanttModule;

if (typeof window !== 'undefined') {
  window.JSGantt = JSGantt;
}

module.exports = JSGantt;
