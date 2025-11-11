(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };

  // node_modules/jsgantt-improved/dist/src/utils/general_utils.js
  var require_general_utils = __commonJS({
    "node_modules/jsgantt-improved/dist/src/utils/general_utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.printChart = exports.calculateStartEndFromDepend = exports.makeRequestOldBrowsers = exports.makeRequest = exports.moveToolTip = exports.updateFlyingObj = exports.isParentElementOrSelf = exports.criticalPath = exports.hashKey = exports.hashString = exports.fadeToolTip = exports.hideToolTip = exports.isIE = exports.getOffset = exports.calculateCurrentDateOffset = exports.getScrollbarWidth = exports.getScrollPositions = exports.benchMark = exports.getZoomFactor = exports.delayedHide = exports.stripUnwanted = exports.stripIds = exports.changeFormat = exports.findObj = exports.internalPropertiesLang = exports.internalProperties = void 0;
      exports.internalProperties = [
        "pID",
        "pName",
        "pStart",
        "pEnd",
        "pClass",
        "pLink",
        "pMile",
        "pRes",
        "pComp",
        "pGroup",
        "pParent",
        "pOpen",
        "pDepend",
        "pCaption",
        "pNotes",
        "pGantt",
        "pCost",
        "pPlanStart",
        "pPlanEnd",
        "pPlanClass"
      ];
      exports.internalPropertiesLang = {
        "pID": "id",
        "pName": "name",
        "pStart": "startdate",
        "pEnd": "enddate",
        "pLink": "link",
        "pMile": "mile",
        "pRes": "res",
        "pDuration": "dur",
        "pComp": "comp",
        "pGroup": "group",
        "pParent": "parent",
        "pOpen": "open",
        "pDepend": "depend",
        "pCaption": "caption",
        "pNotes": "notes",
        "pCost": "cost",
        "pPlanStart": "planstartdate",
        "pPlanEnd": "planenddate",
        "pPlanClass": "planclass"
      };
      exports.findObj = function(theObj, theDoc) {
        if (theDoc === void 0) {
          theDoc = null;
        }
        var p, i, foundObj;
        if (!theDoc)
          theDoc = document;
        if (document.getElementById)
          foundObj = document.getElementById(theObj);
        return foundObj;
      };
      exports.changeFormat = function(pFormat, ganttObj) {
        if (ganttObj)
          ganttObj.setFormat(pFormat);
        else
          alert("Chart undefined");
      };
      exports.stripIds = function(pNode) {
        for (var i = 0; i < pNode.childNodes.length; i++) {
          if ("removeAttribute" in pNode.childNodes[i])
            pNode.childNodes[i].removeAttribute("id");
          if (pNode.childNodes[i].hasChildNodes())
            exports.stripIds(pNode.childNodes[i]);
        }
      };
      exports.stripUnwanted = function(pNode) {
        var vAllowedTags = new Array("#text", "p", "br", "ul", "ol", "li", "div", "span", "img");
        for (var i = 0; i < pNode.childNodes.length; i++) {
          if ((vAllowedTags.join().toLowerCase() + ",").indexOf(pNode.childNodes[i].nodeName.toLowerCase() + ",") == -1) {
            pNode.replaceChild(document.createTextNode(pNode.childNodes[i].outerHTML), pNode.childNodes[i]);
          }
          if (pNode.childNodes[i].hasChildNodes())
            exports.stripUnwanted(pNode.childNodes[i]);
        }
      };
      exports.delayedHide = function(pGanttChartObj, pTool, pTimer) {
        var vDelay = pGanttChartObj.getTooltipDelay() || 1500;
        if (pTool)
          pTool.delayTimeout = setTimeout(function() {
            exports.hideToolTip(pGanttChartObj, pTool, pTimer);
          }, vDelay);
      };
      exports.getZoomFactor = function() {
        var vFactor = 1;
        if (document.body.getBoundingClientRect) {
          var vRect = document.body.getBoundingClientRect();
          var vPhysicalW = vRect.right - vRect.left;
          var vLogicalW = document.body.offsetWidth;
          vFactor = Math.round(vPhysicalW / vLogicalW * 100) / 100;
        }
        return vFactor;
      };
      exports.benchMark = function(pItem) {
        var vEndTime = (/* @__PURE__ */ new Date()).getTime();
        alert(pItem + ": Elapsed time: " + (vEndTime - this.vBenchTime) / 1e3 + " seconds.");
        this.vBenchTime = (/* @__PURE__ */ new Date()).getTime();
      };
      exports.getScrollPositions = function() {
        var vScrollLeft = window.pageXOffset;
        var vScrollTop = window.pageYOffset;
        if (!("pageXOffset" in window)) {
          var vZoomFactor = exports.getZoomFactor();
          vScrollLeft = Math.round(document.documentElement.scrollLeft / vZoomFactor);
          vScrollTop = Math.round(document.documentElement.scrollTop / vZoomFactor);
        }
        return { x: vScrollLeft, y: vScrollTop };
      };
      var scrollbarWidth = void 0;
      exports.getScrollbarWidth = function() {
        if (scrollbarWidth)
          return scrollbarWidth;
        var outer = document.createElement("div");
        outer.className = "gscrollbar-calculation-container";
        document.body.appendChild(outer);
        var inner = document.createElement("div");
        outer.appendChild(inner);
        scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
        outer.parentNode.removeChild(outer);
        return scrollbarWidth;
      };
      exports.calculateCurrentDateOffset = function(curTaskStart, curTaskEnd) {
        var tmpTaskStart = Date.UTC(curTaskStart.getFullYear(), curTaskStart.getMonth(), curTaskStart.getDate(), curTaskStart.getHours(), 0, 0);
        var tmpTaskEnd = Date.UTC(curTaskEnd.getFullYear(), curTaskEnd.getMonth(), curTaskEnd.getDate(), curTaskEnd.getHours(), 0, 0);
        return tmpTaskEnd - tmpTaskStart;
      };
      exports.getOffset = function(pStartDate, pEndDate, pColWidth, pFormat, pShowWeekends) {
        var DAY_CELL_MARGIN_WIDTH = 3;
        var WEEK_CELL_MARGIN_WIDTH = 3;
        var MONTH_CELL_MARGIN_WIDTH = 3;
        var QUARTER_CELL_MARGIN_WIDTH = 3;
        var HOUR_CELL_MARGIN_WIDTH = 3;
        var vMonthDaysArr = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        var curTaskStart = new Date(pStartDate.getTime());
        var curTaskEnd = new Date(pEndDate.getTime());
        var vTaskRightPx = 0;
        var oneHour = 36e5;
        var vTaskRight = exports.calculateCurrentDateOffset(curTaskStart, curTaskEnd) / oneHour;
        var vPosTmpDate;
        if (pFormat == "day") {
          if (!pShowWeekends) {
            var start = curTaskStart;
            var end = curTaskEnd;
            var countWeekends = 0;
            while (start < end) {
              var day = start.getDay();
              if (day === 6 || day == 0) {
                countWeekends++;
              }
              start = new Date(start.getTime() + 24 * oneHour);
            }
            vTaskRight -= countWeekends * 24;
          }
          vTaskRightPx = Math.ceil(vTaskRight / 24 * (pColWidth + DAY_CELL_MARGIN_WIDTH) - 1);
        } else if (pFormat == "week") {
          vTaskRightPx = Math.ceil(vTaskRight / (24 * 7) * (pColWidth + WEEK_CELL_MARGIN_WIDTH) - 1);
        } else if (pFormat == "month") {
          var vMonthsDiff = 12 * (curTaskEnd.getFullYear() - curTaskStart.getFullYear()) + (curTaskEnd.getMonth() - curTaskStart.getMonth());
          vPosTmpDate = new Date(curTaskEnd.getTime());
          vPosTmpDate.setDate(curTaskStart.getDate());
          var vDaysCrctn = (curTaskEnd.getTime() - vPosTmpDate.getTime()) / 864e5;
          vTaskRightPx = Math.ceil(vMonthsDiff * (pColWidth + MONTH_CELL_MARGIN_WIDTH) + vDaysCrctn * (pColWidth / vMonthDaysArr[curTaskEnd.getMonth()]) - 1);
        } else if (pFormat == "quarter") {
          var vMonthsDiff = 12 * (curTaskEnd.getFullYear() - curTaskStart.getFullYear()) + (curTaskEnd.getMonth() - curTaskStart.getMonth());
          vPosTmpDate = new Date(curTaskEnd.getTime());
          vPosTmpDate.setDate(curTaskStart.getDate());
          var vDaysCrctn = (curTaskEnd.getTime() - vPosTmpDate.getTime()) / 864e5;
          vTaskRightPx = Math.ceil(vMonthsDiff * ((pColWidth + QUARTER_CELL_MARGIN_WIDTH) / 3) + vDaysCrctn * (pColWidth / 90) - 1);
        } else if (pFormat == "hour") {
          vPosTmpDate = new Date(curTaskEnd.getTime());
          vPosTmpDate.setMinutes(curTaskStart.getMinutes(), 0);
          var vMinsCrctn = (curTaskEnd.getTime() - vPosTmpDate.getTime()) / 36e5;
          vTaskRightPx = Math.ceil(vTaskRight * (pColWidth + HOUR_CELL_MARGIN_WIDTH) + vMinsCrctn * pColWidth);
        }
        return vTaskRightPx;
      };
      exports.isIE = function() {
        if (typeof document.all != "undefined") {
          if ("pageXOffset" in window)
            return false;
          else
            return true;
        } else
          return false;
      };
      exports.hideToolTip = function(pGanttChartObj, pTool, pTimer) {
        if (pGanttChartObj.getUseFade()) {
          clearInterval(pTool.fadeInterval);
          pTool.fadeInterval = setInterval(function() {
            exports.fadeToolTip(-1, pTool, 0);
          }, pTimer);
        } else {
          pTool.style.opacity = 0;
          pTool.style.filter = "alpha(opacity=0)";
          pTool.style.visibility = "hidden";
          pTool.vToolCont.setAttribute("showing", null);
        }
      };
      exports.fadeToolTip = function(pDirection, pTool, pMaxAlpha) {
        var vIncrement = parseInt(pTool.getAttribute("fadeIncrement"));
        var vAlpha = pTool.getAttribute("currentOpacity");
        var vCurAlpha = parseInt(vAlpha);
        if (vCurAlpha != pMaxAlpha && pDirection == 1 || vCurAlpha != 0 && pDirection == -1) {
          var i = vIncrement;
          if (pMaxAlpha - vCurAlpha < vIncrement && pDirection == 1) {
            i = pMaxAlpha - vCurAlpha;
          } else if (vAlpha < vIncrement && pDirection == -1) {
            i = vCurAlpha;
          }
          vAlpha = vCurAlpha + i * pDirection;
          pTool.style.opacity = vAlpha * 0.01;
          pTool.style.filter = "alpha(opacity=" + vAlpha + ")";
          pTool.setAttribute("currentOpacity", vAlpha);
        } else {
          clearInterval(pTool.fadeInterval);
          if (pDirection == -1) {
            pTool.style.opacity = 0;
            pTool.style.filter = "alpha(opacity=0)";
            pTool.style.visibility = "hidden";
            pTool.vToolCont.setAttribute("showing", null);
          }
        }
      };
      exports.hashString = function(key) {
        if (!key) {
          key = "default";
        }
        key += "";
        var hash = 5381;
        for (var i = 0; i < key.length; i++) {
          if (key.charCodeAt) {
            hash = (hash << 5) + hash + key.charCodeAt(i);
          }
          hash = hash & hash;
        }
        return hash >>> 0;
      };
      exports.hashKey = function(key) {
        return this.hashString(key);
      };
      exports.criticalPath = function(tasks) {
        var path = {};
        tasks.forEach(function(task) {
          task.duration = new Date(task.pEnd).getTime() - new Date(task.pStart).getTime();
        });
        tasks.forEach(function(task) {
          if (!path[task.pID]) {
            path[task.pID] = task;
          }
          if (!path[task.pParent]) {
            path[task.pParent] = {
              childrens: []
            };
          }
          if (!path[task.pID].childrens) {
            path[task.pID].childrens = [];
          }
          path[task.pParent].childrens.push(task);
          var max = path[task.pParent].childrens[0].duration;
          path[task.pParent].childrens.forEach(function(t) {
            if (t.duration > max) {
              max = t.duration;
            }
          });
          path[task.pParent].duration = max;
        });
        var finalNodes = { 0: path[0] };
        var node = path[0];
        var _loop_1 = function() {
          if (node.childrens.length > 0) {
            var found_1 = node.childrens[0];
            var max_1 = found_1.duration;
            node.childrens.forEach(function(c) {
              if (c.duration > max_1) {
                found_1 = c;
                max_1 = c.duration;
              }
            });
            finalNodes[found_1.pID] = found_1;
            node = found_1;
          } else {
            node = null;
          }
        };
        while (node) {
          _loop_1();
        }
      };
      function isParentElementOrSelf(child, parent) {
        while (child) {
          if (child === parent)
            return true;
          child = child.parentElement;
        }
      }
      exports.isParentElementOrSelf = isParentElementOrSelf;
      exports.updateFlyingObj = function(e, pGanttChartObj, pTimer) {
        var documentElement = document.documentElement;
        var bodyElement = document.getElementsByTagName("body")[0];
        var vCurTopBuf = 3;
        var vCurLeftBuf = 5;
        var vCurBotBuf = 3;
        var vCurRightBuf = 15;
        var vMouseX = e ? e.clientX : window.event.clientX;
        var vMouseY = e ? e.clientY : window.event.clientY;
        var vViewportX = (documentElement === null || documentElement === void 0 ? void 0 : documentElement.clientWidth) || (bodyElement === null || bodyElement === void 0 ? void 0 : bodyElement.clientWidth);
        var vViewportY = (documentElement === null || documentElement === void 0 ? void 0 : documentElement.clientHeight) || (bodyElement === null || bodyElement === void 0 ? void 0 : bodyElement.clientHeight);
        var vNewX = vMouseX;
        var vNewY = vMouseY;
        var screenX = screen.availWidth || window.innerWidth;
        var screenY = screen.availHeight || window.innerHeight;
        var vOldX = parseInt(pGanttChartObj.vTool.style.left);
        var vOldY = parseInt(pGanttChartObj.vTool.style.top);
        if (navigator.appName.toLowerCase() == "microsoft internet explorer") {
          vMouseX -= documentElement === null || documentElement === void 0 ? void 0 : documentElement.clientLeft;
          vMouseY -= documentElement === null || documentElement === void 0 ? void 0 : documentElement.clientTop;
          var vZoomFactor = exports.getZoomFactor();
          if (vZoomFactor != 1) {
            vMouseX = Math.round(vMouseX / vZoomFactor);
            vMouseY = Math.round(vMouseY / vZoomFactor);
          }
        }
        var vScrollPos = exports.getScrollPositions();
        if (vMouseX - vCurLeftBuf - pGanttChartObj.vTool.offsetWidth < 0) {
          if (vMouseX + vCurRightBuf + pGanttChartObj.vTool.offsetWidth > vViewportX)
            vNewX = vScrollPos.x;
          else
            vNewX = vMouseX + vScrollPos.x + vCurRightBuf;
        } else
          vNewX = vMouseX + vScrollPos.x - vCurLeftBuf - pGanttChartObj.vTool.offsetWidth;
        if (vMouseY + vCurBotBuf + pGanttChartObj.vTool.offsetHeight > vViewportY) {
          if (vMouseY - vCurTopBuf - pGanttChartObj.vTool.offsetHeight < 0)
            vNewY = vScrollPos.y;
          else
            vNewY = vMouseY + vScrollPos.y - vCurTopBuf - pGanttChartObj.vTool.offsetHeight;
        } else
          vNewY = vMouseY + vScrollPos.y + vCurBotBuf;
        var outViewport = Math.abs(vOldX - vNewX) > screenX || Math.abs(vOldY - vNewY) > screenY;
        if (pGanttChartObj.getUseMove() && !outViewport) {
          clearInterval(pGanttChartObj.vTool.moveInterval);
          pGanttChartObj.vTool.moveInterval = setInterval(function() {
            exports.moveToolTip(vNewX, vNewY, pGanttChartObj.vTool, pTimer);
          }, pTimer);
        } else {
          pGanttChartObj.vTool.style.left = vNewX + "px";
          pGanttChartObj.vTool.style.top = vNewY + "px";
        }
      };
      exports.moveToolTip = function(pNewX, pNewY, pTool, timer) {
        var vSpeed = parseInt(pTool.getAttribute("moveSpeed"));
        var vOldX = parseInt(pTool.style.left);
        var vOldY = parseInt(pTool.style.top);
        if (pTool.style.visibility != "visible") {
          pTool.style.left = pNewX + "px";
          pTool.style.top = pNewY + "px";
          clearInterval(pTool.moveInterval);
        } else {
          if (pNewX != vOldX && pNewY != vOldY) {
            vOldX += Math.ceil((pNewX - vOldX) / vSpeed);
            vOldY += Math.ceil((pNewY - vOldY) / vSpeed);
            pTool.style.left = vOldX + "px";
            pTool.style.top = vOldY + "px";
          } else {
            clearInterval(pTool.moveInterval);
          }
        }
      };
      exports.makeRequest = function(pFile, json, vDebug) {
        if (json === void 0) {
          json = true;
        }
        if (vDebug === void 0) {
          vDebug = false;
        }
        if (window.fetch) {
          var f = fetch(pFile);
          if (json) {
            return f.then(function(res) {
              return res.json();
            });
          } else {
            return f;
          }
        } else {
          return exports.makeRequestOldBrowsers(pFile, vDebug).then(function(xhttp) {
            if (json) {
              var jsonObj = JSON.parse(xhttp.response);
              return jsonObj;
            } else {
              var xmlDoc = xhttp.responseXML;
              return xmlDoc;
            }
          });
        }
      };
      exports.makeRequestOldBrowsers = function(pFile, vDebug) {
        if (vDebug === void 0) {
          vDebug = false;
        }
        return new Promise(function(resolve, reject) {
          var bd;
          if (vDebug) {
            bd = /* @__PURE__ */ new Date();
            console.info("before jsonparse", bd);
          }
          var xhttp;
          if (window.XMLHttpRequest) {
            xhttp = new XMLHttpRequest();
          } else {
            xhttp = new window.ActiveXObject("Microsoft.XMLHTTP");
          }
          xhttp.open("GET", pFile, true);
          xhttp.send(null);
          xhttp.onload = function(e) {
            if (xhttp.readyState === 4) {
              if (xhttp.status === 200) {
              } else {
                console.error(xhttp.statusText);
              }
              if (vDebug) {
                bd = /* @__PURE__ */ new Date();
                console.info("before jsonparse", bd);
              }
              resolve(xhttp);
            }
          };
          xhttp.onerror = function(e) {
            reject(xhttp.statusText);
          };
        });
      };
      exports.calculateStartEndFromDepend = function(tasksList) {
      };
      exports.printChart = function(width, height, css) {
        if (css === void 0) {
          css = void 0;
        }
        if (css === void 0) {
          css = // Default injected CSS
          "@media print {\n        @page {\n          size: " + width + "mm " + height + "mm;\n        }\n        /* set gantt container to the same width as the page */\n        .gchartcontainer {\n            width: " + width + "mm;\n        }\n    };";
        }
        var $container = document.querySelector(".gchartcontainer");
        $container.insertAdjacentHTML("afterbegin", "<style>" + css + "</style>");
        window.addEventListener("afterprint", function() {
          $container.removeChild($container.children[0]);
        }, { "once": true });
        window.print();
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/events.js
  var require_events = __commonJS({
    "node_modules/jsgantt-improved/dist/src/events.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.addListenerDependencies = exports.addListenerInputCell = exports.addListenerClickCell = exports.addScrollListeners = exports.addFormatListeners = exports.addFolderListeners = exports.updateGridHeaderWidth = exports.addThisRowListeners = exports.addTooltipListeners = exports.syncScroll = exports.removeListener = exports.addListener = exports.showToolTip = exports.mouseOut = exports.mouseOver = exports.show = exports.hide = exports.folder = void 0;
      var general_utils_1 = require_general_utils();
      exports.folder = function(pID, ganttObj) {
        var vList = ganttObj.getList();
        ganttObj.clearDependencies();
        for (var i = 0; i < vList.length; i++) {
          if (vList[i].getID() == pID) {
            if (vList[i].getOpen() == 1) {
              vList[i].setOpen(0);
              exports.hide(pID, ganttObj);
              if (general_utils_1.isIE())
                vList[i].getGroupSpan().innerText = "+";
              else
                vList[i].getGroupSpan().textContent = "+";
            } else {
              vList[i].setOpen(1);
              exports.show(pID, 1, ganttObj);
              if (general_utils_1.isIE())
                vList[i].getGroupSpan().innerText = "-";
              else
                vList[i].getGroupSpan().textContent = "-";
            }
          }
        }
        var bd;
        if (this.vDebug) {
          bd = /* @__PURE__ */ new Date();
          console.info("after drawDependency", bd);
        }
        ganttObj.DrawDependencies(this.vDebug);
        if (this.vDebug) {
          var ad = /* @__PURE__ */ new Date();
          console.info("after drawDependency", ad, ad.getTime() - bd.getTime());
        }
      };
      exports.hide = function(pID, ganttObj) {
        var vList = ganttObj.getList();
        var vID = 0;
        for (var i = 0; i < vList.length; i++) {
          if (vList[i].getParent() == pID) {
            vID = vList[i].getID();
            if (vList[i].getListChildRow())
              vList[i].getListChildRow().style.display = "none";
            if (vList[i].getChildRow())
              vList[i].getChildRow().style.display = "none";
            vList[i].setVisible(0);
            if (vList[i].getGroup())
              exports.hide(vID, ganttObj);
          }
        }
      };
      exports.show = function(pID, pTop, ganttObj) {
        var vList = ganttObj.getList();
        var vID = 0;
        var vState = "";
        for (var i = 0; i < vList.length; i++) {
          if (vList[i].getParent() == pID) {
            if (!vList[i].getParItem()) {
              console.error("Cant find parent on who event (maybe problems with Task ID and Parent Id mixes?)");
            }
            if (vList[i].getParItem().getGroupSpan()) {
              if (general_utils_1.isIE())
                vState = vList[i].getParItem().getGroupSpan().innerText;
              else
                vState = vList[i].getParItem().getGroupSpan().textContent;
            }
            i = vList.length;
          }
        }
        for (var i = 0; i < vList.length; i++) {
          if (vList[i].getParent() == pID) {
            var vChgState = false;
            vID = vList[i].getID();
            if (pTop == 1 && vState == "+")
              vChgState = true;
            else if (vState == "-")
              vChgState = true;
            else if (vList[i].getParItem() && vList[i].getParItem().getGroup() == 2)
              vList[i].setVisible(1);
            if (vChgState) {
              if (vList[i].getListChildRow())
                vList[i].getListChildRow().style.display = "";
              if (vList[i].getChildRow())
                vList[i].getChildRow().style.display = "";
              vList[i].setVisible(1);
            }
            if (vList[i].getGroup())
              exports.show(vID, 0, ganttObj);
          }
        }
      };
      exports.mouseOver = function(pObj1, pObj2) {
        if (this.getUseRowHlt()) {
          pObj1.className += " gitemhighlight";
          pObj2.className += " gitemhighlight";
        }
      };
      exports.mouseOut = function(pObj1, pObj2) {
        if (this.getUseRowHlt()) {
          pObj1.className = pObj1.className.replace(/(?:^|\s)gitemhighlight(?!\S)/g, "");
          pObj2.className = pObj2.className.replace(/(?:^|\s)gitemhighlight(?!\S)/g, "");
        }
      };
      exports.showToolTip = function(pGanttChartObj, e, pContents, pWidth, pTimer) {
        var vTtDivId = pGanttChartObj.getDivId() + "JSGanttToolTip";
        var vMaxW = 500;
        var vMaxAlpha = 100;
        var vShowing = pContents.id;
        if (pGanttChartObj.getUseToolTip()) {
          if (pGanttChartObj.vTool == null) {
            pGanttChartObj.vTool = document.createElement("div");
            pGanttChartObj.vTool.id = vTtDivId;
            pGanttChartObj.vTool.className = "JSGanttToolTip";
            pGanttChartObj.vTool.vToolCont = document.createElement("div");
            pGanttChartObj.vTool.vToolCont.id = vTtDivId + "cont";
            pGanttChartObj.vTool.vToolCont.className = "JSGanttToolTipcont";
            pGanttChartObj.vTool.vToolCont.setAttribute("showing", "");
            pGanttChartObj.vTool.appendChild(pGanttChartObj.vTool.vToolCont);
            document.body.appendChild(pGanttChartObj.vTool);
            pGanttChartObj.vTool.style.opacity = 0;
            pGanttChartObj.vTool.setAttribute("currentOpacity", 0);
            pGanttChartObj.vTool.setAttribute("fadeIncrement", 10);
            pGanttChartObj.vTool.setAttribute("moveSpeed", 10);
            pGanttChartObj.vTool.style.filter = "alpha(opacity=0)";
            pGanttChartObj.vTool.style.visibility = "hidden";
            pGanttChartObj.vTool.style.left = Math.floor((e ? e.clientX : window.event.clientX) / 2) + "px";
            pGanttChartObj.vTool.style.top = Math.floor((e ? e.clientY : window.event.clientY) / 2) + "px";
            this.addListener("mouseover", function() {
              clearTimeout(pGanttChartObj.vTool.delayTimeout);
            }, pGanttChartObj.vTool);
            this.addListener("mouseout", function() {
              general_utils_1.delayedHide(pGanttChartObj, pGanttChartObj.vTool, pTimer);
            }, pGanttChartObj.vTool);
          }
          clearTimeout(pGanttChartObj.vTool.delayTimeout);
          var newHTML = pContents.innerHTML;
          if (pGanttChartObj.vTool.vToolCont.getAttribute("content") !== newHTML) {
            pGanttChartObj.vTool.vToolCont.innerHTML = pContents.innerHTML;
            general_utils_1.stripIds(pGanttChartObj.vTool.vToolCont);
            pGanttChartObj.vTool.vToolCont.setAttribute("content", newHTML);
          }
          if (pGanttChartObj.vTool.vToolCont.getAttribute("showing") != vShowing || pGanttChartObj.vTool.style.visibility != "visible") {
            if (pGanttChartObj.vTool.vToolCont.getAttribute("showing") != vShowing) {
              pGanttChartObj.vTool.vToolCont.setAttribute("showing", vShowing);
            }
            pGanttChartObj.vTool.style.visibility = "visible";
            general_utils_1.updateFlyingObj(e, pGanttChartObj, pTimer);
            pGanttChartObj.vTool.style.width = pWidth ? pWidth + "px" : "auto";
            if (!pWidth && general_utils_1.isIE()) {
              pGanttChartObj.vTool.style.width = pGanttChartObj.vTool.offsetWidth;
            }
            if (pGanttChartObj.vTool.offsetWidth > vMaxW) {
              pGanttChartObj.vTool.style.width = vMaxW + "px";
            }
          }
          if (pGanttChartObj.getUseFade()) {
            clearInterval(pGanttChartObj.vTool.fadeInterval);
            pGanttChartObj.vTool.fadeInterval = setInterval(function() {
              general_utils_1.fadeToolTip(1, pGanttChartObj.vTool, vMaxAlpha);
            }, pTimer);
          } else {
            pGanttChartObj.vTool.style.opacity = vMaxAlpha * 0.01;
            pGanttChartObj.vTool.style.filter = "alpha(opacity=" + vMaxAlpha + ")";
          }
        }
      };
      exports.addListener = function(eventName, handler, control) {
        if (control === String(control))
          control = general_utils_1.findObj(control);
        if (control.addEventListener) {
          return control.addEventListener(eventName, handler, false);
        } else if (control.attachEvent) {
          return control.attachEvent("on" + eventName, handler);
        } else {
          return false;
        }
      };
      exports.removeListener = function(eventName, handler, control) {
        if (control === String(control))
          control = general_utils_1.findObj(control);
        if (control.removeEventListener) {
          return control.removeEventListener(eventName, handler, false);
        } else if (control.detachEvent) {
          return control.attachEvent("on" + eventName, handler);
        } else {
          return false;
        }
      };
      exports.syncScroll = function(elements, attrName) {
        var syncFlags = new Map(elements.map(function(e) {
          return [e, false];
        }));
        function scrollEvent(e) {
          if (!syncFlags.get(e.target)) {
            for (var _i2 = 0, elements_2 = elements; _i2 < elements_2.length; _i2++) {
              var el2 = elements_2[_i2];
              if (el2 !== e.target) {
                syncFlags.set(el2, true);
                el2[attrName] = e.target[attrName];
              }
            }
          }
          syncFlags.set(e.target, false);
        }
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
          var el = elements_1[_i];
          el.addEventListener("scroll", scrollEvent);
        }
      };
      exports.addTooltipListeners = function(pGanttChart, pObj1, pObj2, callback) {
        var isShowingTooltip = false;
        exports.addListener("mouseover", function(e) {
          if (isShowingTooltip || !callback) {
            exports.showToolTip(pGanttChart, e, pObj2, null, pGanttChart.getTimer());
          } else if (callback) {
            isShowingTooltip = true;
            var promise = callback();
            exports.showToolTip(pGanttChart, e, pObj2, null, pGanttChart.getTimer());
            if (promise && promise.then) {
              promise.then(function() {
                if (pGanttChart.vTool.vToolCont.getAttribute("showing") === pObj2.id && pGanttChart.vTool.style.visibility === "visible") {
                  exports.showToolTip(pGanttChart, e, pObj2, null, pGanttChart.getTimer());
                }
              });
            }
          }
        }, pObj1);
        exports.addListener("mouseout", function(e) {
          var outTo = e.relatedTarget;
          if (general_utils_1.isParentElementOrSelf(outTo, pObj1) || pGanttChart.vTool && general_utils_1.isParentElementOrSelf(outTo, pGanttChart.vTool)) {
          } else {
            isShowingTooltip = false;
          }
          general_utils_1.delayedHide(pGanttChart, pGanttChart.vTool, pGanttChart.getTimer());
        }, pObj1);
      };
      exports.addThisRowListeners = function(pGanttChart, pObj1, pObj2) {
        exports.addListener("mouseover", function() {
          pGanttChart.mouseOver(pObj1, pObj2);
        }, pObj1);
        exports.addListener("mouseover", function() {
          pGanttChart.mouseOver(pObj1, pObj2);
        }, pObj2);
        exports.addListener("mouseout", function() {
          pGanttChart.mouseOut(pObj1, pObj2);
        }, pObj1);
        exports.addListener("mouseout", function() {
          pGanttChart.mouseOut(pObj1, pObj2);
        }, pObj2);
      };
      exports.updateGridHeaderWidth = function(pGanttChart) {
        var head = pGanttChart.getChartHead();
        var body = pGanttChart.getChartBody();
        if (!head || !body)
          return;
        var isScrollVisible = body.scrollHeight > body.clientHeight;
        if (isScrollVisible) {
          head.style.width = "calc(100% - " + general_utils_1.getScrollbarWidth() + "px)";
        } else {
          head.style.width = "100%";
        }
      };
      exports.addFolderListeners = function(pGanttChart, pObj, pID) {
        exports.addListener("click", function() {
          exports.folder(pID, pGanttChart);
          exports.updateGridHeaderWidth(pGanttChart);
        }, pObj);
      };
      exports.addFormatListeners = function(pGanttChart, pFormat, pObj) {
        exports.addListener("click", function() {
          general_utils_1.changeFormat(pFormat, pGanttChart);
        }, pObj);
      };
      exports.addScrollListeners = function(pGanttChart) {
        exports.addListener("resize", function() {
          pGanttChart.getChartHead().scrollLeft = pGanttChart.getChartBody().scrollLeft;
        }, window);
        exports.addListener("resize", function() {
          pGanttChart.getListBody().scrollTop = pGanttChart.getChartBody().scrollTop;
        }, window);
      };
      exports.addListenerClickCell = function(vTmpCell, vEvents, task, column) {
        exports.addListener("click", function(e) {
          if (e.target.classList.contains("gfoldercollapse") === false && vEvents[column] && typeof vEvents[column] === "function") {
            vEvents[column](task, e, vTmpCell, column);
          }
        }, vTmpCell);
      };
      exports.addListenerInputCell = function(vTmpCell, vEventsChange, callback, tasks, index, column, draw, event) {
        if (draw === void 0) {
          draw = null;
        }
        if (event === void 0) {
          event = "blur";
        }
        var task = tasks[index];
        if (vTmpCell.children[0] && vTmpCell.children[0].children && vTmpCell.children[0].children[0]) {
          var tagName = vTmpCell.children[0].children[0].tagName;
          var selectInputOrButton = tagName === "SELECT" || tagName === "INPUT" || tagName === "BUTTON";
          if (selectInputOrButton) {
            exports.addListener(event, function(e) {
              if (callback) {
                callback(task, e);
              }
              if (vEventsChange[column] && typeof vEventsChange[column] === "function") {
                var q = vEventsChange[column](tasks, task, e, vTmpCell, vColumnsNames[column]);
                if (q && q.then) {
                  q.then(function(e2) {
                    return draw();
                  });
                } else {
                  draw();
                }
              } else {
                draw();
              }
            }, vTmpCell.children[0].children[0]);
          }
        }
      };
      exports.addListenerDependencies = function(vLineOptions) {
        var elements = document.querySelectorAll(".gtaskbarcontainer");
        for (var i = 0; i < elements.length; i++) {
          var taskDiv = elements[i];
          taskDiv.addEventListener("mouseover", function(e) {
            toggleDependencies(e, vLineOptions);
          });
          taskDiv.addEventListener("mouseout", function(e) {
            toggleDependencies(e, vLineOptions);
          });
        }
      };
      var toggleDependencies = function(e, vLineOptions) {
        var target = e.currentTarget;
        var ids = target.getAttribute("id").split("_");
        var style = vLineOptions && vLineOptions.borderStyleHover !== void 0 ? vLineOptions.hoverStyle : "groove";
        if (e.type === "mouseout") {
          style = "";
        }
        if (ids.length > 1) {
          var frameZones = Array.from(document.querySelectorAll(".gDepId" + ids[1]));
          frameZones.forEach(function(c) {
            c.style.borderStyle = style;
          });
        }
      };
      var vColumnsNames = {
        taskname: "pName",
        res: "pRes",
        dur: "",
        comp: "pComp",
        start: "pStart",
        end: "pEnd",
        planstart: "pPlanStart",
        planend: "pPlanEnd",
        link: "pLink",
        cost: "pCost",
        mile: "pMile",
        group: "pGroup",
        parent: "pParent",
        open: "pOpen",
        depend: "pDepend",
        caption: "pCaption",
        note: "pNotes"
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/utils/draw_utils.js
  var require_draw_utils = __commonJS({
    "node_modules/jsgantt-improved/dist/src/utils/draw_utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.drawSelector = exports.sLine = exports.CalcTaskXY = exports.getArrayLocationByID = exports.newNode = exports.makeInput = void 0;
      var events_1 = require_events();
      exports.makeInput = function(formattedValue, editable, type, value, choices) {
        if (type === void 0) {
          type = "text";
        }
        if (value === void 0) {
          value = null;
        }
        if (choices === void 0) {
          choices = null;
        }
        if (!value) {
          value = formattedValue;
        }
        if (editable) {
          switch (type) {
            case "date":
              value = value ? new Date(value.getTime() - value.getTimezoneOffset() * 6e4).toISOString().split("T")[0] : "";
              return '<input class="gantt-inputtable" type="date" value="' + value + '">';
            case "resource":
              if (choices) {
                var found = choices.filter(function(c) {
                  return c.id == value || c.name == value;
                });
                if (found && found.length > 0) {
                  value = found[0].id;
                } else {
                  choices.push({ id: value, name: value });
                }
                return "<select>" + choices.map(function(c) {
                  return '<option value="' + c.id + '" ' + (value == c.id ? "selected" : "") + " >" + c.name + "</option>";
                }).join("") + "</select>";
              } else {
                return '<input class="gantt-inputtable" type="text" value="' + (value ? value : "") + '">';
              }
            case "cost":
              return '<input class="gantt-inputtable" type="number" max="100" min="0" value="' + (value ? value : "") + '">';
            default:
              return '<input class="gantt-inputtable" value="' + (value ? value : "") + '">';
          }
        } else {
          return formattedValue;
        }
      };
      exports.newNode = function(pParent, pNodeType, pId, pClass, pText, pWidth, pLeft, pDisplay, pColspan, pAttribs) {
        if (pId === void 0) {
          pId = null;
        }
        if (pClass === void 0) {
          pClass = null;
        }
        if (pText === void 0) {
          pText = null;
        }
        if (pWidth === void 0) {
          pWidth = null;
        }
        if (pLeft === void 0) {
          pLeft = null;
        }
        if (pDisplay === void 0) {
          pDisplay = null;
        }
        if (pColspan === void 0) {
          pColspan = null;
        }
        if (pAttribs === void 0) {
          pAttribs = null;
        }
        var vNewNode = pParent.appendChild(document.createElement(pNodeType));
        if (pAttribs) {
          for (var i = 0; i + 1 < pAttribs.length; i += 2) {
            vNewNode.setAttribute(pAttribs[i], pAttribs[i + 1]);
          }
        }
        if (pId)
          vNewNode.id = pId;
        if (pClass)
          vNewNode.className = pClass;
        if (pWidth)
          vNewNode.style.width = isNaN(pWidth * 1) ? pWidth : pWidth + "px";
        if (pLeft)
          vNewNode.style.left = isNaN(pLeft * 1) ? pLeft : pLeft + "px";
        if (pText) {
          if (pText.indexOf && pText.indexOf("<") === -1) {
            vNewNode.appendChild(document.createTextNode(pText));
          } else {
            vNewNode.insertAdjacentHTML("beforeend", pText);
          }
        }
        if (pDisplay)
          vNewNode.style.display = pDisplay;
        if (pColspan)
          vNewNode.colSpan = pColspan;
        return vNewNode;
      };
      exports.getArrayLocationByID = function(pId) {
        var vList = this.getList();
        for (var i = 0; i < vList.length; i++) {
          if (vList[i].getID() == pId)
            return i;
        }
        return -1;
      };
      exports.CalcTaskXY = function() {
        var vID;
        var vList = this.getList();
        var vBarDiv;
        var vTaskDiv;
        var vParDiv;
        var vLeft, vTop, vWidth;
        var vHeight = Math.floor(this.getRowHeight() / 2);
        for (var i = 0; i < vList.length; i++) {
          vID = vList[i].getID();
          vBarDiv = vList[i].getBarDiv();
          vTaskDiv = vList[i].getTaskDiv();
          if (vList[i].getParItem() && vList[i].getParItem().getGroup() == 2) {
            vParDiv = vList[i].getParItem().getChildRow();
          } else
            vParDiv = vList[i].getChildRow();
          if (vBarDiv) {
            vList[i].setStartX(vBarDiv.offsetLeft + 1);
            vList[i].setStartY(vParDiv.offsetTop + vBarDiv.offsetTop + vHeight - 1);
            vList[i].setEndX(vBarDiv.offsetLeft + vBarDiv.offsetWidth + 1);
            vList[i].setEndY(vParDiv.offsetTop + vBarDiv.offsetTop + vHeight - 1);
          }
        }
      };
      exports.sLine = function(x1, y1, x2, y2, pClass) {
        var vLeft = Math.min(x1, x2);
        var vTop = Math.min(y1, y2);
        var vWid = Math.abs(x2 - x1) + 1;
        var vHgt = Math.abs(y2 - y1) + 1;
        var vTmpDiv = document.createElement("div");
        vTmpDiv.id = this.vDivId + "line" + this.vDepId++;
        vTmpDiv.style.position = "absolute";
        vTmpDiv.style.overflow = "hidden";
        vTmpDiv.style.zIndex = "0";
        vTmpDiv.style.left = vLeft + "px";
        vTmpDiv.style.top = vTop + "px";
        vTmpDiv.style.width = vWid + "px";
        vTmpDiv.style.height = vHgt + "px";
        vTmpDiv.style.visibility = "visible";
        if (vWid == 1)
          vTmpDiv.className = "glinev";
        else
          vTmpDiv.className = "glineh";
        if (pClass)
          vTmpDiv.className += " " + pClass;
        this.getLines().appendChild(vTmpDiv);
        if (this.vEvents.onLineDraw && typeof this.vEvents.onLineDraw === "function") {
          this.vEvents.onLineDraw(vTmpDiv);
        }
        return vTmpDiv;
      };
      exports.drawSelector = function(pPos) {
        var vOutput = document.createDocumentFragment();
        var vDisplay = false;
        for (var i = 0; i < this.vShowSelector.length && !vDisplay; i++) {
          if (this.vShowSelector[i].toLowerCase() == pPos.toLowerCase())
            vDisplay = true;
        }
        if (vDisplay) {
          var vTmpDiv = exports.newNode(vOutput, "div", null, "gselector", this.vLangs[this.vLang]["format"] + ":");
          if (this.vFormatArr.join().toLowerCase().indexOf("hour") != -1)
            events_1.addFormatListeners(this, "hour", exports.newNode(vTmpDiv, "span", this.vDivId + "formathour" + pPos, "gformlabel" + (this.vFormat == "hour" ? " gselected" : ""), this.vLangs[this.vLang]["hour"]));
          if (this.vFormatArr.join().toLowerCase().indexOf("day") != -1)
            events_1.addFormatListeners(this, "day", exports.newNode(vTmpDiv, "span", this.vDivId + "formatday" + pPos, "gformlabel" + (this.vFormat == "day" ? " gselected" : ""), this.vLangs[this.vLang]["day"]));
          if (this.vFormatArr.join().toLowerCase().indexOf("week") != -1)
            events_1.addFormatListeners(this, "week", exports.newNode(vTmpDiv, "span", this.vDivId + "formatweek" + pPos, "gformlabel" + (this.vFormat == "week" ? " gselected" : ""), this.vLangs[this.vLang]["week"]));
          if (this.vFormatArr.join().toLowerCase().indexOf("month") != -1)
            events_1.addFormatListeners(this, "month", exports.newNode(vTmpDiv, "span", this.vDivId + "formatmonth" + pPos, "gformlabel" + (this.vFormat == "month" ? " gselected" : ""), this.vLangs[this.vLang]["month"]));
          if (this.vFormatArr.join().toLowerCase().indexOf("quarter") != -1)
            events_1.addFormatListeners(this, "quarter", exports.newNode(vTmpDiv, "span", this.vDivId + "formatquarter" + pPos, "gformlabel" + (this.vFormat == "quarter" ? " gselected" : ""), this.vLangs[this.vLang]["quarter"]));
        } else {
          exports.newNode(vOutput, "div", null, "gselector");
        }
        return vOutput;
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/utils/date_utils.js
  var require_date_utils = __commonJS({
    "node_modules/jsgantt-improved/dist/src/utils/date_utils.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getIsoWeek = exports.parseDateFormatStr = exports.formatDateStr = exports.parseDateStr = exports.coerceDate = exports.getMaxDate = exports.getMinDate = void 0;
      exports.getMinDate = function(pList, pFormat, pMinDate) {
        var vDate = /* @__PURE__ */ new Date();
        if (pList.length <= 0)
          return pMinDate || vDate;
        vDate.setTime(pMinDate && pMinDate.getTime() || pList[0].getStart().getTime());
        for (var i = 0; i < pList.length; i++) {
          if (pList[i].getStart().getTime() < vDate.getTime())
            vDate.setTime(pList[i].getStart().getTime());
          if (pList[i].getPlanStart() && pList[i].getPlanStart().getTime() < vDate.getTime())
            vDate.setTime(pList[i].getPlanStart().getTime());
        }
        if (pFormat == "day") {
          vDate.setDate(vDate.getDate() - 1);
          while (vDate.getDay() % 7 != 1)
            vDate.setDate(vDate.getDate() - 1);
        } else if (pFormat == "week") {
          vDate.setDate(vDate.getDate() - 1);
          while (vDate.getDay() % 7 != 1)
            vDate.setDate(vDate.getDate() - 1);
        } else if (pFormat == "month") {
          vDate.setDate(vDate.getDate() - 15);
          while (vDate.getDate() > 1)
            vDate.setDate(vDate.getDate() - 1);
        } else if (pFormat == "quarter") {
          vDate.setDate(vDate.getDate() - 31);
          if (vDate.getMonth() == 0 || vDate.getMonth() == 1 || vDate.getMonth() == 2)
            vDate.setFullYear(vDate.getFullYear(), 0, 1);
          else if (vDate.getMonth() == 3 || vDate.getMonth() == 4 || vDate.getMonth() == 5)
            vDate.setFullYear(vDate.getFullYear(), 3, 1);
          else if (vDate.getMonth() == 6 || vDate.getMonth() == 7 || vDate.getMonth() == 8)
            vDate.setFullYear(vDate.getFullYear(), 6, 1);
          else if (vDate.getMonth() == 9 || vDate.getMonth() == 10 || vDate.getMonth() == 11)
            vDate.setFullYear(vDate.getFullYear(), 9, 1);
        } else if (pFormat == "hour") {
          vDate.setHours(vDate.getHours() - 1);
          while (vDate.getHours() % 6 != 0)
            vDate.setHours(vDate.getHours() - 1);
        }
        if (pFormat == "hour")
          vDate.setMinutes(0, 0);
        else
          vDate.setHours(0, 0, 0);
        return vDate;
      };
      exports.getMaxDate = function(pList, pFormat, pMaxDate) {
        var vDate = /* @__PURE__ */ new Date();
        if (pList.length <= 0)
          return pMaxDate || vDate;
        vDate.setTime(pMaxDate && pMaxDate.getTime() || pList[0].getEnd().getTime());
        for (var i = 0; i < pList.length; i++) {
          if (pList[i].getEnd().getTime() > vDate.getTime())
            vDate.setTime(pList[i].getEnd().getTime());
          if (pList[i].getPlanEnd() && pList[i].getPlanEnd().getTime() > vDate.getTime())
            vDate.setTime(pList[i].getPlanEnd().getTime());
        }
        if (pFormat == "day") {
          vDate.setDate(vDate.getDate() + 1);
          while (vDate.getDay() % 7 != 0)
            vDate.setDate(vDate.getDate() + 1);
        } else if (pFormat == "week") {
          vDate.setDate(vDate.getDate() + 1);
          while (vDate.getDay() % 7 != 0)
            vDate.setDate(vDate.getDate() + 1);
        } else if (pFormat == "month") {
          while (vDate.getDate() > 1)
            vDate.setDate(vDate.getDate() + 1);
          vDate.setDate(vDate.getDate() - 1);
        } else if (pFormat == "quarter") {
          if (vDate.getMonth() == 0 || vDate.getMonth() == 1 || vDate.getMonth() == 2)
            vDate.setFullYear(vDate.getFullYear(), 2, 31);
          else if (vDate.getMonth() == 3 || vDate.getMonth() == 4 || vDate.getMonth() == 5)
            vDate.setFullYear(vDate.getFullYear(), 5, 30);
          else if (vDate.getMonth() == 6 || vDate.getMonth() == 7 || vDate.getMonth() == 8)
            vDate.setFullYear(vDate.getFullYear(), 8, 30);
          else if (vDate.getMonth() == 9 || vDate.getMonth() == 10 || vDate.getMonth() == 11)
            vDate.setFullYear(vDate.getFullYear(), 11, 31);
        } else if (pFormat == "hour") {
          if (vDate.getHours() == 0)
            vDate.setDate(vDate.getDate() + 1);
          vDate.setHours(vDate.getHours() + 1);
          while (vDate.getHours() % 6 != 5)
            vDate.setHours(vDate.getHours() + 1);
        }
        return vDate;
      };
      exports.coerceDate = function(date) {
        if (date instanceof Date) {
          return date;
        } else {
          var temp = new Date(date);
          if (temp instanceof Date && !isNaN(temp.valueOf())) {
            return temp;
          }
        }
      };
      exports.parseDateStr = function(pDateStr, pFormatStr) {
        var vDate = /* @__PURE__ */ new Date();
        var vDateParts = pDateStr.split(/[^0-9]/);
        if (pDateStr.length >= 10 && vDateParts.length >= 3) {
          while (vDateParts.length < 5)
            vDateParts.push(0);
          switch (pFormatStr) {
            case "mm/dd/yyyy":
              vDate = new Date(vDateParts[2], vDateParts[0] - 1, vDateParts[1], vDateParts[3], vDateParts[4]);
              break;
            case "dd/mm/yyyy":
              vDate = new Date(vDateParts[2], vDateParts[1] - 1, vDateParts[0], vDateParts[3], vDateParts[4]);
              break;
            case "yyyy-mm-dd":
              vDate = new Date(vDateParts[0], vDateParts[1] - 1, vDateParts[2], vDateParts[3], vDateParts[4]);
              break;
            case "yyyy-mm-dd HH:MI:SS":
              vDate = new Date(vDateParts[0], vDateParts[1] - 1, vDateParts[2], vDateParts[3], vDateParts[4], vDateParts[5]);
              break;
          }
        }
        return vDate;
      };
      exports.formatDateStr = function(pDate, pDateFormatArr, pL) {
        if (!pDate) {
          return;
        }
        var vDateStr = "";
        var vYear2Str = pDate.getFullYear().toString().substring(2, 4);
        var vMonthStr = pDate.getMonth() + 1 + "";
        var vMonthArr = new Array(pL["january"], pL["february"], pL["march"], pL["april"], pL["maylong"], pL["june"], pL["july"], pL["august"], pL["september"], pL["october"], pL["november"], pL["december"]);
        var vDayArr = new Array(pL["sunday"], pL["monday"], pL["tuesday"], pL["wednesday"], pL["thursday"], pL["friday"], pL["saturday"]);
        var vMthArr = new Array(pL["jan"], pL["feb"], pL["mar"], pL["apr"], pL["may"], pL["jun"], pL["jul"], pL["aug"], pL["sep"], pL["oct"], pL["nov"], pL["dec"]);
        var vDyArr = new Array(pL["sun"], pL["mon"], pL["tue"], pL["wed"], pL["thu"], pL["fri"], pL["sat"]);
        for (var i = 0; i < pDateFormatArr.length; i++) {
          switch (pDateFormatArr[i]) {
            case "dd":
              if (pDate.getDate() < 10)
                vDateStr += "0";
            // now fall through
            case "d":
              vDateStr += pDate.getDate();
              break;
            case "day":
              vDateStr += vDyArr[pDate.getDay()];
              break;
            case "DAY":
              vDateStr += vDayArr[pDate.getDay()];
              break;
            case "mm":
              if (parseInt(vMonthStr, 10) < 10)
                vDateStr += "0";
            // now fall through
            case "m":
              vDateStr += vMonthStr;
              break;
            case "mon":
              vDateStr += vMthArr[pDate.getMonth()];
              break;
            case "month":
              vDateStr += vMonthArr[pDate.getMonth()];
              break;
            case "yyyy":
              vDateStr += pDate.getFullYear();
              break;
            case "yy":
              vDateStr += vYear2Str;
              break;
            case "qq":
              vDateStr += pL["qtr"];
            // now fall through
            case "q":
              vDateStr += Math.floor(pDate.getMonth() / 3) + 1;
              break;
            case "hh":
              if ((pDate.getHours() % 12 == 0 ? 12 : pDate.getHours() % 12) < 10)
                vDateStr += "0";
            // now fall through
            case "h":
              vDateStr += pDate.getHours() % 12 == 0 ? 12 : pDate.getHours() % 12;
              break;
            case "HH":
              if (pDate.getHours() < 10)
                vDateStr += "0";
            // now fall through
            case "H":
              vDateStr += pDate.getHours();
              break;
            case "MI":
              if (pDate.getMinutes() < 10)
                vDateStr += "0";
            // now fall through
            case "mi":
              vDateStr += pDate.getMinutes();
              break;
            case "SS":
              if (pDate.getSeconds() < 10)
                vDateStr += "0";
            // now fall through
            case "ss":
              vDateStr += pDate.getSeconds();
              break;
            case "pm":
              vDateStr += pDate.getHours() < 12 ? "am" : "pm";
              break;
            case "PM":
              vDateStr += pDate.getHours() < 12 ? "AM" : "PM";
              break;
            case "ww":
              if (exports.getIsoWeek(pDate) < 10)
                vDateStr += "0";
            // now fall through
            case "w":
              vDateStr += exports.getIsoWeek(pDate);
              break;
            case "week":
              var vWeekNum = exports.getIsoWeek(pDate);
              var vYear = pDate.getFullYear();
              var vDayOfWeek = pDate.getDay() == 0 ? 7 : pDate.getDay();
              if (vWeekNum >= 52 && parseInt(vMonthStr, 10) === 1)
                vYear--;
              if (vWeekNum == 1 && parseInt(vMonthStr, 10) === 12)
                vYear++;
              if (vWeekNum < 10)
                vWeekNum = parseInt("0" + vWeekNum, 10);
              vDateStr += vYear + "-W" + vWeekNum + "-" + vDayOfWeek;
              break;
            default:
              if (pL[pDateFormatArr[i].toLowerCase()])
                vDateStr += pL[pDateFormatArr[i].toLowerCase()];
              else
                vDateStr += pDateFormatArr[i];
              break;
          }
        }
        return vDateStr;
      };
      exports.parseDateFormatStr = function(pFormatStr) {
        var vComponantStr = "";
        var vCurrChar = "";
        var vSeparators = new RegExp(`[/\\ -.,'":]`);
        var vDateFormatArray = new Array();
        for (var i = 0; i < pFormatStr.length; i++) {
          vCurrChar = pFormatStr.charAt(i);
          if (vCurrChar.match(vSeparators) || i + 1 == pFormatStr.length) {
            if (i + 1 == pFormatStr.length && !vCurrChar.match(vSeparators)) {
              vComponantStr += vCurrChar;
            }
            vDateFormatArray.push(vComponantStr);
            if (vCurrChar.match(vSeparators))
              vDateFormatArray.push(vCurrChar);
            vComponantStr = "";
          } else {
            vComponantStr += vCurrChar;
          }
        }
        return vDateFormatArray;
      };
      exports.getIsoWeek = function(pDate) {
        var dayMiliseconds = 864e5;
        var keyDay = new Date(pDate.getFullYear(), 0, 4, 0, 0, 0);
        var keyDayOfWeek = keyDay.getDay() == 0 ? 6 : keyDay.getDay() - 1;
        var firstMondayYearTime = keyDay.getTime() - keyDayOfWeek * dayMiliseconds;
        var thisDate = new Date(pDate.getFullYear(), pDate.getMonth(), pDate.getDate(), 0, 0, 0);
        var thisTime = thisDate.getTime();
        var daysFromFirstMonday = Math.round((thisTime - firstMondayYearTime) / dayMiliseconds);
        var lastWeek = 99;
        var thisWeek = 99;
        var firstMondayYear = new Date(firstMondayYearTime);
        thisWeek = Math.ceil((daysFromFirstMonday + 1) / 7);
        if (thisWeek <= 0)
          thisWeek = exports.getIsoWeek(new Date(pDate.getFullYear() - 1, 11, 31, 0, 0, 0));
        else if (thisWeek == 53 && new Date(pDate.getFullYear(), 0, 1, 0, 0, 0).getDay() != 4 && new Date(pDate.getFullYear(), 11, 31, 0, 0, 0).getDay() != 4)
          thisWeek = 1;
        return thisWeek;
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/task.js
  var require_task = __commonJS({
    "node_modules/jsgantt-improved/dist/src/task.js"(exports) {
      "use strict";
      var __assign = exports && exports.__assign || function() {
        __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
              t[p] = s[p];
          }
          return t;
        };
        return __assign.apply(this, arguments);
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.processRows = exports.ClearTasks = exports.RemoveTaskItem = exports.AddTaskItemObject = exports.AddTaskItem = exports.createTaskInfo = exports.TaskItem = exports.TaskItemObject = exports.sortTasks = exports.taskLink = void 0;
      var general_utils_1 = require_general_utils();
      var draw_utils_1 = require_draw_utils();
      var date_utils_1 = require_date_utils();
      exports.taskLink = function(pRef, pWidth, pHeight) {
        var vWidth, vHeight;
        if (pWidth)
          vWidth = pWidth;
        else
          vWidth = 400;
        if (pHeight)
          vHeight = pHeight;
        else
          vHeight = 400;
        window.open(pRef, "newwin", "height=" + vHeight + ",width=" + vWidth);
      };
      exports.sortTasks = function(pList, pID, pIdx) {
        if (pList.length < 2) {
          return pIdx;
        }
        var sortIdx = pIdx;
        var sortArr = new Array();
        for (var i = 0; i < pList.length; i++) {
          if (pList[i].getParent() == pID)
            sortArr.push(pList[i]);
        }
        if (sortArr.length > 0) {
          sortArr.sort(function(a, b) {
            var i2 = a.getStart().getTime() - b.getStart().getTime();
            if (i2 == 0)
              i2 = a.getEnd().getTime() - b.getEnd().getTime();
            if (i2 == 0)
              return a.getID() - b.getID();
            else
              return i2;
          });
        }
        for (var j = 0; j < sortArr.length; j++) {
          for (var i = 0; i < pList.length; i++) {
            if (pList[i].getID() == sortArr[j].getID()) {
              pList[i].setSortIdx(sortIdx++);
              sortIdx = exports.sortTasks(pList, pList[i].getID(), sortIdx);
            }
          }
        }
        return sortIdx;
      };
      exports.TaskItemObject = function(object) {
        var pDataObject = __assign({}, object);
        general_utils_1.internalProperties.forEach(function(property) {
          delete pDataObject[property];
        });
        return new exports.TaskItem(object.pID, object.pName, object.pStart, object.pEnd, object.pClass, object.pLink, object.pMile, object.pRes, object.pComp, object.pGroup, object.pParent, object.pOpen, object.pDepend, object.pCaption, object.pNotes, object.pGantt, object.pCost, object.pPlanStart, object.pPlanEnd, object.pDuration, object.pBarText, object, object.pPlanClass);
      };
      exports.TaskItem = function(pID, pName, pStart, pEnd, pClass, pLink, pMile, pRes, pComp, pGroup, pParent, pOpen, pDepend, pCaption, pNotes, pGantt, pCost, pPlanStart, pPlanEnd, pDuration, pBarText, pDataObject, pPlanClass) {
        if (pCost === void 0) {
          pCost = null;
        }
        if (pPlanStart === void 0) {
          pPlanStart = null;
        }
        if (pPlanEnd === void 0) {
          pPlanEnd = null;
        }
        if (pDuration === void 0) {
          pDuration = null;
        }
        if (pBarText === void 0) {
          pBarText = null;
        }
        if (pDataObject === void 0) {
          pDataObject = null;
        }
        if (pPlanClass === void 0) {
          pPlanClass = null;
        }
        var vGantt = pGantt ? pGantt : this;
        var _id = document.createTextNode(pID).data;
        var vID = general_utils_1.hashKey(document.createTextNode(pID).data);
        var vName = document.createTextNode(pName).data;
        var vStart = null;
        var vEnd = null;
        var vPlanStart = null;
        var vPlanEnd = null;
        var vGroupMinStart = null;
        var vGroupMinEnd = null;
        var vGroupMinPlanStart = null;
        var vGroupMinPlanEnd = null;
        var vClass = document.createTextNode(pClass).data;
        var vPlanClass = document.createTextNode(pPlanClass).data;
        var vLink = document.createTextNode(pLink).data;
        var vMile = parseInt(document.createTextNode(pMile).data);
        var vRes = document.createTextNode(pRes).data;
        var vComp = parseFloat(document.createTextNode(pComp).data);
        var vCost = parseInt(document.createTextNode(pCost).data);
        var vGroup = parseInt(document.createTextNode(pGroup).data);
        var vDataObject = pDataObject;
        var vCompVal;
        var parent = document.createTextNode(pParent).data;
        if (parent && parent !== "0") {
          parent = general_utils_1.hashKey(parent).toString();
        }
        var vParent = parent;
        var vOpen = vGroup == 2 ? 1 : parseInt(document.createTextNode(pOpen).data);
        var vDepend = new Array();
        var vDependType = new Array();
        var vCaption = document.createTextNode(pCaption).data;
        var vDuration = pDuration || "";
        var vBarText = pBarText || "";
        var vLevel = 0;
        var vNumKid = 0;
        var vWeight = 0;
        var vVisible = 1;
        var vSortIdx = 0;
        var vToDelete = false;
        var x1, y1, x2, y2;
        var vNotes;
        var vParItem = null;
        var vCellDiv = null;
        var vBarDiv = null;
        var vTaskDiv = null;
        var vPlanTaskDiv = null;
        var vListChildRow = null;
        var vChildRow = null;
        var vGroupSpan = null;
        vNotes = document.createElement("span");
        vNotes.className = "gTaskNotes";
        if (pNotes != null) {
          vNotes.innerHTML = pNotes;
          general_utils_1.stripUnwanted(vNotes);
        }
        if (pStart != null && pStart != "") {
          vStart = pStart instanceof Date ? pStart : date_utils_1.parseDateStr(document.createTextNode(pStart).data, vGantt.getDateInputFormat());
          vGroupMinStart = vStart;
        }
        if (pEnd != null && pEnd != "") {
          vEnd = pEnd instanceof Date ? pEnd : date_utils_1.parseDateStr(document.createTextNode(pEnd).data, vGantt.getDateInputFormat());
          vGroupMinEnd = vEnd;
        }
        if (pPlanStart != null && pPlanStart != "") {
          vPlanStart = pPlanStart instanceof Date ? pPlanStart : date_utils_1.parseDateStr(document.createTextNode(pPlanStart).data, vGantt.getDateInputFormat());
          vGroupMinPlanStart = vPlanStart;
        }
        if (pPlanEnd != null && pPlanEnd != "") {
          vPlanEnd = pPlanEnd instanceof Date ? pPlanEnd : date_utils_1.parseDateStr(document.createTextNode(pPlanEnd).data, vGantt.getDateInputFormat());
          vGroupMinPlanEnd = vPlanEnd;
        }
        if (pDepend != null) {
          var vDependStr = pDepend + "";
          var vDepList = vDependStr.split(",");
          var n = vDepList.length;
          for (var k = 0; k < n; k++) {
            if (vDepList[k].toUpperCase().endsWith("SS")) {
              vDepend[k] = vDepList[k].substring(0, vDepList[k].length - 2);
              vDependType[k] = "SS";
            } else if (vDepList[k].toUpperCase().endsWith("FF")) {
              vDepend[k] = vDepList[k].substring(0, vDepList[k].length - 2);
              vDependType[k] = "FF";
            } else if (vDepList[k].toUpperCase().endsWith("SF")) {
              vDepend[k] = vDepList[k].substring(0, vDepList[k].length - 2);
              vDependType[k] = "SF";
            } else if (vDepList[k].toUpperCase().endsWith("FS")) {
              vDepend[k] = vDepList[k].substring(0, vDepList[k].length - 2);
              vDependType[k] = "FS";
            } else {
              vDepend[k] = vDepList[k];
              vDependType[k] = "FS";
            }
            if (vDepend[k]) {
              vDepend[k] = general_utils_1.hashKey(vDepend[k]).toString();
            }
          }
        }
        this.getID = function() {
          return vID;
        };
        this.getOriginalID = function() {
          return _id;
        };
        this.getGantt = function() {
          return vGantt;
        };
        this.getName = function() {
          return vName;
        };
        this.getStart = function() {
          if (vStart)
            return vStart;
          else if (vPlanStart)
            return vPlanStart;
          else
            return /* @__PURE__ */ new Date();
        };
        this.getStartVar = function() {
          return vStart;
        };
        this.getEnd = function() {
          if (vEnd)
            return vEnd;
          else if (vPlanEnd)
            return vPlanEnd;
          else if (vStart && vDuration) {
            var date = new Date(vStart);
            var vUnits = vDuration.split(" ");
            var value = parseInt(vUnits[0]);
            switch (vUnits[1]) {
              case "hour":
                date.setMinutes(date.getMinutes() + value * 60);
                break;
              case "day":
                date.setMinutes(date.getMinutes() + value * 60 * 24);
                break;
              case "week":
                date.setMinutes(date.getMinutes() + value * 60 * 24 * 7);
                break;
              case "month":
                date.setMonth(date.getMonth() + value);
                break;
              case "quarter":
                date.setMonth(date.getMonth() + value * 3);
                break;
            }
            return date;
          } else
            return /* @__PURE__ */ new Date();
        };
        this.getEndVar = function() {
          return vEnd;
        };
        this.getPlanStart = function() {
          return vPlanStart ? vPlanStart : vStart;
        };
        this.getPlanClass = function() {
          return vPlanClass && vPlanClass !== "null" ? vPlanClass : vClass;
        };
        this.getPlanEnd = function() {
          return vPlanEnd ? vPlanEnd : vEnd;
        };
        this.getCost = function() {
          return vCost;
        };
        this.getGroupMinStart = function() {
          return vGroupMinStart;
        };
        this.getGroupMinEnd = function() {
          return vGroupMinEnd;
        };
        this.getGroupMinPlanStart = function() {
          return vGroupMinPlanStart;
        };
        this.getGroupMinPlanEnd = function() {
          return vGroupMinPlanEnd;
        };
        this.getClass = function() {
          return vClass;
        };
        this.getLink = function() {
          return vLink;
        };
        this.getMile = function() {
          return vMile;
        };
        this.getDepend = function() {
          if (vDepend)
            return vDepend;
          else
            return null;
        };
        this.getDataObject = function() {
          return vDataObject;
        };
        this.getDepType = function() {
          if (vDependType)
            return vDependType;
          else
            return null;
        };
        this.getCaption = function() {
          if (vCaption)
            return vCaption;
          else
            return "";
        };
        this.getResource = function() {
          if (vRes)
            return vRes;
          else
            return "\xA0";
        };
        this.getCompVal = function() {
          if (vComp)
            return vComp;
          else if (vCompVal)
            return vCompVal;
          else
            return 0;
        };
        this.getCompStr = function() {
          if (vComp)
            return vComp + "%";
          else if (vCompVal)
            return vCompVal + "%";
          else
            return "";
        };
        this.getCompRestStr = function() {
          if (vComp)
            return 100 - vComp + "%";
          else if (vCompVal)
            return 100 - vCompVal + "%";
          else
            return "";
        };
        this.getNotes = function() {
          return vNotes;
        };
        this.getSortIdx = function() {
          return vSortIdx;
        };
        this.getToDelete = function() {
          return vToDelete;
        };
        this.getDuration = function(pFormat, pLang) {
          if (vMile) {
            vDuration = "-";
          } else if (!vEnd && !vStart && vPlanStart && vPlanEnd) {
            return calculateVDuration(pFormat, pLang, this.getPlanStart(), this.getPlanEnd());
          } else if (!vEnd && vDuration) {
            return vDuration;
          } else {
            vDuration = calculateVDuration(pFormat, pLang, this.getStart(), this.getEnd());
          }
          return vDuration;
        };
        function calculateVDuration(pFormat, pLang, start, end) {
          var vDuration2;
          var vUnits = null;
          switch (pFormat) {
            case "week":
              vUnits = "day";
              break;
            case "month":
              vUnits = "week";
              break;
            case "quarter":
              vUnits = "month";
              break;
            default:
              vUnits = pFormat;
              break;
          }
          var hours = (end.getTime() - start.getTime()) / 1e3 / 60 / 60;
          var tmpPer;
          switch (vUnits) {
            case "hour":
              tmpPer = Math.round(hours);
              vDuration2 = tmpPer + " " + (tmpPer != 1 ? pLang["hrs"] : pLang["hr"]);
              break;
            case "day":
              tmpPer = Math.round(hours / 24);
              vDuration2 = tmpPer + " " + (tmpPer != 1 ? pLang["dys"] : pLang["dy"]);
              break;
            case "week":
              tmpPer = Math.round(hours / 24 / 7);
              vDuration2 = tmpPer + " " + (tmpPer != 1 ? pLang["wks"] : pLang["wk"]);
              break;
            case "month":
              tmpPer = Math.round(hours / 24 / 7 / 4.35);
              vDuration2 = tmpPer + " " + (tmpPer != 1 ? pLang["mths"] : pLang["mth"]);
              break;
            case "quarter":
              tmpPer = Math.round(hours / 24 / 7 / 13);
              vDuration2 = tmpPer + " " + (tmpPer != 1 ? pLang["qtrs"] : pLang["qtr"]);
              break;
          }
          return vDuration2;
        }
        this.getBarText = function() {
          return vBarText;
        };
        this.getParent = function() {
          return vParent;
        };
        this.getGroup = function() {
          return vGroup;
        };
        this.getOpen = function() {
          return vOpen;
        };
        this.getLevel = function() {
          return vLevel;
        };
        this.getNumKids = function() {
          return vNumKid;
        };
        this.getWeight = function() {
          return vWeight;
        };
        this.getStartX = function() {
          return x1;
        };
        this.getStartY = function() {
          return y1;
        };
        this.getEndX = function() {
          return x2;
        };
        this.getEndY = function() {
          return y2;
        };
        this.getVisible = function() {
          return vVisible;
        };
        this.getParItem = function() {
          return vParItem;
        };
        this.getCellDiv = function() {
          return vCellDiv;
        };
        this.getBarDiv = function() {
          return vBarDiv;
        };
        this.getTaskDiv = function() {
          return vTaskDiv;
        };
        this.getPlanTaskDiv = function() {
          return vPlanTaskDiv;
        };
        this.getChildRow = function() {
          return vChildRow;
        };
        this.getListChildRow = function() {
          return vListChildRow;
        };
        this.getGroupSpan = function() {
          return vGroupSpan;
        };
        this.setName = function(pName2) {
          vName = pName2;
        };
        this.setNotes = function(pNotes2) {
          vNotes = pNotes2;
        };
        this.setClass = function(pClass2) {
          vClass = pClass2;
        };
        this.setPlanClass = function(pPlanClass2) {
          vPlanClass = pPlanClass2;
        };
        this.setCost = function(pCost2) {
          vCost = pCost2;
        };
        this.setResource = function(pRes2) {
          vRes = pRes2;
        };
        this.setDuration = function(pDuration2) {
          vDuration = pDuration2;
        };
        this.setDataObject = function(pDataObject2) {
          vDataObject = pDataObject2;
        };
        this.setStart = function(pStart2) {
          if (pStart2 instanceof Date) {
            vStart = pStart2;
          } else {
            var temp = new Date(pStart2);
            if (temp instanceof Date && !isNaN(temp.valueOf())) {
              vStart = temp;
            }
          }
        };
        this.setEnd = function(pEnd2) {
          if (pEnd2 instanceof Date) {
            vEnd = pEnd2;
          } else {
            var temp = new Date(pEnd2);
            if (temp instanceof Date && !isNaN(temp.valueOf())) {
              vEnd = temp;
            }
          }
        };
        this.setPlanStart = function(pPlanStart2) {
          if (pPlanStart2 instanceof Date)
            vPlanStart = pPlanStart2;
          else
            vPlanStart = new Date(pPlanStart2);
        };
        this.setPlanEnd = function(pPlanEnd2) {
          if (pPlanEnd2 instanceof Date)
            vPlanEnd = pPlanEnd2;
          else
            vPlanEnd = new Date(pPlanEnd2);
        };
        this.setGroupMinStart = function(pStart2) {
          if (pStart2 instanceof Date)
            vGroupMinStart = pStart2;
        };
        this.setGroupMinEnd = function(pEnd2) {
          if (pEnd2 instanceof Date)
            vGroupMinEnd = pEnd2;
        };
        this.setLevel = function(pLevel) {
          vLevel = parseInt(document.createTextNode(pLevel).data);
        };
        this.setNumKid = function(pNumKid) {
          vNumKid = parseInt(document.createTextNode(pNumKid).data);
        };
        this.setWeight = function(pWeight) {
          vWeight = parseInt(document.createTextNode(pWeight).data);
        };
        this.setCompVal = function(pCompVal) {
          vCompVal = parseFloat(document.createTextNode(pCompVal).data);
        };
        this.setComp = function(pComp2) {
          vComp = parseInt(document.createTextNode(pComp2).data);
        };
        this.setStartX = function(pX) {
          x1 = parseInt(document.createTextNode(pX).data);
        };
        this.setStartY = function(pY) {
          y1 = parseInt(document.createTextNode(pY).data);
        };
        this.setEndX = function(pX) {
          x2 = parseInt(document.createTextNode(pX).data);
        };
        this.setEndY = function(pY) {
          y2 = parseInt(document.createTextNode(pY).data);
        };
        this.setOpen = function(pOpen2) {
          vOpen = parseInt(document.createTextNode(pOpen2).data);
        };
        this.setVisible = function(pVisible) {
          vVisible = parseInt(document.createTextNode(pVisible).data);
        };
        this.setSortIdx = function(pSortIdx) {
          vSortIdx = parseInt(document.createTextNode(pSortIdx).data);
        };
        this.setToDelete = function(pToDelete) {
          if (pToDelete)
            vToDelete = true;
          else
            vToDelete = false;
        };
        this.setParItem = function(pParItem) {
          if (pParItem)
            vParItem = pParItem;
        };
        this.setCellDiv = function(pCellDiv) {
          if (typeof HTMLDivElement !== "function" || pCellDiv instanceof HTMLDivElement)
            vCellDiv = pCellDiv;
        };
        this.setGroup = function(pGroup2) {
          if (pGroup2 === true || pGroup2 === "true") {
            vGroup = 1;
          } else if (pGroup2 === false || pGroup2 === "false") {
            vGroup = 0;
          } else {
            vGroup = parseInt(document.createTextNode(pGroup2).data);
          }
        };
        this.setBarText = function(pBarText2) {
          if (pBarText2)
            vBarText = pBarText2;
        };
        this.setBarDiv = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            vBarDiv = pDiv;
        };
        this.setTaskDiv = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            vTaskDiv = pDiv;
        };
        this.setPlanTaskDiv = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            vPlanTaskDiv = pDiv;
        };
        this.setChildRow = function(pRow) {
          if (typeof HTMLTableRowElement !== "function" || pRow instanceof HTMLTableRowElement)
            vChildRow = pRow;
        };
        this.setListChildRow = function(pRow) {
          if (typeof HTMLTableRowElement !== "function" || pRow instanceof HTMLTableRowElement)
            vListChildRow = pRow;
        };
        this.setGroupSpan = function(pSpan) {
          if (typeof HTMLSpanElement !== "function" || pSpan instanceof HTMLSpanElement)
            vGroupSpan = pSpan;
        };
        this.getAllData = function() {
          return {
            pID: vID,
            pName: vName,
            pStart: vStart,
            pEnd: vEnd,
            pPlanStart: vPlanStart,
            pPlanEnd: vPlanEnd,
            pGroupMinStart: vGroupMinStart,
            pGroupMinEnd: vGroupMinEnd,
            pClass: vClass,
            pLink: vLink,
            pMile: vMile,
            pRes: vRes,
            pComp: vComp,
            pCost: vCost,
            pGroup: vGroup,
            pDataObject: vDataObject,
            pPlanClass: vPlanClass
          };
        };
      };
      exports.createTaskInfo = function(pTask, templateStrOrFn) {
        var _this = this;
        if (templateStrOrFn === void 0) {
          templateStrOrFn = null;
        }
        var vTmpDiv;
        var vTaskInfoBox = document.createDocumentFragment();
        var vTaskInfo = draw_utils_1.newNode(vTaskInfoBox, "div", null, "gTaskInfo");
        var setupTemplate = function(template) {
          vTaskInfo.innerHTML = "";
          if (template) {
            var allData_1 = pTask.getAllData();
            general_utils_1.internalProperties.forEach(function(key) {
              var lang;
              if (general_utils_1.internalPropertiesLang[key]) {
                lang = _this.vLangs[_this.vLang][general_utils_1.internalPropertiesLang[key]];
              }
              if (!lang) {
                lang = key;
              }
              var val = allData_1[key];
              template = template.replace("{{" + key + "}}", val);
              if (lang) {
                template = template.replace("{{Lang:" + key + "}}", lang);
              } else {
                template = template.replace("{{Lang:" + key + "}}", key);
              }
            });
            draw_utils_1.newNode(vTaskInfo, "span", null, "gTtTemplate", template);
          } else {
            draw_utils_1.newNode(vTaskInfo, "span", null, "gTtTitle", pTask.getName());
            if (_this.vShowTaskInfoStartDate == 1) {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTIsd");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel", _this.vLangs[_this.vLang]["startdate"] + ": ");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskText", date_utils_1.formatDateStr(pTask.getStart(), _this.vDateTaskDisplayFormat, _this.vLangs[_this.vLang]));
            }
            if (_this.vShowTaskInfoEndDate == 1) {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTIed");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel", _this.vLangs[_this.vLang]["enddate"] + ": ");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskText", date_utils_1.formatDateStr(pTask.getEnd(), _this.vDateTaskDisplayFormat, _this.vLangs[_this.vLang]));
            }
            if (_this.vShowTaskInfoDur == 1 && !pTask.getMile()) {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTId");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel", _this.vLangs[_this.vLang]["dur"] + ": ");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskText", pTask.getDuration(_this.vFormat, _this.vLangs[_this.vLang]));
            }
            if (_this.vShowTaskInfoComp == 1) {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTIc");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel", _this.vLangs[_this.vLang]["completion"] + ": ");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskText", pTask.getCompStr());
            }
            if (_this.vShowTaskInfoRes == 1) {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTIr");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel", _this.vLangs[_this.vLang]["res"] + ": ");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskText", pTask.getResource());
            }
            if (_this.vShowTaskInfoLink == 1 && pTask.getLink() != "") {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTIl");
              var vTmpNode = draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel");
              vTmpNode = draw_utils_1.newNode(vTmpNode, "a", null, "gTaskText", _this.vLangs[_this.vLang]["moreinfo"]);
              vTmpNode.setAttribute("href", pTask.getLink());
            }
            if (_this.vShowTaskInfoNotes == 1) {
              vTmpDiv = draw_utils_1.newNode(vTaskInfo, "div", null, "gTILine gTIn");
              draw_utils_1.newNode(vTmpDiv, "span", null, "gTaskLabel", _this.vLangs[_this.vLang]["notes"] + ": ");
              if (pTask.getNotes())
                vTmpDiv.appendChild(pTask.getNotes());
            }
          }
        };
        var callback;
        if (typeof templateStrOrFn === "function") {
          callback = function() {
            var strOrPromise = templateStrOrFn(pTask);
            if (!strOrPromise || typeof strOrPromise === "string") {
              setupTemplate(strOrPromise);
            } else if (strOrPromise.then) {
              setupTemplate(_this.vLangs[_this.vLang]["tooltipLoading"] || _this.vLangs["en"]["tooltipLoading"]);
              return strOrPromise.then(setupTemplate);
            }
          };
        } else {
          setupTemplate(templateStrOrFn);
        }
        return { component: vTaskInfoBox, callback };
      };
      exports.AddTaskItem = function(value) {
        var vExists = false;
        for (var i = 0; i < this.vTaskList.length; i++) {
          if (this.vTaskList[i].getID() == value.getID()) {
            i = this.vTaskList.length;
            vExists = true;
          }
        }
        if (!vExists) {
          this.vTaskList.push(value);
          this.vProcessNeeded = true;
        }
      };
      exports.AddTaskItemObject = function(object) {
        if (!object.pGantt) {
          object.pGantt = this;
        }
        return this.AddTaskItem(exports.TaskItemObject(object));
      };
      exports.RemoveTaskItem = function(pID) {
        for (var i = 0; i < this.vTaskList.length; i++) {
          if (this.vTaskList[i].getID() == pID)
            this.vTaskList[i].setToDelete(true);
          else if (this.vTaskList[i].getParent() == pID)
            this.RemoveTaskItem(this.vTaskList[i].getID());
        }
        this.vProcessNeeded = true;
      };
      exports.ClearTasks = function() {
        var _this = this;
        this.vTaskList.map(function(task) {
          return _this.RemoveTaskItem(task.getID());
        });
        this.vProcessNeeded = true;
      };
      exports.processRows = function(pList, pID, pRow, pLevel, pOpen, pUseSort, vDebug) {
        if (vDebug === void 0) {
          vDebug = false;
        }
        var vMinDate = null;
        var vMaxDate = null;
        var vMinPlanDate = null;
        var vMaxPlanDate = null;
        var vVisible = pOpen;
        var vCurItem = null;
        var vCompSum = 0;
        var vMinSet = 0;
        var vMaxSet = 0;
        var vMinPlanSet = 0;
        var vMaxPlanSet = 0;
        var vNumKid = 0;
        var vWeight = 0;
        var vLevel = pLevel;
        var vList = pList;
        var vComb = false;
        var i = 0;
        for (i = 0; i < pList.length; i++) {
          if (pList[i].getToDelete()) {
            pList.splice(i, 1);
            i--;
          }
          if (i >= 0 && pList[i].getID() == pID)
            vCurItem = pList[i];
        }
        for (i = 0; i < pList.length; i++) {
          if (pList[i].getParent() == pID) {
            vVisible = pOpen;
            pList[i].setParItem(vCurItem);
            pList[i].setVisible(vVisible);
            if (vVisible == 1 && pList[i].getOpen() == 0)
              vVisible = 0;
            if (pList[i].getMile() && pList[i].getParItem() && pList[i].getParItem().getGroup() == 2) {
              pList.splice(i, 1);
              i--;
              continue;
            }
            pList[i].setLevel(vLevel);
            if (pList[i].getGroup()) {
              if (pList[i].getParItem() && pList[i].getParItem().getGroup() == 2)
                pList[i].setGroup(2);
              exports.processRows(vList, pList[i].getID(), i, vLevel + 1, vVisible, 0);
            }
            if (pList[i].getStartVar() && (vMinSet == 0 || pList[i].getStartVar() < vMinDate)) {
              vMinDate = pList[i].getStartVar();
              vMinSet = 1;
            }
            if (pList[i].getEndVar() && (vMaxSet == 0 || pList[i].getEndVar() > vMaxDate)) {
              vMaxDate = pList[i].getEndVar();
              vMaxSet = 1;
            }
            if (vMinPlanSet == 0 || pList[i].getPlanStart() < vMinPlanDate) {
              vMinPlanDate = pList[i].getPlanStart();
              vMinPlanSet = 1;
            }
            if (vMaxPlanSet == 0 || pList[i].getPlanEnd() > vMaxPlanDate) {
              vMaxPlanDate = pList[i].getPlanEnd();
              vMaxPlanSet = 1;
            }
            vNumKid++;
            vWeight += pList[i].getEnd() - pList[i].getStart() + 1;
            vCompSum += pList[i].getCompVal() * (pList[i].getEnd() - pList[i].getStart() + 1);
            pList[i].setSortIdx(i * pList.length);
          }
        }
        if (pRow >= 0) {
          if (pList[pRow].getGroupMinStart() != null && pList[pRow].getGroupMinStart() < vMinDate) {
            vMinDate = pList[pRow].getGroupMinStart();
          }
          if (pList[pRow].getGroupMinEnd() != null && pList[pRow].getGroupMinEnd() > vMaxDate) {
            vMaxDate = pList[pRow].getGroupMinEnd();
          }
          if (vMinDate) {
            pList[pRow].setStart(vMinDate);
          }
          if (vMaxDate) {
            pList[pRow].setEnd(vMaxDate);
          }
          if (pList[pRow].getGroupMinPlanStart() != null && pList[pRow].getGroupMinPlanStart() < vMinPlanDate) {
            vMinPlanDate = pList[pRow].getGroupMinPlanStart();
          }
          if (pList[pRow].getGroupMinPlanEnd() != null && pList[pRow].getGroupMinPlanEnd() > vMaxPlanDate) {
            vMaxPlanDate = pList[pRow].getGroupMinPlanEnd();
          }
          if (vMinPlanDate) {
            pList[pRow].setPlanStart(vMinPlanDate);
          }
          if (vMaxPlanDate) {
            pList[pRow].setPlanEnd(vMaxPlanDate);
          }
          pList[pRow].setNumKid(vNumKid);
          pList[pRow].setWeight(vWeight);
          pList[pRow].setCompVal(Math.ceil(vCompSum / vWeight));
        }
        if (pID == 0 && pUseSort == 1) {
          var bd = void 0;
          if (vDebug) {
            bd = /* @__PURE__ */ new Date();
            console.info("before afterTasks", bd);
          }
          exports.sortTasks(pList, 0, 0);
          if (vDebug) {
            var ad = /* @__PURE__ */ new Date();
            console.info("after afterTasks", ad, ad.getTime() - bd.getTime());
          }
          pList.sort(function(a, b) {
            return a.getSortIdx() - b.getSortIdx();
          });
        }
        if (pID == 0 && pUseSort != 1) {
          for (i = 0; i < pList.length; i++) {
            if (pList[i].getGroup() == 2) {
              vComb = true;
              var bd = void 0;
              if (vDebug) {
                bd = /* @__PURE__ */ new Date();
                console.info("before sortTasks", bd);
              }
              exports.sortTasks(pList, pList[i].getID(), pList[i].getSortIdx() + 1);
              if (vDebug) {
                var ad = /* @__PURE__ */ new Date();
                console.info("after sortTasks", ad, ad.getTime() - bd.getTime());
              }
            }
          }
          if (vComb == true)
            pList.sort(function(a, b) {
              return a.getSortIdx() - b.getSortIdx();
            });
        }
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/xml.js
  var require_xml = __commonJS({
    "node_modules/jsgantt-improved/dist/src/xml.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.getXMLTask = exports.getXMLProject = exports.AddXMLTask = exports.getXMLNodeValue = exports.findXMLNode = exports.parseXMLString = exports.parseXML = void 0;
      var task_1 = require_task();
      var date_utils_1 = require_date_utils();
      var draw_utils_1 = require_draw_utils();
      var general_utils_1 = require_general_utils();
      exports.parseXML = function(pFile, pGanttVar) {
        return general_utils_1.makeRequest(pFile, false, false).then(function(xmlDoc) {
          exports.AddXMLTask(pGanttVar, xmlDoc);
        });
      };
      exports.parseXMLString = function(pStr, pGanttVar) {
        var xmlDoc;
        if (typeof window.DOMParser != "undefined") {
          xmlDoc = new window.DOMParser().parseFromString(pStr, "text/xml");
        } else if (typeof window.ActiveXObject != "undefined" && new window.ActiveXObject("Microsoft.XMLDOM")) {
          xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
          xmlDoc.async = "false";
          xmlDoc.loadXML(pStr);
        }
        exports.AddXMLTask(pGanttVar, xmlDoc);
      };
      exports.findXMLNode = function(pRoot, pNodeName) {
        var vRetValue;
        try {
          vRetValue = pRoot.getElementsByTagName(pNodeName);
        } catch (error) {
          ;
        }
        return vRetValue;
      };
      exports.getXMLNodeValue = function(pRoot, pNodeName, pType, pDefault) {
        var vRetValue;
        try {
          vRetValue = pRoot.getElementsByTagName(pNodeName)[0].childNodes[0].nodeValue;
        } catch (error) {
          if (typeof pDefault != "undefined")
            vRetValue = pDefault;
        }
        if (typeof vRetValue != "undefined" && vRetValue != null) {
          if (pType == 1)
            vRetValue *= 1;
          else if (pType == 2)
            vRetValue = vRetValue.toString();
        }
        return vRetValue;
      };
      exports.AddXMLTask = function(pGanttVar, pXmlDoc) {
        var project = "";
        var Task;
        var n = 0;
        var m = 0;
        var i = 0;
        var j = 0;
        var k = 0;
        var maxPID = 0;
        var ass = new Array();
        var assRes = new Array();
        var res = new Array();
        var pars = new Array();
        var projNode = exports.findXMLNode(pXmlDoc, "Project");
        if (typeof projNode != "undefined" && projNode.length > 0) {
          project = projNode[0].getAttribute("xmlns");
        }
        if (project == "http://schemas.microsoft.com/project") {
          pGanttVar.setDateInputFormat("yyyy-mm-dd");
          Task = exports.findXMLNode(pXmlDoc, "Task");
          if (typeof Task == "undefined")
            n = 0;
          else
            n = Task.length;
          var resources = exports.findXMLNode(pXmlDoc, "Resource");
          if (typeof resources == "undefined") {
            n = 0;
            m = 0;
          } else
            m = resources.length;
          for (i = 0; i < m; i++) {
            var resname = exports.getXMLNodeValue(resources[i], "Name", 2, "");
            var uid = exports.getXMLNodeValue(resources[i], "UID", 1, -1);
            if (resname.length > 0 && uid > 0)
              res[uid] = resname;
          }
          var assignments = exports.findXMLNode(pXmlDoc, "Assignment");
          if (typeof assignments == "undefined")
            j = 0;
          else
            j = assignments.length;
          for (i = 0; i < j; i++) {
            var uid = void 0;
            var resUID = exports.getXMLNodeValue(assignments[i], "ResourceUID", 1, -1);
            uid = exports.getXMLNodeValue(assignments[i], "TaskUID", 1, -1);
            if (uid > 0) {
              if (resUID > 0)
                assRes[uid] = res[resUID];
              ass[uid] = assignments[i];
            }
          }
          for (i = 0; i < n; i++) {
            var uid = void 0;
            uid = exports.getXMLNodeValue(Task[i], "UID", 1, 0);
            var vOutlineNumber = void 0;
            if (uid != 0)
              vOutlineNumber = exports.getXMLNodeValue(Task[i], "OutlineNumber", 2, "0");
            if (uid > 0)
              pars[vOutlineNumber] = uid;
            if (uid > maxPID)
              maxPID = uid;
          }
          for (i = 0; i < n; i++) {
            var pID = exports.getXMLNodeValue(Task[i], "UID", 1, 0);
            if (pID != 0) {
              var pName = exports.getXMLNodeValue(Task[i], "Name", 2, "No Task Name");
              var pStart = exports.getXMLNodeValue(Task[i], "Start", 2, "");
              var pEnd = exports.getXMLNodeValue(Task[i], "Finish", 2, "");
              var pPlanStart = exports.getXMLNodeValue(Task[i], "PlanStart", 2, "");
              var pPlanEnd = exports.getXMLNodeValue(Task[i], "PlanFinish", 2, "");
              var pDuration = exports.getXMLNodeValue(Task[i], "Duration", 2, "");
              var pLink = exports.getXMLNodeValue(Task[i], "HyperlinkAddress", 2, "");
              var pMile = exports.getXMLNodeValue(Task[i], "Milestone", 1, 0);
              var pComp = exports.getXMLNodeValue(Task[i], "PercentWorkComplete", 1, 0);
              var pCost = exports.getXMLNodeValue(Task[i], "Cost", 2, 0);
              var pGroup = exports.getXMLNodeValue(Task[i], "Summary", 1, 0);
              var pParent = 0;
              var vOutlineLevel = exports.getXMLNodeValue(Task[i], "OutlineLevel", 1, 0);
              var vOutlineNumber = void 0;
              if (vOutlineLevel > 1) {
                vOutlineNumber = exports.getXMLNodeValue(Task[i], "OutlineNumber", 2, "0");
                pParent = pars[vOutlineNumber.substr(0, vOutlineNumber.lastIndexOf("."))];
              }
              var pNotes = void 0;
              try {
                pNotes = Task[i].getElementsByTagName("Notes")[0].childNodes[1].nodeValue;
              } catch (error) {
                pNotes = "";
              }
              var pRes = void 0;
              if (typeof assRes[pID] != "undefined")
                pRes = assRes[pID];
              else
                pRes = "";
              var predecessors = exports.findXMLNode(Task[i], "PredecessorLink");
              if (typeof predecessors == "undefined")
                j = 0;
              else
                j = predecessors.length;
              var pDepend = "";
              for (k = 0; k < j; k++) {
                var depUID = exports.getXMLNodeValue(predecessors[k], "PredecessorUID", 1, -1);
                var depType = exports.getXMLNodeValue(predecessors[k], "Type", 1, 1);
                if (depUID > 0) {
                  if (pDepend.length > 0)
                    pDepend += ",";
                  switch (depType) {
                    case 0:
                      pDepend += depUID + "FF";
                      break;
                    case 1:
                      pDepend += depUID + "FS";
                      break;
                    case 2:
                      pDepend += depUID + "SF";
                      break;
                    case 3:
                      pDepend += depUID + "SS";
                      break;
                    default:
                      pDepend += depUID + "FS";
                      break;
                  }
                }
              }
              var pOpen = 1;
              var pCaption = "";
              var pClass = void 0;
              if (pGroup > 0)
                pClass = "ggroupblack";
              else if (pMile > 0)
                pClass = "gmilestone";
              else
                pClass = "gtaskblue";
              var splits = exports.findXMLNode(ass[pID], "TimephasedData");
              if (typeof splits == "undefined")
                j = 0;
              else
                j = splits.length;
              var vSplitStart = pStart;
              var vSplitEnd = pEnd;
              var vSubCreated = false;
              var vDepend = pDepend.replace(/,*[0-9]+[FS]F/g, "");
              for (k = 0; k < j; k++) {
                var vDuration = exports.getXMLNodeValue(splits[k], "Value", 2, "0");
                vDuration = "0" + vDuration.replace(/\D/g, "");
                vDuration *= 1;
                if (vDuration == 0 && !vSubCreated || k + 1 == j && pGroup == 2) {
                  pGroup = 2;
                  if (k + 1 == j)
                    vDepend = pDepend.replace(/,*[0-9]+[FS]S/g, "");
                  maxPID++;
                  vSplitEnd = exports.getXMLNodeValue(splits[k], k + 1 == j ? "Finish" : "Start", 2, "");
                  pGanttVar.AddTaskItem(new task_1.TaskItem(maxPID, pName, vSplitStart, vSplitEnd, "gtaskblue", pLink, pMile, pRes, pComp, 0, pID, pOpen, vDepend, pCaption, pNotes, pGanttVar, pCost, pPlanStart, pPlanEnd, pDuration));
                  vSubCreated = true;
                  vDepend = "";
                } else if (vDuration != 0 && vSubCreated) {
                  vSplitStart = exports.getXMLNodeValue(splits[k], "Start", 2, "");
                  vSubCreated = false;
                }
              }
              if (vSubCreated)
                pDepend = "";
              pGanttVar.AddTaskItem(new task_1.TaskItem(pID, pName, pStart, pEnd, pClass, pLink, pMile, pRes, pComp, pGroup, pParent, pOpen, pDepend, pCaption, pNotes, pGanttVar, pCost, pPlanStart, pPlanEnd, pDuration, void 0, void 0, pClass));
            }
          }
        } else {
          Task = pXmlDoc.getElementsByTagName("task");
          n = Task.length;
          for (i = 0; i < n; i++) {
            var pID = exports.getXMLNodeValue(Task[i], "pID", 1, 0);
            if (pID != 0) {
              var pName = exports.getXMLNodeValue(Task[i], "pName", 2, "No Task Name");
              var pStart = exports.getXMLNodeValue(Task[i], "pStart", 2, "");
              var pEnd = exports.getXMLNodeValue(Task[i], "pEnd", 2, "");
              var pPlanStart = exports.getXMLNodeValue(Task[i], "pPlanStart", 2, "");
              var pPlanEnd = exports.getXMLNodeValue(Task[i], "pPlanEnd", 2, "");
              var pDuration = exports.getXMLNodeValue(Task[i], "pDuration", 2, "");
              var pLink = exports.getXMLNodeValue(Task[i], "pLink", 2, "");
              var pMile = exports.getXMLNodeValue(Task[i], "pMile", 1, 0);
              var pComp = exports.getXMLNodeValue(Task[i], "pComp", 1, 0);
              var pCost = exports.getXMLNodeValue(Task[i], "pCost", 2, 0);
              var pGroup = exports.getXMLNodeValue(Task[i], "pGroup", 1, 0);
              var pParent = exports.getXMLNodeValue(Task[i], "pParent", 1, 0);
              var pRes = exports.getXMLNodeValue(Task[i], "pRes", 2, "");
              var pOpen = exports.getXMLNodeValue(Task[i], "pOpen", 1, 1);
              var pDepend = exports.getXMLNodeValue(Task[i], "pDepend", 2, "");
              var pCaption = exports.getXMLNodeValue(Task[i], "pCaption", 2, "");
              var pNotes = exports.getXMLNodeValue(Task[i], "pNotes", 2, "");
              var pClass = exports.getXMLNodeValue(Task[i], "pClass", 2, "");
              var pPlanClass = exports.getXMLNodeValue(Task[i], "pPlanClass", 2, "");
              if (typeof pClass == "undefined") {
                if (pGroup > 0)
                  pClass = "ggroupblack";
                else if (pMile > 0)
                  pClass = "gmilestone";
                else
                  pClass = "gtaskblue";
              }
              if (typeof pPlanClass == "undefined")
                pPlanClass = pClass;
              pGanttVar.AddTaskItem(new task_1.TaskItem(pID, pName, pStart, pEnd, pClass, pLink, pMile, pRes, pComp, pGroup, pParent, pOpen, pDepend, pCaption, pNotes, pGanttVar, pCost, pPlanStart, pPlanEnd, pDuration, void 0, void 0, pPlanClass));
            }
          }
        }
      };
      exports.getXMLProject = function() {
        var vProject = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><project xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">';
        for (var i = 0; i < this.vTaskList.length; i++) {
          vProject += this.getXMLTask(i, true);
        }
        vProject += "</project>";
        return vProject;
      };
      exports.getXMLTask = function(pID, pIdx) {
        var i = 0;
        var vIdx = -1;
        var vTask = "";
        var vOutFrmt = date_utils_1.parseDateFormatStr(this.getDateInputFormat() + " HH:MI:SS");
        if (pIdx === true)
          vIdx = pID;
        else {
          for (i = 0; i < this.vTaskList.length; i++) {
            if (this.vTaskList[i].getID() == pID) {
              vIdx = i;
              break;
            }
          }
        }
        if (vIdx >= 0 && vIdx < this.vTaskList.length) {
          vTask = "<task>";
          vTask += "<pID>" + this.vTaskList[vIdx].getID() + "</pID>";
          vTask += "<pName>" + this.vTaskList[vIdx].getName() + "</pName>";
          vTask += "<pStart>" + date_utils_1.formatDateStr(this.vTaskList[vIdx].getStart(), vOutFrmt, this.vLangs[this.vLang]) + "</pStart>";
          vTask += "<pEnd>" + date_utils_1.formatDateStr(this.vTaskList[vIdx].getEnd(), vOutFrmt, this.vLangs[this.vLang]) + "</pEnd>";
          vTask += "<pPlanStart>" + date_utils_1.formatDateStr(this.vTaskList[vIdx].getPlanStart(), vOutFrmt, this.vLangs[this.vLang]) + "</pPlanStart>";
          vTask += "<pPlanEnd>" + date_utils_1.formatDateStr(this.vTaskList[vIdx].getPlanEnd(), vOutFrmt, this.vLangs[this.vLang]) + "</pPlanEnd>";
          vTask += "<pDuration>" + this.vTaskList[vIdx].getDuration() + "</pDuration>";
          vTask += "<pClass>" + this.vTaskList[vIdx].getClass() + "</pClass>";
          vTask += "<pLink>" + this.vTaskList[vIdx].getLink() + "</pLink>";
          vTask += "<pMile>" + this.vTaskList[vIdx].getMile() + "</pMile>";
          if (this.vTaskList[vIdx].getResource() != "\xA0")
            vTask += "<pRes>" + this.vTaskList[vIdx].getResource() + "</pRes>";
          vTask += "<pComp>" + this.vTaskList[vIdx].getCompVal() + "</pComp>";
          vTask += "<pCost>" + this.vTaskList[vIdx].getCost() + "</pCost>";
          vTask += "<pGroup>" + this.vTaskList[vIdx].getGroup() + "</pGroup>";
          vTask += "<pParent>" + this.vTaskList[vIdx].getParent() + "</pParent>";
          vTask += "<pOpen>" + this.vTaskList[vIdx].getOpen() + "</pOpen>";
          vTask += "<pDepend>";
          var vDepList = this.vTaskList[vIdx].getDepend();
          for (i = 0; i < vDepList.length; i++) {
            if (i > 0)
              vTask += ",";
            if (vDepList[i] > 0)
              vTask += vDepList[i] + this.vTaskList[vIdx].getDepType()[i];
          }
          vTask += "</pDepend>";
          vTask += "<pCaption>" + this.vTaskList[vIdx].getCaption() + "</pCaption>";
          var vTmpFrag = document.createDocumentFragment();
          var vTmpDiv = draw_utils_1.newNode(vTmpFrag, "div", null, null, this.vTaskList[vIdx].getNotes().innerHTML);
          vTask += "<pNotes>" + vTmpDiv.innerHTML + "</pNotes>";
          vTask += "<pPlanClass>" + this.vTaskList[vIdx].getPlanClass() + "</pPlanClass>";
          vTask += "</task>";
        }
        return vTask;
      };
    }
  });

  // build/lang-en.js
  var require_lang_en = __commonJS({
    "build/lang-en.js"(exports, module) {
      module.exports = {
        en: {
          format: "Format",
          hour: "Hour",
          day: "Day",
          week: "Week",
          month: "Month",
          quarter: "Quarter",
          hours: "Hours",
          days: "Days",
          weeks: "Weeks",
          months: "Months",
          quarters: "Quarters",
          hr: "Hr",
          dy: "Day",
          wk: "Wk",
          mth: "Mth",
          qtr: "Qtr",
          hrs: "Hrs",
          dys: "Days",
          wks: "Wks",
          mths: "Mths",
          qtrs: "Qtrs",
          res: "Resource",
          dur: "Duration",
          comp: "% Comp.",
          completion: "Completion",
          startdate: "Start Date",
          planstartdate: "Plan Start Date",
          enddate: "End Date",
          planenddate: "Plan End Date",
          cost: "Cost",
          moreinfo: "More Information",
          nodata: "No tasks found",
          notes: "Notes",
          january: "January",
          february: "February",
          march: "March",
          april: "April",
          maylong: "May",
          june: "June",
          july: "July",
          august: "August",
          september: "September",
          october: "October",
          november: "November",
          december: "December",
          jan: "Jan",
          feb: "Feb",
          mar: "Mar",
          apr: "Apr",
          may: "May",
          jun: "Jun",
          jul: "Jul",
          aug: "Aug",
          sep: "Sep",
          oct: "Oct",
          nov: "Nov",
          dec: "Dec",
          sunday: "Sunday",
          monday: "Monday",
          tuesday: "Tuesday",
          wednesday: "Wednesday",
          thursday: "Thursday",
          friday: "Friday",
          saturday: "Saturday",
          sun: "Sun",
          mon: "Mon",
          tue: "Tue",
          wed: "Wed",
          thu: "Thu",
          fri: "Fri",
          sat: "Sat",
          tooltipLoading: "Loading..."
        }
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/draw_columns.js
  var require_draw_columns = __commonJS({
    "node_modules/jsgantt-improved/dist/src/draw_columns.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.draw_task_headings = exports.draw_bottom = exports.draw_header = exports.COLUMN_ORDER = void 0;
      var date_utils_1 = require_date_utils();
      var task_1 = require_task();
      var events_1 = require_events();
      var draw_utils_1 = require_draw_utils();
      exports.COLUMN_ORDER = [
        "vShowRes",
        "vShowDur",
        "vShowComp",
        "vShowStartDate",
        "vShowEndDate",
        "vShowPlanStartDate",
        "vShowPlanEndDate",
        "vShowCost",
        "vAdditionalHeaders",
        "vShowAddEntries"
      ];
      var COLUMNS_TYPES = {
        "vShowRes": "res",
        "vShowDur": "dur",
        "vShowComp": "comp",
        "vShowStartDate": "startdate",
        "vShowEndDate": "enddate",
        "vShowPlanStartDate": "planstartdate",
        "vShowPlanEndDate": "planenddate",
        "vShowCost": "cost",
        "vShowAddEntries": "addentries"
      };
      exports.draw_header = function(column, i, vTmpRow, vTaskList, vEditable, vEventsChange, vEvents, vDateTaskTableDisplayFormat, vAdditionalHeaders, vFormat, vLangs, vLang, vResources, Draw) {
        var vTmpCell, vTmpDiv;
        if ("vShowRes" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gres");
          var text = draw_utils_1.makeInput(vTaskList[i].getResource(), vEditable, "resource", vTaskList[i].getResource(), vResources);
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setResource(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "res", Draw, "change");
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "res");
        }
        if ("vShowDur" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gdur");
          var text = draw_utils_1.makeInput(vTaskList[i].getDuration(vFormat, vLangs[vLang]), vEditable, "text", vTaskList[i].getDuration());
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setDuration(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "dur", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "dur");
        }
        if ("vShowComp" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gcomp");
          var text = draw_utils_1.makeInput(vTaskList[i].getCompStr(), vEditable, "percentage", vTaskList[i].getCompVal());
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            task.setComp(e.target.value);
            task.setCompVal(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "comp", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "comp");
        }
        if ("vShowStartDate" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gstartdate");
          var v = date_utils_1.formatDateStr(vTaskList[i].getStartVar(), vDateTaskTableDisplayFormat, vLangs[vLang]);
          var text = draw_utils_1.makeInput(v, vEditable, "date", vTaskList[i].getStartVar());
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setStart(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "start", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "start");
        }
        if ("vShowEndDate" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "genddate");
          var v = date_utils_1.formatDateStr(vTaskList[i].getEndVar(), vDateTaskTableDisplayFormat, vLangs[vLang]);
          var text = draw_utils_1.makeInput(v, vEditable, "date", vTaskList[i].getEndVar());
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setEnd(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "end", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "end");
        }
        if ("vShowPlanStartDate" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gplanstartdate");
          var v = vTaskList[i].getPlanStart() ? date_utils_1.formatDateStr(vTaskList[i].getPlanStart(), vDateTaskTableDisplayFormat, vLangs[vLang]) : "";
          var text = draw_utils_1.makeInput(v, vEditable, "date", vTaskList[i].getPlanStart());
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setPlanStart(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "planstart", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "planstart");
        }
        if ("vShowPlanEndDate" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gplanenddate");
          var v = vTaskList[i].getPlanEnd() ? date_utils_1.formatDateStr(vTaskList[i].getPlanEnd(), vDateTaskTableDisplayFormat, vLangs[vLang]) : "";
          var text = draw_utils_1.makeInput(v, vEditable, "date", vTaskList[i].getPlanEnd());
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setPlanEnd(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "planend", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "planend");
        }
        if ("vShowCost" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gcost");
          var text = draw_utils_1.makeInput(vTaskList[i].getCost(), vEditable, "cost");
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, text);
          var callback = function(task, e) {
            return task.setCost(e.target.value);
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "cost", Draw);
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "cost");
        }
        if ("vAdditionalHeaders" === column && vAdditionalHeaders) {
          for (var key in vAdditionalHeaders) {
            var header = vAdditionalHeaders[key];
            var css = header.class ? header.class : "gadditional-" + key;
            var data = vTaskList[i].getDataObject();
            vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gadditional " + css);
            vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, data ? data[key] : "");
            events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "additional_" + key);
          }
        }
        if ("vShowAddEntries" === column) {
          vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gaddentries");
          var button = "<button>+</button>";
          vTmpDiv = draw_utils_1.newNode(vTmpCell, "div", null, null, button);
          var callback = function(task, e) {
            task_1.AddTaskItemObject({
              vParent: task.getParent()
            });
          };
          events_1.addListenerInputCell(vTmpCell, vEventsChange, callback, vTaskList, i, "addentries", Draw.bind(this));
          events_1.addListenerClickCell(vTmpCell, vEvents, vTaskList[i], "addentries");
        }
      };
      exports.draw_bottom = function(column, vTmpRow, vAdditionalHeaders) {
        if ("vAdditionalHeaders" === column && vAdditionalHeaders) {
          for (var key in vAdditionalHeaders) {
            var header = vAdditionalHeaders[key];
            var css = header.class ? header.class : "gadditional-" + key;
            draw_utils_1.newNode(vTmpRow, "td", null, "gspanning gadditional " + css, "\xA0");
          }
        } else {
          var type = COLUMNS_TYPES[column];
          draw_utils_1.newNode(vTmpRow, "td", null, "gspanning g" + type, "\xA0");
        }
      };
      exports.draw_task_headings = function(column, vTmpRow, vLangs, vLang, vAdditionalHeaders, vEvents) {
        var nodeCreated;
        if ("vAdditionalHeaders" === column && vAdditionalHeaders) {
          for (var key in vAdditionalHeaders) {
            var header = vAdditionalHeaders[key];
            var text = header.translate ? vLangs[vLang][header.translate] : header.title;
            var css = header.class ? header.class : "gadditional-" + key;
            nodeCreated = draw_utils_1.newNode(vTmpRow, "td", null, "gtaskheading gadditional " + css, text);
          }
        } else {
          var type = COLUMNS_TYPES[column];
          nodeCreated = draw_utils_1.newNode(vTmpRow, "td", null, "gtaskheading g" + type, vLangs[vLang][type]);
          events_1.addListenerClickCell(nodeCreated, vEvents, { hader: true, column }, type);
        }
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/draw_dependencies.js
  var require_draw_dependencies = __commonJS({
    "node_modules/jsgantt-improved/dist/src/draw_dependencies.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.DrawDependencies = exports.drawDependency = void 0;
      exports.drawDependency = function(x1, y1, x2, y2, pType, pClass) {
        var vDir = 1;
        var vBend = false;
        var vShort = 4;
        var vRow = Math.floor(this.getRowHeight() / 2);
        if (y2 < y1)
          vRow *= -1;
        switch (pType) {
          case "SF":
            vShort *= -1;
            if (x1 - 10 <= x2 && y1 != y2)
              vBend = true;
            vDir = -1;
            break;
          case "SS":
            if (x1 < x2)
              vShort *= -1;
            else
              vShort = x2 - x1 - 2 * vShort;
            break;
          case "FF":
            if (x1 <= x2)
              vShort = x2 - x1 + 2 * vShort;
            vDir = -1;
            break;
          default:
            if (x1 + 10 >= x2 && y1 != y2)
              vBend = true;
            break;
        }
        if (vBend) {
          this.sLine(x1, y1, x1 + vShort, y1, pClass);
          this.sLine(x1 + vShort, y1, x1 + vShort, y2 - vRow, pClass);
          this.sLine(x1 + vShort, y2 - vRow, x2 - vShort * 2, y2 - vRow, pClass);
          this.sLine(x2 - vShort * 2, y2 - vRow, x2 - vShort * 2, y2, pClass);
          this.sLine(x2 - vShort * 2, y2, x2 - 1 * vDir, y2, pClass);
        } else if (y1 != y2) {
          this.sLine(x1, y1, x1 + vShort, y1, pClass);
          this.sLine(x1 + vShort, y1, x1 + vShort, y2, pClass);
          this.sLine(x1 + vShort, y2, x2 - 1 * vDir, y2, pClass);
        } else
          this.sLine(x1, y1, x2 - 1 * vDir, y2, pClass);
        var vTmpDiv = this.sLine(x2, y2, x2 - 3 - (vDir < 0 ? 1 : 0), y2 - 3 - (vDir < 0 ? 1 : 0), pClass + "Arw");
        vTmpDiv.style.width = "0px";
        vTmpDiv.style.height = "0px";
      };
      exports.DrawDependencies = function(vDebug) {
        if (vDebug === void 0) {
          vDebug = false;
        }
        if (this.getShowDeps() == 1) {
          this.CalcTaskXY();
          this.clearDependencies();
          var vList = this.getList();
          for (var i = 0; i < vList.length; i++) {
            var vDepend = vList[i].getDepend();
            var vDependType = vList[i].getDepType();
            var n = vDepend.length;
            if (n > 0 && vList[i].getVisible() == 1) {
              for (var k = 0; k < n; k++) {
                var vTask = this.getArrayLocationByID(vDepend[k]);
                if (vTask >= 0 && vList[vTask].getGroup() != 2) {
                  if (vList[vTask].getVisible() == 1) {
                    if (vDebug) {
                      console.info("init drawDependency ", vList[vTask].getID(), /* @__PURE__ */ new Date());
                    }
                    var cssClass = "gDepId" + vList[vTask].getID() + " gDepNextId" + vList[i].getID();
                    var dependedData = vList[vTask].getDataObject();
                    var nextDependedData = vList[i].getDataObject();
                    if (dependedData && dependedData.pID && nextDependedData && nextDependedData.pID) {
                      cssClass += " gDepDataId" + dependedData.pID + " gDepNextDataId" + nextDependedData.pID;
                    }
                    if (vDependType[k] == "SS")
                      this.drawDependency(vList[vTask].getStartX() - 1, vList[vTask].getStartY(), vList[i].getStartX() - 1, vList[i].getStartY(), "SS", cssClass + " gDepSS");
                    else if (vDependType[k] == "FF")
                      this.drawDependency(vList[vTask].getEndX(), vList[vTask].getEndY(), vList[i].getEndX(), vList[i].getEndY(), "FF", cssClass + " gDepFF");
                    else if (vDependType[k] == "SF")
                      this.drawDependency(vList[vTask].getStartX() - 1, vList[vTask].getStartY(), vList[i].getEndX(), vList[i].getEndY(), "SF", cssClass + " gDepSF");
                    else if (vDependType[k] == "FS")
                      this.drawDependency(vList[vTask].getEndX(), vList[vTask].getEndY(), vList[i].getStartX() - 1, vList[i].getStartY(), "FS", cssClass + " gDepFS");
                  }
                }
              }
            }
          }
        }
        if (this.vTodayPx >= 0) {
          this.sLine(this.vTodayPx, 0, this.vTodayPx, this.getChartTable().offsetHeight - 1, "gCurDate");
        }
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/options.js
  var require_options = __commonJS({
    "node_modules/jsgantt-improved/dist/src/options.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.includeGetSet = void 0;
      var date_utils_1 = require_date_utils();
      var draw_columns_1 = require_draw_columns();
      exports.includeGetSet = function() {
        this.setOptions = function(options) {
          var keys = Object.keys(options);
          for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = options[key];
            if (key === "vResources" || key === "vColumnOrder") {
              this["set" + key.substr(1)](val);
            } else if (val instanceof Array) {
              this["set" + key.substr(1)].apply(this, val);
            } else {
              this["set" + key.substr(1)](val);
            }
          }
        };
        this.setUseFade = function(pVal) {
          this.vUseFade = pVal;
        };
        this.setUseMove = function(pVal) {
          this.vUseMove = pVal;
        };
        this.setUseRowHlt = function(pVal) {
          this.vUseRowHlt = pVal;
        };
        this.setUseToolTip = function(pVal) {
          this.vUseToolTip = pVal;
        };
        this.setUseSort = function(pVal) {
          this.vUseSort = pVal;
        };
        this.setUseSingleCell = function(pVal) {
          this.vUseSingleCell = pVal * 1;
        };
        this.setFormatArr = function() {
          var vValidFormats = "hour day week month quarter";
          this.vFormatArr = new Array();
          for (var i = 0, j = 0; i < arguments.length; i++) {
            if (vValidFormats.indexOf(arguments[i].toLowerCase()) != -1 && arguments[i].length > 1) {
              this.vFormatArr[j++] = arguments[i].toLowerCase();
              var vRegExp = new RegExp("(?:^|s)" + arguments[i] + "(?!S)", "g");
              vValidFormats = vValidFormats.replace(vRegExp, "");
            }
          }
        };
        this.setShowRes = function(pVal) {
          this.vShowRes = pVal;
        };
        this.setShowDur = function(pVal) {
          this.vShowDur = pVal;
        };
        this.setShowComp = function(pVal) {
          this.vShowComp = pVal;
        };
        this.setShowStartDate = function(pVal) {
          this.vShowStartDate = pVal;
        };
        this.setShowEndDate = function(pVal) {
          this.vShowEndDate = pVal;
        };
        this.setShowPlanStartDate = function(pVal) {
          this.vShowPlanStartDate = pVal;
        };
        this.setShowPlanEndDate = function(pVal) {
          this.vShowPlanEndDate = pVal;
        };
        this.setShowCost = function(pVal) {
          this.vShowCost = pVal;
        };
        this.setShowAddEntries = function(pVal) {
          this.vShowAddEntries = pVal;
        };
        this.setShowTaskInfoRes = function(pVal) {
          this.vShowTaskInfoRes = pVal;
        };
        this.setShowTaskInfoDur = function(pVal) {
          this.vShowTaskInfoDur = pVal;
        };
        this.setShowTaskInfoComp = function(pVal) {
          this.vShowTaskInfoComp = pVal;
        };
        this.setShowTaskInfoStartDate = function(pVal) {
          this.vShowTaskInfoStartDate = pVal;
        };
        this.setShowTaskInfoEndDate = function(pVal) {
          this.vShowTaskInfoEndDate = pVal;
        };
        this.setShowTaskInfoNotes = function(pVal) {
          this.vShowTaskInfoNotes = pVal;
        };
        this.setShowTaskInfoLink = function(pVal) {
          this.vShowTaskInfoLink = pVal;
        };
        this.setShowEndWeekDate = function(pVal) {
          this.vShowEndWeekDate = pVal;
        };
        this.setShowWeekends = function(pVal) {
          this.vShowWeekends = pVal;
        };
        this.setShowSelector = function() {
          var vValidSelectors = "top bottom";
          this.vShowSelector = new Array();
          for (var i = 0, j = 0; i < arguments.length; i++) {
            if (vValidSelectors.indexOf(arguments[i].toLowerCase()) != -1 && arguments[i].length > 1) {
              this.vShowSelector[j++] = arguments[i].toLowerCase();
              var vRegExp = new RegExp("(?:^|s)" + arguments[i] + "(?!S)", "g");
              vValidSelectors = vValidSelectors.replace(vRegExp, "");
            }
          }
        };
        this.setShowDeps = function(pVal) {
          this.vShowDeps = pVal;
        };
        this.setDateInputFormat = function(pVal) {
          this.vDateInputFormat = pVal;
        };
        this.setDateTaskTableDisplayFormat = function(pVal) {
          this.vDateTaskTableDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setDateTaskDisplayFormat = function(pVal) {
          this.vDateTaskDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setHourMajorDateDisplayFormat = function(pVal) {
          this.vHourMajorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setHourMinorDateDisplayFormat = function(pVal) {
          this.vHourMinorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setDayMajorDateDisplayFormat = function(pVal) {
          this.vDayMajorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setDayMinorDateDisplayFormat = function(pVal) {
          this.vDayMinorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setWeekMajorDateDisplayFormat = function(pVal) {
          this.vWeekMajorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setWeekMinorDateDisplayFormat = function(pVal) {
          this.vWeekMinorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setMonthMajorDateDisplayFormat = function(pVal) {
          this.vMonthMajorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setMonthMinorDateDisplayFormat = function(pVal) {
          this.vMonthMinorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setQuarterMajorDateDisplayFormat = function(pVal) {
          this.vQuarterMajorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setQuarterMinorDateDisplayFormat = function(pVal) {
          this.vQuarterMinorDateDisplayFormat = date_utils_1.parseDateFormatStr(pVal);
        };
        this.setCaptionType = function(pType) {
          this.vCaptionType = pType;
        };
        this.setFormat = function(pFormat) {
          this.vFormat = pFormat;
          this.Draw();
        };
        this.setWorkingDays = function(workingDays) {
          this.vWorkingDays = workingDays;
        };
        this.setMinGpLen = function(pMinGpLen) {
          this.vMinGpLen = pMinGpLen;
        };
        this.setScrollTo = function(pDate) {
          this.vScrollTo = pDate;
        };
        this.setHourColWidth = function(pWidth) {
          this.vHourColWidth = pWidth;
        };
        this.setDayColWidth = function(pWidth) {
          this.vDayColWidth = pWidth;
        };
        this.setWeekColWidth = function(pWidth) {
          this.vWeekColWidth = pWidth;
        };
        this.setMonthColWidth = function(pWidth) {
          this.vMonthColWidth = pWidth;
        };
        this.setQuarterColWidth = function(pWidth) {
          this.vQuarterColWidth = pWidth;
        };
        this.setRowHeight = function(pHeight) {
          this.vRowHeight = pHeight;
        };
        this.setLang = function(pLang) {
          if (this.vLangs[pLang])
            this.vLang = pLang;
        };
        this.setChartBody = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            this.vChartBody = pDiv;
        };
        this.setChartHead = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            this.vChartHead = pDiv;
        };
        this.setListBody = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            this.vListBody = pDiv;
        };
        this.setChartTable = function(pTable) {
          if (typeof HTMLTableElement !== "function" || pTable instanceof HTMLTableElement)
            this.vChartTable = pTable;
        };
        this.setLines = function(pDiv) {
          if (typeof HTMLDivElement !== "function" || pDiv instanceof HTMLDivElement)
            this.vLines = pDiv;
        };
        this.setLineOptions = function(lineOptions) {
          this.vLineOptions = lineOptions;
        };
        this.setTimer = function(pVal) {
          this.vTimer = pVal * 1;
        };
        this.setTooltipDelay = function(pVal) {
          this.vTooltipDelay = pVal * 1;
        };
        this.setTooltipTemplate = function(pVal) {
          this.vTooltipTemplate = pVal;
        };
        this.setMinDate = function(pVal) {
          this.vMinDate = pVal;
        };
        this.setMaxDate = function(pVal) {
          this.vMaxDate = pVal;
        };
        this.addLang = function(pLang, pVals) {
          if (!this.vLangs[pLang]) {
            this.vLangs[pLang] = new Object();
            for (var vKey in this.vLangs["en"])
              this.vLangs[pLang][vKey] = pVals[vKey] ? document.createTextNode(pVals[vKey]).data : this.vLangs["en"][vKey];
          }
        };
        this.setCustomLang = function(pVals) {
          this.vLangs[this.vLang] = new Object();
          for (var vKey in this.vLangs["en"]) {
            this.vLangs[this.vLang][vKey] = pVals[vKey] ? document.createTextNode(pVals[vKey]).data : this.vLangs["en"][vKey];
          }
        };
        this.setTotalHeight = function(pVal) {
          this.vTotalHeight = pVal;
        };
        this.setEvents = function(pEvents) {
          this.vEvents = pEvents;
        };
        this.setEventsChange = function(pEventsChange) {
          this.vEventsChange = pEventsChange;
        };
        this.setEventClickRow = function(fn) {
          this.vEventClickRow = fn;
        };
        this.setEventClickCollapse = function(fn) {
          this.vEventClickCollapse = fn;
        };
        this.setResources = function(resources) {
          this.vResources = resources;
        };
        this.setAdditionalHeaders = function(headers) {
          this.vAdditionalHeaders = headers;
        };
        this.setColumnOrder = function(order) {
          this.vColumnOrder = order;
        };
        this.setEditable = function(editable) {
          this.vEditable = editable;
        };
        this.setDebug = function(debug) {
          this.vDebug = debug;
        };
        this.getDivId = function() {
          return this.vDivId;
        };
        this.getUseFade = function() {
          return this.vUseFade;
        };
        this.getUseMove = function() {
          return this.vUseMove;
        };
        this.getUseRowHlt = function() {
          return this.vUseRowHlt;
        };
        this.getUseToolTip = function() {
          return this.vUseToolTip;
        };
        this.getUseSort = function() {
          return this.vUseSort;
        };
        this.getUseSingleCell = function() {
          return this.vUseSingleCell;
        };
        this.getFormatArr = function() {
          return this.vFormatArr;
        };
        this.getShowRes = function() {
          return this.vShowRes;
        };
        this.getShowDur = function() {
          return this.vShowDur;
        };
        this.getShowComp = function() {
          return this.vShowComp;
        };
        this.getShowStartDate = function() {
          return this.vShowStartDate;
        };
        this.getShowEndDate = function() {
          return this.vShowEndDate;
        };
        this.getShowPlanStartDate = function() {
          return this.vShowPlanStartDate;
        };
        this.getShowPlanEndDate = function() {
          return this.vShowPlanEndDate;
        };
        this.getShowCost = function() {
          return this.vShowCost;
        };
        this.getShowAddEntries = function() {
          return this.vShowAddEntries;
        };
        this.getShowTaskInfoRes = function() {
          return this.vShowTaskInfoRes;
        };
        this.getShowTaskInfoDur = function() {
          return this.vShowTaskInfoDur;
        };
        this.getShowTaskInfoComp = function() {
          return this.vShowTaskInfoComp;
        };
        this.getShowTaskInfoStartDate = function() {
          return this.vShowTaskInfoStartDate;
        };
        this.getShowTaskInfoEndDate = function() {
          return this.vShowTaskInfoEndDate;
        };
        this.getShowTaskInfoNotes = function() {
          return this.vShowTaskInfoNotes;
        };
        this.getShowTaskInfoLink = function() {
          return this.vShowTaskInfoLink;
        };
        this.getShowEndWeekDate = function() {
          return this.vShowEndWeekDate;
        };
        this.getShowWeekends = function() {
          return this.vShowWeekends;
        };
        this.getShowSelector = function() {
          return this.vShowSelector;
        };
        this.getShowDeps = function() {
          return this.vShowDeps;
        };
        this.getDateInputFormat = function() {
          return this.vDateInputFormat;
        };
        this.getDateTaskTableDisplayFormat = function() {
          return this.vDateTaskTableDisplayFormat;
        };
        this.getDateTaskDisplayFormat = function() {
          return this.vDateTaskDisplayFormat;
        };
        this.getHourMajorDateDisplayFormat = function() {
          return this.vHourMajorDateDisplayFormat;
        };
        this.getHourMinorDateDisplayFormat = function() {
          return this.vHourMinorDateDisplayFormat;
        };
        this.getDayMajorDateDisplayFormat = function() {
          return this.vDayMajorDateDisplayFormat;
        };
        this.getDayMinorDateDisplayFormat = function() {
          return this.vDayMinorDateDisplayFormat;
        };
        this.getWeekMajorDateDisplayFormat = function() {
          return this.vWeekMajorDateDisplayFormat;
        };
        this.getWeekMinorDateDisplayFormat = function() {
          return this.vWeekMinorDateDisplayFormat;
        };
        this.getMonthMajorDateDisplayFormat = function() {
          return this.vMonthMajorDateDisplayFormat;
        };
        this.getMonthMinorDateDisplayFormat = function() {
          return this.vMonthMinorDateDisplayFormat;
        };
        this.getQuarterMajorDateDisplayFormat = function() {
          return this.vQuarterMajorDateDisplayFormat;
        };
        this.getQuarterMinorDateDisplayFormat = function() {
          return this.vQuarterMinorDateDisplayFormat;
        };
        this.getCaptionType = function() {
          return this.vCaptionType;
        };
        this.getMinGpLen = function() {
          return this.vMinGpLen;
        };
        this.getScrollTo = function() {
          return this.vScrollTo;
        };
        this.getHourColWidth = function() {
          return this.vHourColWidth;
        };
        this.getDayColWidth = function() {
          return this.vDayColWidth;
        };
        this.getWeekColWidth = function() {
          return this.vWeekColWidth;
        };
        this.getMonthColWidth = function() {
          return this.vMonthColWidth;
        };
        this.getQuarterColWidth = function() {
          return this.vQuarterColWidth;
        };
        this.getRowHeight = function() {
          return this.vRowHeight;
        };
        this.getChartBody = function() {
          return this.vChartBody;
        };
        this.getChartHead = function() {
          return this.vChartHead;
        };
        this.getListBody = function() {
          return this.vListBody;
        };
        this.getChartTable = function() {
          return this.vChartTable;
        };
        this.getLines = function() {
          return this.vLines;
        };
        this.getTimer = function() {
          return this.vTimer;
        };
        this.getMinDate = function() {
          return this.vMinDate;
        };
        this.getMaxDate = function() {
          return this.vMaxDate;
        };
        this.getTooltipDelay = function() {
          return this.vTooltipDelay;
        };
        this.getList = function() {
          return this.vTaskList;
        };
        this.getEventsClickCell = function() {
          return this.vEvents;
        };
        this.getEventsChange = function() {
          return this.vEventsChange;
        };
        this.getEventClickRow = function() {
          return this.vEventClickRow;
        };
        this.getEventClickCollapse = function() {
          return this.vEventClickCollapse;
        };
        this.getResources = function() {
          return this.vResources;
        };
        this.getAdditionalHeaders = function() {
          return this.vAdditionalHeaders;
        };
        this.getColumnOrder = function() {
          return this.vColumnOrder || draw_columns_1.COLUMN_ORDER;
        };
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/draw.js
  var require_draw = __commonJS({
    "node_modules/jsgantt-improved/dist/src/draw.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.GanttChart = void 0;
      var lang = require_lang_en();
      var events_1 = require_events();
      var general_utils_1 = require_general_utils();
      var task_1 = require_task();
      var xml_1 = require_xml();
      var draw_columns_1 = require_draw_columns();
      var draw_utils_1 = require_draw_utils();
      var draw_dependencies_1 = require_draw_dependencies();
      var options_1 = require_options();
      var date_utils_1 = require_date_utils();
      exports.GanttChart = function(pDiv, pFormat) {
        this.vDiv = pDiv;
        this.vFormat = pFormat;
        this.vDivId = null;
        this.vUseFade = 1;
        this.vUseMove = 1;
        this.vUseRowHlt = 1;
        this.vUseToolTip = 1;
        this.vUseSort = 1;
        this.vUseSingleCell = 25e3;
        this.vShowRes = 1;
        this.vShowDur = 1;
        this.vShowComp = 1;
        this.vShowStartDate = 1;
        this.vShowEndDate = 1;
        this.vShowPlanStartDate = 0;
        this.vShowPlanEndDate = 0;
        this.vShowCost = 0;
        this.vShowAddEntries = 0;
        this.vShowEndWeekDate = 1;
        this.vShowWeekends = 1;
        this.vShowTaskInfoRes = 1;
        this.vShowTaskInfoDur = 1;
        this.vShowTaskInfoComp = 1;
        this.vShowTaskInfoStartDate = 1;
        this.vShowTaskInfoEndDate = 1;
        this.vShowTaskInfoNotes = 1;
        this.vShowTaskInfoLink = 0;
        this.vShowDeps = 1;
        this.vTotalHeight = void 0;
        this.vWorkingDays = {
          0: true,
          1: true,
          2: true,
          3: true,
          4: true,
          5: true,
          6: true
        };
        this.vEventClickCollapse = null;
        this.vEventClickRow = null;
        this.vEvents = {
          taskname: null,
          res: null,
          dur: null,
          comp: null,
          startdate: null,
          enddate: null,
          planstartdate: null,
          planenddate: null,
          cost: null,
          beforeDraw: null,
          afterDraw: null,
          beforeLineDraw: null,
          afterLineDraw: null,
          onLineDraw: null,
          onLineContainerHover: null
        };
        this.vEventsChange = {
          taskname: null,
          res: null,
          dur: null,
          comp: null,
          startdate: null,
          enddate: null,
          planstartdate: null,
          planenddate: null,
          cost: null,
          line: null
        };
        this.vResources = null;
        this.vAdditionalHeaders = {};
        this.vColumnOrder = draw_columns_1.COLUMN_ORDER;
        this.vEditable = false;
        this.vDebug = false;
        this.vShowSelector = new Array("top");
        this.vDateInputFormat = "yyyy-mm-dd";
        this.vDateTaskTableDisplayFormat = date_utils_1.parseDateFormatStr("dd/mm/yyyy");
        this.vDateTaskDisplayFormat = date_utils_1.parseDateFormatStr("dd month yyyy");
        this.vHourMajorDateDisplayFormat = date_utils_1.parseDateFormatStr("day dd month yyyy");
        this.vHourMinorDateDisplayFormat = date_utils_1.parseDateFormatStr("HH");
        this.vDayMajorDateDisplayFormat = date_utils_1.parseDateFormatStr("dd/mm/yyyy");
        this.vDayMinorDateDisplayFormat = date_utils_1.parseDateFormatStr("dd");
        this.vWeekMajorDateDisplayFormat = date_utils_1.parseDateFormatStr("yyyy");
        this.vWeekMinorDateDisplayFormat = date_utils_1.parseDateFormatStr("dd/mm");
        this.vMonthMajorDateDisplayFormat = date_utils_1.parseDateFormatStr("yyyy");
        this.vMonthMinorDateDisplayFormat = date_utils_1.parseDateFormatStr("mon");
        this.vQuarterMajorDateDisplayFormat = date_utils_1.parseDateFormatStr("yyyy");
        this.vQuarterMinorDateDisplayFormat = date_utils_1.parseDateFormatStr("qq");
        this.vUseFullYear = date_utils_1.parseDateFormatStr("dd/mm/yyyy");
        this.vCaptionType;
        this.vDepId = 1;
        this.vTaskList = new Array();
        this.vFormatArr = new Array("hour", "day", "week", "month", "quarter");
        this.vMonthDaysArr = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        this.vProcessNeeded = true;
        this.vMinGpLen = 8;
        this.vScrollTo = "";
        this.vHourColWidth = 18;
        this.vDayColWidth = 18;
        this.vWeekColWidth = 36;
        this.vMonthColWidth = 36;
        this.vQuarterColWidth = 18;
        this.vRowHeight = 20;
        this.vTodayPx = -1;
        this.vLangs = lang;
        this.vLang = navigator.language && navigator.language in lang ? navigator.language : "en";
        this.vChartBody = null;
        this.vChartHead = null;
        this.vListBody = null;
        this.vChartTable = null;
        this.vLines = null;
        this.vTimer = 20;
        this.vTooltipDelay = 1500;
        this.vTooltipTemplate = null;
        this.vMinDate = null;
        this.vMaxDate = null;
        this.includeGetSet = options_1.includeGetSet.bind(this);
        this.includeGetSet();
        this.mouseOver = events_1.mouseOver;
        this.mouseOut = events_1.mouseOut;
        this.addListener = events_1.addListener.bind(this);
        this.removeListener = events_1.removeListener.bind(this);
        this.createTaskInfo = task_1.createTaskInfo;
        this.AddTaskItem = task_1.AddTaskItem;
        this.AddTaskItemObject = task_1.AddTaskItemObject;
        this.RemoveTaskItem = task_1.RemoveTaskItem;
        this.ClearTasks = task_1.ClearTasks;
        this.getXMLProject = xml_1.getXMLProject;
        this.getXMLTask = xml_1.getXMLTask;
        this.CalcTaskXY = draw_utils_1.CalcTaskXY.bind(this);
        this.sLine = draw_utils_1.sLine.bind(this);
        this.drawDependency = draw_dependencies_1.drawDependency.bind(this);
        this.DrawDependencies = draw_dependencies_1.DrawDependencies.bind(this);
        this.getArrayLocationByID = draw_utils_1.getArrayLocationByID.bind(this);
        this.drawSelector = draw_utils_1.drawSelector.bind(this);
        this.printChart = general_utils_1.printChart.bind(this);
        this.clearDependencies = function() {
          var parent = this.getLines();
          if (this.vEventsChange.line && typeof this.vEventsChange.line === "function") {
            this.removeListener("click", this.vEventsChange.line, parent);
            this.addListener("click", this.vEventsChange.line, parent);
          }
          while (parent.hasChildNodes())
            parent.removeChild(parent.firstChild);
          this.vDepId = 1;
        };
        this.drawListHead = function(vLeftHeader) {
          var _this = this;
          var vTmpDiv = draw_utils_1.newNode(vLeftHeader, "div", this.vDivId + "glisthead", "glistlbl gcontainercol");
          var gListLbl = vTmpDiv;
          this.setListBody(vTmpDiv);
          var vTmpTab = draw_utils_1.newNode(vTmpDiv, "table", null, "gtasktableh");
          var vTmpTBody = draw_utils_1.newNode(vTmpTab, "tbody");
          var vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr");
          draw_utils_1.newNode(vTmpRow, "td", null, "gtasklist", "\xA0");
          var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gspanning gtaskname", null, null, null, null, this.getColumnOrder().length + 1);
          vTmpCell.appendChild(this.drawSelector("top"));
          vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr");
          draw_utils_1.newNode(vTmpRow, "td", null, "gtasklist", "\xA0");
          draw_utils_1.newNode(vTmpRow, "td", null, "gtaskname", "\xA0");
          this.getColumnOrder().forEach(function(column) {
            if (_this[column] == 1 || column === "vAdditionalHeaders") {
              draw_columns_1.draw_task_headings(column, vTmpRow, _this.vLangs, _this.vLang, _this.vAdditionalHeaders, _this.vEvents);
            }
          });
          return gListLbl;
        };
        this.drawListBody = function(vLeftHeader) {
          var _this = this;
          var vTmpContentTabOuterWrapper = draw_utils_1.newNode(vLeftHeader, "div", null, "gtasktableouterwrapper");
          var vTmpContentTabWrapper = draw_utils_1.newNode(vTmpContentTabOuterWrapper, "div", null, "gtasktablewrapper");
          vTmpContentTabWrapper.style.width = "calc(100% + " + general_utils_1.getScrollbarWidth() + "px)";
          var vTmpContentTab = draw_utils_1.newNode(vTmpContentTabWrapper, "table", null, "gtasktable");
          var vTmpContentTBody = draw_utils_1.newNode(vTmpContentTab, "tbody");
          var vNumRows = 0;
          var _loop_1 = function(i2) {
            var vBGColor = void 0;
            if (this_1.vTaskList[i2].getGroup() == 1)
              vBGColor = "ggroupitem";
            else
              vBGColor = "glineitem a";
            var vID = this_1.vTaskList[i2].getID();
            var vTmpRow_1, vTmpCell_1 = void 0;
            if (!(this_1.vTaskList[i2].getParItem() && this_1.vTaskList[i2].getParItem().getGroup() == 2) || this_1.vTaskList[i2].getGroup() == 2) {
              if (this_1.vTaskList[i2].getVisible() == 0)
                vTmpRow_1 = draw_utils_1.newNode(vTmpContentTBody, "tr", this_1.vDivId + "child_" + vID, "gname " + vBGColor, null, null, null, "none");
              else
                vTmpRow_1 = draw_utils_1.newNode(vTmpContentTBody, "tr", this_1.vDivId + "child_" + vID, "gname " + vBGColor);
              this_1.vTaskList[i2].setListChildRow(vTmpRow_1);
              draw_utils_1.newNode(vTmpRow_1, "td", null, "gtasklist", "\xA0");
              var editableClass = this_1.vEditable ? "gtaskname gtaskeditable" : "gtaskname";
              vTmpCell_1 = draw_utils_1.newNode(vTmpRow_1, "td", null, editableClass);
              var vCellContents = "";
              for (var j = 1; j < this_1.vTaskList[i2].getLevel(); j++) {
                vCellContents += "\xA0\xA0\xA0\xA0";
              }
              var task_2 = this_1.vTaskList[i2];
              var vEventClickRow_1 = this_1.vEventClickRow;
              var vEventClickCollapse_1 = this_1.vEventClickCollapse;
              events_1.addListener("click", function(e) {
                if (e.target.classList.contains("gfoldercollapse") === false) {
                  if (vEventClickRow_1 && typeof vEventClickRow_1 === "function") {
                    vEventClickRow_1(task_2);
                  }
                } else {
                  if (vEventClickCollapse_1 && typeof vEventClickCollapse_1 === "function") {
                    vEventClickCollapse_1(task_2);
                  }
                }
              }, vTmpRow_1);
              if (this_1.vTaskList[i2].getGroup() == 1) {
                var vTmpDiv = draw_utils_1.newNode(vTmpCell_1, "div", null, null, vCellContents);
                var vTmpSpan = draw_utils_1.newNode(vTmpDiv, "span", this_1.vDivId + "group_" + vID, "gfoldercollapse", this_1.vTaskList[i2].getOpen() == 1 ? "-" : "+");
                this_1.vTaskList[i2].setGroupSpan(vTmpSpan);
                events_1.addFolderListeners(this_1, vTmpSpan, vID);
                var divTask = document.createElement("span");
                divTask.innerHTML = "\xA0" + this_1.vTaskList[i2].getName();
                vTmpDiv.appendChild(divTask);
                var callback = function(task, e) {
                  return task.setName(e.target.value);
                };
                events_1.addListenerInputCell(vTmpCell_1, this_1.vEventsChange, callback, this_1.vTaskList, i2, "taskname", this_1.Draw.bind(this_1));
                events_1.addListenerClickCell(vTmpDiv, this_1.vEvents, this_1.vTaskList[i2], "taskname");
              } else {
                vCellContents += "\xA0\xA0\xA0\xA0";
                var text = draw_utils_1.makeInput(this_1.vTaskList[i2].getName(), this_1.vEditable, "text");
                var vTmpDiv = draw_utils_1.newNode(vTmpCell_1, "div", null, null, vCellContents + text);
                var callback = function(task, e) {
                  return task.setName(e.target.value);
                };
                events_1.addListenerInputCell(vTmpCell_1, this_1.vEventsChange, callback, this_1.vTaskList, i2, "taskname", this_1.Draw.bind(this_1));
                events_1.addListenerClickCell(vTmpCell_1, this_1.vEvents, this_1.vTaskList[i2], "taskname");
              }
              this_1.getColumnOrder().forEach(function(column) {
                if (_this[column] == 1 || column === "vAdditionalHeaders") {
                  draw_columns_1.draw_header(column, i2, vTmpRow_1, _this.vTaskList, _this.vEditable, _this.vEventsChange, _this.vEvents, _this.vDateTaskTableDisplayFormat, _this.vAdditionalHeaders, _this.vFormat, _this.vLangs, _this.vLang, _this.vResources, _this.Draw.bind(_this));
                }
              });
              vNumRows++;
            }
          };
          var this_1 = this;
          for (var i = 0; i < this.vTaskList.length; i++) {
            _loop_1(i);
          }
          if (this.vTaskList.length == 0) {
            var totalColumns = this.getColumnOrder().filter(function(column) {
              return _this[column] == 1 || column === "vAdditionalHeaders";
            }).length;
            var vTmpRow_2 = draw_utils_1.newNode(vTmpContentTBody, "tr", this.vDivId + "child_", "gname ");
            var vTmpCell_2 = draw_utils_1.newNode(vTmpRow_2, "td", null, "gtasknolist", "", null, null, null, totalColumns);
            var vOutput = document.createDocumentFragment();
            draw_utils_1.newNode(vOutput, "div", null, "gtasknolist-label", this.vLangs[this.vLang]["nodata"] + ".");
            vTmpCell_2.appendChild(vOutput);
          }
          var vTmpRow = draw_utils_1.newNode(vTmpContentTBody, "tr");
          draw_utils_1.newNode(vTmpRow, "td", null, "gtasklist", "\xA0");
          var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gspanning gtaskname");
          vTmpCell.appendChild(this.drawSelector("bottom"));
          this.getColumnOrder().forEach(function(column) {
            if (_this[column] == 1 || column === "vAdditionalHeaders") {
              draw_columns_1.draw_bottom(column, vTmpRow, _this.vAdditionalHeaders);
            }
          });
          return {
            vNumRows,
            vTmpContentTabWrapper
          };
        };
        this.drawChartHead = function(vMinDate, vMaxDate, vColWidth, vNumRows) {
          var vRightHeader = document.createDocumentFragment();
          var vTmpDiv = draw_utils_1.newNode(vRightHeader, "div", this.vDivId + "gcharthead", "gchartlbl gcontainercol");
          var gChartLbl = vTmpDiv;
          this.setChartHead(vTmpDiv);
          var vTmpTab = draw_utils_1.newNode(vTmpDiv, "table", this.vDivId + "chartTableh", "gcharttableh");
          var vTmpTBody = draw_utils_1.newNode(vTmpTab, "tbody");
          var vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr");
          var vTmpDate = /* @__PURE__ */ new Date();
          vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());
          if (this.vFormat == "hour")
            vTmpDate.setHours(vMinDate.getHours());
          else
            vTmpDate.setHours(0);
          vTmpDate.setMinutes(0);
          vTmpDate.setSeconds(0);
          vTmpDate.setMilliseconds(0);
          var vColSpan = 1;
          while (vTmpDate.getTime() <= vMaxDate.getTime()) {
            var vHeaderCellClass = "gmajorheading";
            var vCellContents = "";
            if (this.vFormat == "day") {
              var colspan = 7;
              if (!this.vShowWeekends) {
                vHeaderCellClass += " headweekends";
                colspan = 5;
              }
              var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vHeaderCellClass, null, null, null, null, colspan);
              vCellContents += date_utils_1.formatDateStr(vTmpDate, this.vDayMajorDateDisplayFormat, this.vLangs[this.vLang]);
              vTmpDate.setDate(vTmpDate.getDate() + 6);
              if (this.vShowEndWeekDate == 1)
                vCellContents += " - " + date_utils_1.formatDateStr(vTmpDate, this.vDayMajorDateDisplayFormat, this.vLangs[this.vLang]);
              draw_utils_1.newNode(vTmpCell, "div", null, null, vCellContents, vColWidth * colspan);
              vTmpDate.setDate(vTmpDate.getDate() + 1);
            } else if (this.vFormat == "week") {
              var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vHeaderCellClass, null, vColWidth);
              draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vWeekMajorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth);
              vTmpDate.setDate(vTmpDate.getDate() + 7);
            } else if (this.vFormat == "month") {
              vColSpan = 12 - vTmpDate.getMonth();
              if (vTmpDate.getFullYear() == vMaxDate.getFullYear())
                vColSpan -= 11 - vMaxDate.getMonth();
              var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vHeaderCellClass, null, null, null, null, vColSpan);
              draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vMonthMajorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth * vColSpan);
              vTmpDate.setFullYear(vTmpDate.getFullYear() + 1, 0, 1);
            } else if (this.vFormat == "quarter") {
              vColSpan = 4 - Math.floor(vTmpDate.getMonth() / 3);
              if (vTmpDate.getFullYear() == vMaxDate.getFullYear())
                vColSpan -= 3 - Math.floor(vMaxDate.getMonth() / 3);
              var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vHeaderCellClass, null, null, null, null, vColSpan);
              draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vQuarterMajorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth * vColSpan);
              vTmpDate.setFullYear(vTmpDate.getFullYear() + 1, 0, 1);
            } else if (this.vFormat == "hour") {
              vColSpan = 24 - vTmpDate.getHours();
              if (vTmpDate.getFullYear() == vMaxDate.getFullYear() && vTmpDate.getMonth() == vMaxDate.getMonth() && vTmpDate.getDate() == vMaxDate.getDate())
                vColSpan -= 23 - vMaxDate.getHours();
              var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vHeaderCellClass, null, null, null, null, vColSpan);
              draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vHourMajorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth * vColSpan);
              vTmpDate.setHours(0);
              vTmpDate.setDate(vTmpDate.getDate() + 1);
            }
          }
          vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr", null, "footerdays");
          vTmpDate.setFullYear(vMinDate.getFullYear(), vMinDate.getMonth(), vMinDate.getDate());
          if (this.vFormat == "hour")
            vTmpDate.setHours(vMinDate.getHours());
          var vNumCols = 0;
          while (vTmpDate.getTime() <= vMaxDate.getTime()) {
            var vMinorHeaderCellClass = "gminorheading";
            if (this.vFormat == "day") {
              if (vTmpDate.getDay() % 6 == 0) {
                if (!this.vShowWeekends) {
                  vTmpDate.setDate(vTmpDate.getDate() + 1);
                  continue;
                }
                vMinorHeaderCellClass += "wkend";
              }
              if (vTmpDate <= vMaxDate) {
                var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vMinorHeaderCellClass);
                draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vDayMinorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth);
                vNumCols++;
              }
              vTmpDate.setDate(vTmpDate.getDate() + 1);
            } else if (this.vFormat == "week") {
              if (vTmpDate <= vMaxDate) {
                var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vMinorHeaderCellClass);
                draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vWeekMinorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth);
                vNumCols++;
              }
              vTmpDate.setDate(vTmpDate.getDate() + 7);
            } else if (this.vFormat == "month") {
              if (vTmpDate <= vMaxDate) {
                var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vMinorHeaderCellClass);
                draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vMonthMinorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth);
                vNumCols++;
              }
              vTmpDate.setDate(vTmpDate.getDate() + 1);
              while (vTmpDate.getDate() > 1) {
                vTmpDate.setDate(vTmpDate.getDate() + 1);
              }
            } else if (this.vFormat == "quarter") {
              if (vTmpDate <= vMaxDate) {
                var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vMinorHeaderCellClass);
                draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vQuarterMinorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth);
                vNumCols++;
              }
              vTmpDate.setDate(vTmpDate.getDate() + 81);
              while (vTmpDate.getDate() > 1)
                vTmpDate.setDate(vTmpDate.getDate() + 1);
            } else if (this.vFormat == "hour") {
              for (var i = vTmpDate.getHours(); i < 24; i++) {
                vTmpDate.setHours(i);
                if (vTmpDate <= vMaxDate) {
                  var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, vMinorHeaderCellClass);
                  draw_utils_1.newNode(vTmpCell, "div", null, null, date_utils_1.formatDateStr(vTmpDate, this.vHourMinorDateDisplayFormat, this.vLangs[this.vLang]), vColWidth);
                  vNumCols++;
                }
              }
              vTmpDate.setHours(0);
              vTmpDate.setDate(vTmpDate.getDate() + 1);
            }
          }
          var vDateRow = vTmpRow;
          var vTaskLeftPx = vNumCols * (vColWidth + 3) + 1;
          if (this.vFormat === "day") {
            vTaskLeftPx += 2;
          }
          vTmpTab.style.width = vTaskLeftPx + "px";
          var vSingleCell = false;
          if (this.vUseSingleCell !== 0 && this.vUseSingleCell < vNumCols * vNumRows)
            vSingleCell = true;
          draw_utils_1.newNode(vTmpDiv, "div", null, "rhscrpad", null, null, vTaskLeftPx + 1);
          vTmpDiv = draw_utils_1.newNode(vRightHeader, "div", null, "glabelfooter");
          return { gChartLbl, vTaskLeftPx, vSingleCell, vDateRow, vRightHeader, vNumCols };
        };
        this.drawCharBody = function(vTaskLeftPx, vTmpContentTabWrapper, gChartLbl, gListLbl, vMinDate, vMaxDate, vSingleCell, vNumCols, vColWidth, vDateRow) {
          var vRightTable = document.createDocumentFragment();
          var vTmpDiv = draw_utils_1.newNode(vRightTable, "div", this.vDivId + "gchartbody", "gchartgrid gcontainercol");
          this.setChartBody(vTmpDiv);
          var vTmpTab = draw_utils_1.newNode(vTmpDiv, "table", this.vDivId + "chartTable", "gcharttable", null, vTaskLeftPx);
          this.setChartTable(vTmpTab);
          draw_utils_1.newNode(vTmpDiv, "div", null, "rhscrpad", null, null, vTaskLeftPx + 1);
          var vTmpTBody = draw_utils_1.newNode(vTmpTab, "tbody");
          var vTmpTFoot = draw_utils_1.newNode(vTmpTab, "tfoot");
          events_1.syncScroll([vTmpContentTabWrapper, vTmpDiv], "scrollTop");
          events_1.syncScroll([gChartLbl, vTmpDiv], "scrollLeft");
          events_1.syncScroll([vTmpContentTabWrapper, gListLbl], "scrollLeft");
          var i = 0;
          var j = 0;
          var bd;
          if (this.vDebug) {
            bd = /* @__PURE__ */ new Date();
            console.info("before tasks loop", bd);
          }
          for (i = 0; i < this.vTaskList.length; i++) {
            var curTaskStart = this.vTaskList[i].getStart() ? this.vTaskList[i].getStart() : this.vTaskList[i].getPlanStart();
            var curTaskEnd = this.vTaskList[i].getEnd() ? this.vTaskList[i].getEnd() : this.vTaskList[i].getPlanEnd();
            var vTaskLeftPx_1 = general_utils_1.getOffset(vMinDate, curTaskStart, vColWidth, this.vFormat, this.vShowWeekends);
            var vTaskRightPx = general_utils_1.getOffset(curTaskStart, curTaskEnd, vColWidth, this.vFormat, this.vShowWeekends);
            var curTaskPlanStart = void 0, curTaskPlanEnd = void 0;
            curTaskPlanStart = this.vTaskList[i].getPlanStart();
            curTaskPlanEnd = this.vTaskList[i].getPlanEnd();
            var vTaskPlanLeftPx = 0;
            var vTaskPlanRightPx = 0;
            if (curTaskPlanStart && curTaskPlanEnd) {
              vTaskPlanLeftPx = general_utils_1.getOffset(vMinDate, curTaskPlanStart, vColWidth, this.vFormat, this.vShowWeekends);
              vTaskPlanRightPx = general_utils_1.getOffset(curTaskPlanStart, curTaskPlanEnd, vColWidth, this.vFormat, this.vShowWeekends);
            }
            var vID = this.vTaskList[i].getID();
            var vComb = this.vTaskList[i].getParItem() && this.vTaskList[i].getParItem().getGroup() == 2;
            var vCellFormat = "";
            var vTmpDiv_1 = null;
            var vTmpItem = this.vTaskList[i];
            var vCaptClass = null;
            var taskCellWidth = i === 0 ? vColWidth : null;
            if (this.vTaskList[i].getMile() && !vComb) {
              var vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr", this.vDivId + "childrow_" + vID, "gmileitem gmile" + this.vFormat, null, null, null, this.vTaskList[i].getVisible() == 0 ? "none" : null);
              this.vTaskList[i].setChildRow(vTmpRow);
              events_1.addThisRowListeners(this, this.vTaskList[i].getListChildRow(), vTmpRow);
              var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gtaskcell gtaskcellmile", null, vColWidth, null, null, null);
              vTmpDiv_1 = draw_utils_1.newNode(vTmpCell, "div", null, "gtaskcelldiv", "\xA0\xA0");
              vTmpDiv_1 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "bardiv_" + vID, "gtaskbarcontainer", null, 12, vTaskLeftPx_1 + vTaskRightPx - 6);
              this.vTaskList[i].setBarDiv(vTmpDiv_1);
              var vTmpDiv2 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "taskbar_" + vID, this.vTaskList[i].getClass(), null, 12);
              this.vTaskList[i].setTaskDiv(vTmpDiv2);
              if (this.vTaskList[i].getCompVal() < 100)
                vTmpDiv2.appendChild(document.createTextNode("\u25CA"));
              else {
                vTmpDiv2 = draw_utils_1.newNode(vTmpDiv2, "div", null, "gmilediamond");
                draw_utils_1.newNode(vTmpDiv2, "div", null, "gmdtop");
                draw_utils_1.newNode(vTmpDiv2, "div", null, "gmdbottom");
              }
              vCaptClass = "gmilecaption";
              if (!vSingleCell && !vComb) {
                this.drawColsChart(vNumCols, vTmpRow, taskCellWidth, vMinDate, vMaxDate);
              }
            } else {
              var vTaskWidth = vTaskRightPx;
              if (this.vTaskList[i].getGroup()) {
                vTaskWidth = vTaskWidth > this.vMinGpLen && vTaskWidth < this.vMinGpLen * 2 ? this.vMinGpLen * 2 : vTaskWidth;
                vTaskWidth = vTaskWidth < this.vMinGpLen ? this.vMinGpLen : vTaskWidth;
                var vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr", this.vDivId + "childrow_" + vID, (this.vTaskList[i].getGroup() == 2 ? "glineitem gitem" : "ggroupitem ggroup") + this.vFormat, null, null, null, this.vTaskList[i].getVisible() == 0 ? "none" : null);
                this.vTaskList[i].setChildRow(vTmpRow);
                events_1.addThisRowListeners(this, this.vTaskList[i].getListChildRow(), vTmpRow);
                var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gtaskcell gtaskcellbar", null, vColWidth, null, null);
                vTmpDiv_1 = draw_utils_1.newNode(vTmpCell, "div", null, "gtaskcelldiv", "\xA0\xA0");
                this.vTaskList[i].setCellDiv(vTmpDiv_1);
                if (this.vTaskList[i].getGroup() == 1) {
                  vTmpDiv_1 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "bardiv_" + vID, "gtaskbarcontainer", null, vTaskWidth, vTaskLeftPx_1);
                  this.vTaskList[i].setBarDiv(vTmpDiv_1);
                  var vTmpDiv2 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "taskbar_" + vID, this.vTaskList[i].getClass(), null, vTaskWidth);
                  this.vTaskList[i].setTaskDiv(vTmpDiv2);
                  draw_utils_1.newNode(vTmpDiv2, "div", this.vDivId + "complete_" + vID, this.vTaskList[i].getClass() + "complete", null, this.vTaskList[i].getCompStr());
                  draw_utils_1.newNode(vTmpDiv_1, "div", null, this.vTaskList[i].getClass() + "endpointleft");
                  if (vTaskWidth >= this.vMinGpLen * 2)
                    draw_utils_1.newNode(vTmpDiv_1, "div", null, this.vTaskList[i].getClass() + "endpointright");
                  vCaptClass = "ggroupcaption";
                }
                if (!vSingleCell && !vComb) {
                  this.drawColsChart(vNumCols, vTmpRow, taskCellWidth, vMinDate, vMaxDate);
                }
              } else {
                vTaskWidth = vTaskWidth <= 0 ? 1 : vTaskWidth;
                var vTmpDivCell = void 0, vTmpRow = void 0;
                if (vComb) {
                  vTmpDivCell = vTmpDiv_1 = this.vTaskList[i].getParItem().getCellDiv();
                } else {
                  var differentDatesHighlight = "";
                  if (this.vTaskList[i].getEnd() && this.vTaskList[i].getPlanEnd() && this.vTaskList[i].getStart() && this.vTaskList[i].getPlanStart()) {
                    if (Date.parse(this.vTaskList[i].getEnd()) !== Date.parse(this.vTaskList[i].getPlanEnd()) || Date.parse(this.vTaskList[i].getStart()) !== Date.parse(this.vTaskList[i].getPlanStart()))
                      differentDatesHighlight = "gitemdifferent ";
                  }
                  vTmpRow = draw_utils_1.newNode(vTmpTBody, "tr", this.vDivId + "childrow_" + vID, "glineitem " + differentDatesHighlight + "gitem" + this.vFormat, null, null, null, this.vTaskList[i].getVisible() == 0 ? "none" : null);
                  this.vTaskList[i].setChildRow(vTmpRow);
                  events_1.addThisRowListeners(this, this.vTaskList[i].getListChildRow(), vTmpRow);
                  var vTmpCell = draw_utils_1.newNode(vTmpRow, "td", null, "gtaskcell gtaskcellcolorbar", null, taskCellWidth, null, null);
                  vTmpDivCell = vTmpDiv_1 = draw_utils_1.newNode(vTmpCell, "div", null, "gtaskcelldiv", "\xA0\xA0");
                }
                vTmpDiv_1 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "bardiv_" + vID, "gtaskbarcontainer", null, vTaskWidth, vTaskLeftPx_1);
                this.vTaskList[i].setBarDiv(vTmpDiv_1);
                var vTmpDiv2 = void 0;
                if (this.vTaskList[i].getStartVar()) {
                  vTmpDiv2 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "taskbar_" + vID, this.vTaskList[i].getClass(), null, vTaskWidth);
                  if (this.vTaskList[i].getBarText()) {
                    draw_utils_1.newNode(vTmpDiv2, "span", this.vDivId + "tasktextbar_" + vID, "textbar", this.vTaskList[i].getBarText(), this.vTaskList[i].getCompRestStr());
                  }
                  this.vTaskList[i].setTaskDiv(vTmpDiv2);
                }
                if (vTaskPlanLeftPx && (vTaskPlanLeftPx != vTaskLeftPx_1 || vTaskPlanRightPx != vTaskRightPx || !this.vTaskList[i].getStartVar())) {
                  var vTmpPlanDiv = draw_utils_1.newNode(vTmpDivCell, "div", this.vDivId + "bardiv_" + vID, "gtaskbarcontainer gplan", null, vTaskPlanRightPx, vTaskPlanLeftPx);
                  var vTmpPlanDiv2 = draw_utils_1.newNode(vTmpPlanDiv, "div", this.vDivId + "taskbar_" + vID, this.vTaskList[i].getPlanClass() + " gplan", null, vTaskPlanRightPx);
                  this.vTaskList[i].setPlanTaskDiv(vTmpPlanDiv2);
                }
                if (vTmpDiv2) {
                  draw_utils_1.newNode(vTmpDiv2, "div", this.vDivId + "complete_" + vID, this.vTaskList[i].getClass() + "complete", null, this.vTaskList[i].getCompStr());
                }
                if (vComb)
                  vTmpItem = this.vTaskList[i].getParItem();
                if (!vComb || vComb && this.vTaskList[i].getParItem().getEnd() == this.vTaskList[i].getEnd())
                  vCaptClass = "gcaption";
                if (!vSingleCell && !vComb && vTmpRow) {
                  this.drawColsChart(vNumCols, vTmpRow, taskCellWidth, vMinDate, vMaxDate);
                }
              }
            }
            if (this.getCaptionType() && vCaptClass !== null) {
              var vCaptionStr = void 0;
              switch (this.getCaptionType()) {
                case "Caption":
                  vCaptionStr = vTmpItem.getCaption();
                  break;
                case "Resource":
                  vCaptionStr = vTmpItem.getResource();
                  break;
                case "Duration":
                  vCaptionStr = vTmpItem.getDuration(this.vFormat, this.vLangs[this.vLang]);
                  break;
                case "Complete":
                  vCaptionStr = vTmpItem.getCompStr();
                  break;
              }
              draw_utils_1.newNode(vTmpDiv_1, "div", null, vCaptClass, vCaptionStr, 120, vCaptClass == "gmilecaption" ? 12 : 0);
            }
            if (this.vTaskList[i].getTaskDiv() && vTmpDiv_1) {
              var vTmpDiv2 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "tt" + vID, null, null, null, null, "none");
              var _a = this.createTaskInfo(this.vTaskList[i], this.vTooltipTemplate), component = _a.component, callback = _a.callback;
              vTmpDiv2.appendChild(component);
              events_1.addTooltipListeners(this, this.vTaskList[i].getTaskDiv(), vTmpDiv2, callback);
            }
            if (this.vTaskList[i].getPlanTaskDiv() && vTmpDiv_1) {
              var vTmpDiv2 = draw_utils_1.newNode(vTmpDiv_1, "div", this.vDivId + "tt" + vID, null, null, null, null, "none");
              var _b = this.createTaskInfo(this.vTaskList[i], this.vTooltipTemplate), component = _b.component, callback = _b.callback;
              vTmpDiv2.appendChild(component);
              events_1.addTooltipListeners(this, this.vTaskList[i].getPlanTaskDiv(), vTmpDiv2, callback);
            }
          }
          if (vSingleCell) {
            var vTmpTFootTRow = draw_utils_1.newNode(vTmpTFoot, "tr");
            var vTmpTFootTCell = draw_utils_1.newNode(vTmpTFootTRow, "td", null, null, null, "100%");
            var vTmpTFootTCellTable = draw_utils_1.newNode(vTmpTFootTCell, "table", null, "gcharttableh", null, "100%");
            var vTmpTFootTCellTableTBody = draw_utils_1.newNode(vTmpTFootTCellTable, "tbody");
            vTmpTFootTCellTableTBody.appendChild(vDateRow.cloneNode(true));
          } else {
            vTmpTFoot.appendChild(vDateRow.cloneNode(true));
          }
          return { vRightTable };
        };
        this.drawColsChart = function(vNumCols, vTmpRow, taskCellWidth, pStartDate, pEndDate) {
          if (pStartDate === void 0) {
            pStartDate = null;
          }
          if (pEndDate === void 0) {
            pEndDate = null;
          }
          var columnCurrentDay = null;
          if (this.vShowWeekends !== false && pStartDate && pEndDate && (this.vFormat == "day" || this.vFormat == "week")) {
            var curTaskStart = new Date(pStartDate.getTime());
            var curTaskEnd = /* @__PURE__ */ new Date();
            var onePeriod = 36e5;
            if (this.vFormat == "day") {
              onePeriod *= 24;
            } else if (this.vFormat == "week") {
              onePeriod *= 24 * 7;
            }
            columnCurrentDay = Math.floor(general_utils_1.calculateCurrentDateOffset(curTaskStart, curTaskEnd) / onePeriod) - 1;
          }
          for (var j = 0; j < vNumCols - 1; j++) {
            var vCellFormat = "gtaskcell gtaskcellcols";
            if (this.vShowWeekends !== false && this.vFormat == "day" && (j % 7 == 4 || j % 7 == 5)) {
              vCellFormat = "gtaskcellwkend";
            } else if ((this.vFormat == "week" || this.vFormat == "day") && j === columnCurrentDay) {
              vCellFormat = "gtaskcellcurrent";
            }
            draw_utils_1.newNode(vTmpRow, "td", null, vCellFormat, "\xA0\xA0", taskCellWidth);
          }
        };
        this.Draw = function() {
          var vMaxDate = /* @__PURE__ */ new Date();
          var vMinDate = /* @__PURE__ */ new Date();
          var vColWidth = 0;
          var bd;
          if (this.vEvents && this.vEvents.beforeDraw) {
            this.vEvents.beforeDraw();
          }
          if (this.vDebug) {
            bd = /* @__PURE__ */ new Date();
            console.info("before draw", bd);
          }
          if (this.vProcessNeeded)
            task_1.processRows(this.vTaskList, 0, -1, 1, 1, this.getUseSort(), this.vDebug);
          this.vProcessNeeded = false;
          vMinDate = date_utils_1.getMinDate(this.vTaskList, this.vFormat, this.getMinDate() && date_utils_1.coerceDate(this.getMinDate()));
          vMaxDate = date_utils_1.getMaxDate(this.vTaskList, this.vFormat, this.getMaxDate() && date_utils_1.coerceDate(this.getMaxDate()));
          if (this.vFormat == "day")
            vColWidth = this.vDayColWidth;
          else if (this.vFormat == "week")
            vColWidth = this.vWeekColWidth;
          else if (this.vFormat == "month")
            vColWidth = this.vMonthColWidth;
          else if (this.vFormat == "quarter")
            vColWidth = this.vQuarterColWidth;
          else if (this.vFormat == "hour")
            vColWidth = this.vHourColWidth;
          var vLeftHeader = document.createDocumentFragment();
          var gListLbl = this.drawListHead(vLeftHeader);
          var _a = this.drawListBody(vLeftHeader), vNumRows = _a.vNumRows, vTmpContentTabWrapper = _a.vTmpContentTabWrapper;
          var _b = this.drawChartHead(vMinDate, vMaxDate, vColWidth, vNumRows), gChartLbl = _b.gChartLbl, vTaskLeftPx = _b.vTaskLeftPx, vSingleCell = _b.vSingleCell, vRightHeader = _b.vRightHeader, vDateRow = _b.vDateRow, vNumCols = _b.vNumCols;
          var vRightTable = this.drawCharBody(vTaskLeftPx, vTmpContentTabWrapper, gChartLbl, gListLbl, vMinDate, vMaxDate, vSingleCell, vNumCols, vColWidth, vDateRow).vRightTable;
          if (this.vDebug) {
            var ad = /* @__PURE__ */ new Date();
            console.info("after tasks loop", ad, ad.getTime() - bd.getTime());
          }
          while (this.vDiv.hasChildNodes())
            this.vDiv.removeChild(this.vDiv.firstChild);
          var vTmpDiv = draw_utils_1.newNode(this.vDiv, "div", null, "gchartcontainer");
          vTmpDiv.style.height = this.vTotalHeight;
          var leftvTmpDiv = draw_utils_1.newNode(vTmpDiv, "div", null, "gmain gmainleft");
          leftvTmpDiv.appendChild(vLeftHeader);
          var rightvTmpDiv = draw_utils_1.newNode(vTmpDiv, "div", null, "gmain gmainright");
          rightvTmpDiv.appendChild(vRightHeader);
          rightvTmpDiv.appendChild(vRightTable);
          vTmpDiv.appendChild(leftvTmpDiv);
          vTmpDiv.appendChild(rightvTmpDiv);
          draw_utils_1.newNode(vTmpDiv, "div", null, "ggridfooter");
          var vTmpDiv2 = draw_utils_1.newNode(this.getChartBody(), "div", this.vDivId + "Lines", "glinediv");
          if (this.vEvents.onLineContainerHover && typeof this.vEvents.onLineContainerHover === "function") {
            events_1.addListener("mouseover", this.vEvents.onLineContainerHover, vTmpDiv2);
            events_1.addListener("mouseout", this.vEvents.onLineContainerHover, vTmpDiv2);
          }
          vTmpDiv2.style.visibility = "hidden";
          this.setLines(vTmpDiv2);
          events_1.addScrollListeners(this);
          if (this.vScrollTo != "") {
            var vScrollDate = new Date(vMinDate.getTime());
            var vScrollPx = 0;
            if (this.vScrollTo.substr && this.vScrollTo.substr(0, 2) == "px") {
              vScrollPx = parseInt(this.vScrollTo.substr(2));
            } else {
              if (this.vScrollTo === "today") {
                vScrollDate = /* @__PURE__ */ new Date();
              } else if (this.vScrollTo instanceof Date) {
                vScrollDate = this.vScrollTo;
              } else {
                vScrollDate = date_utils_1.parseDateStr(this.vScrollTo, this.getDateInputFormat());
              }
              if (this.vFormat == "hour")
                vScrollDate.setMinutes(0, 0, 0);
              else
                vScrollDate.setHours(0, 0, 0, 0);
              vScrollPx = general_utils_1.getOffset(vMinDate, vScrollDate, vColWidth, this.vFormat, this.vShowWeekends) - 30;
            }
            this.getChartBody().scrollLeft = vScrollPx;
          }
          if (vMinDate.getTime() <= (/* @__PURE__ */ new Date()).getTime() && vMaxDate.getTime() >= (/* @__PURE__ */ new Date()).getTime()) {
            this.vTodayPx = general_utils_1.getOffset(vMinDate, /* @__PURE__ */ new Date(), vColWidth, this.vFormat, this.vShowWeekends);
          } else
            this.vTodayPx = -1;
          var bdd;
          if (this.vDebug) {
            bdd = /* @__PURE__ */ new Date();
            console.info("before DrawDependencies", bdd);
          }
          if (this.vEvents && typeof this.vEvents.beforeLineDraw === "function") {
            this.vEvents.beforeLineDraw();
          }
          this.DrawDependencies(this.vDebug);
          events_1.addListenerDependencies(this.vLineOptions);
          if (this.vEvents && typeof this.vEvents.afterLineDraw === "function") {
            this.vEvents.afterLineDraw();
          }
          if (this.vDebug) {
            var ad = /* @__PURE__ */ new Date();
            console.info("after DrawDependencies", ad, ad.getTime() - bdd.getTime());
          }
          this.drawComplete(vMinDate, vColWidth, bd);
        };
        this.drawComplete = function(vMinDate, vColWidth, bd) {
          if (this.vDebug) {
            var ad = /* @__PURE__ */ new Date();
            console.info("after draw", ad, ad.getTime() - bd.getTime());
          }
          events_1.updateGridHeaderWidth(this);
          this.chartRowDateToX = function(date) {
            return general_utils_1.getOffset(vMinDate, date, vColWidth, this.vFormat, this.vShowWeekends);
          };
          if (this.vEvents && this.vEvents.afterDraw) {
            this.vEvents.afterDraw();
          }
        };
        if (this.vDiv && this.vDiv.nodeName && this.vDiv.nodeName.toLowerCase() == "div")
          this.vDivId = this.vDiv.id;
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/json.js
  var require_json = __commonJS({
    "node_modules/jsgantt-improved/dist/src/json.js"(exports) {
      "use strict";
      var __awaiter = exports && exports.__awaiter || function(thisArg, _arguments, P, generator) {
        function adopt(value) {
          return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
          });
        }
        return new (P || (P = Promise))(function(resolve, reject) {
          function fulfilled(value) {
            try {
              step(generator.next(value));
            } catch (e) {
              reject(e);
            }
          }
          function rejected(value) {
            try {
              step(generator["throw"](value));
            } catch (e) {
              reject(e);
            }
          }
          function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
          }
          step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
      };
      var __generator = exports && exports.__generator || function(thisArg, body) {
        var _ = { label: 0, sent: function() {
          if (t[0] & 1) throw t[1];
          return t[1];
        }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
          return this;
        }), g;
        function verb(n) {
          return function(v) {
            return step([n, v]);
          };
        }
        function step(op) {
          if (f) throw new TypeError("Generator is already executing.");
          while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2]) _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
          if (op[0] & 5) throw op[1];
          return { value: op[0] ? op[1] : void 0, done: true };
        }
      };
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.addJSONTask = exports.parseJSONString = exports.parseJSON = void 0;
      var task_1 = require_task();
      var general_utils_1 = require_general_utils();
      exports.parseJSON = function(pFile, pGanttVar, vDebug, redrawAfter) {
        if (vDebug === void 0) {
          vDebug = false;
        }
        if (redrawAfter === void 0) {
          redrawAfter = true;
        }
        return __awaiter(this, void 0, void 0, function() {
          var jsonObj, bd, ad;
          return __generator(this, function(_a) {
            switch (_a.label) {
              case 0:
                return [4, general_utils_1.makeRequest(pFile, true, true)];
              case 1:
                jsonObj = _a.sent();
                if (vDebug) {
                  bd = /* @__PURE__ */ new Date();
                  console.info("before jsonparse", bd);
                }
                exports.addJSONTask(pGanttVar, jsonObj);
                if (this.vDebug) {
                  ad = /* @__PURE__ */ new Date();
                  console.info("after addJSONTask", ad, ad.getTime() - bd.getTime());
                }
                if (redrawAfter) {
                  pGanttVar.Draw();
                }
                return [2, jsonObj];
            }
          });
        });
      };
      exports.parseJSONString = function(pStr, pGanttVar) {
        exports.addJSONTask(pGanttVar, JSON.parse(pStr));
      };
      exports.addJSONTask = function(pGanttVar, pJsonObj) {
        for (var index = 0; index < pJsonObj.length; index++) {
          var id = void 0;
          var name_1 = void 0;
          var start = void 0;
          var end = void 0;
          var planstart = void 0;
          var planend = void 0;
          var itemClass = void 0;
          var planClass = void 0;
          var link = "";
          var milestone = 0;
          var resourceName = "";
          var completion = void 0;
          var group = 0;
          var parent_1 = void 0;
          var open_1 = void 0;
          var dependsOn = "";
          var caption = "";
          var notes = "";
          var cost = void 0;
          var duration = "";
          var bartext = "";
          var additionalObject = {};
          for (var prop in pJsonObj[index]) {
            var property = prop;
            var value = pJsonObj[index][property];
            switch (property.toLowerCase()) {
              case "pid":
              case "id":
                id = value;
                break;
              case "pname":
              case "name":
                name_1 = value;
                break;
              case "pstart":
              case "start":
                start = value;
                break;
              case "pend":
              case "end":
                end = value;
                break;
              case "pplanstart":
              case "planstart":
                planstart = value;
                break;
              case "pplanend":
              case "planend":
                planend = value;
                break;
              case "pclass":
              case "class":
                itemClass = value;
                break;
              case "pplanclass":
              case "planclass":
                planClass = value;
                break;
              case "plink":
              case "link":
                link = value;
                break;
              case "pmile":
              case "mile":
                milestone = value;
                break;
              case "pres":
              case "res":
                resourceName = value;
                break;
              case "pcomp":
              case "comp":
                completion = value;
                break;
              case "pgroup":
              case "group":
                group = value;
                break;
              case "pparent":
              case "parent":
                parent_1 = value;
                break;
              case "popen":
              case "open":
                open_1 = value;
                break;
              case "pdepend":
              case "depend":
                dependsOn = value;
                break;
              case "pcaption":
              case "caption":
                caption = value;
                break;
              case "pnotes":
              case "notes":
                notes = value;
                break;
              case "pcost":
              case "cost":
                cost = value;
                break;
              case "duration":
              case "pduration":
                duration = value;
                break;
              case "bartext":
              case "pbartext":
                bartext = value;
                break;
              default:
                additionalObject[property.toLowerCase()] = value;
            }
          }
          pGanttVar.AddTaskItem(new task_1.TaskItem(id, name_1, start, end, itemClass, link, milestone, resourceName, completion, group, parent_1, open_1, dependsOn, caption, notes, pGanttVar, cost, planstart, planend, duration, bartext, additionalObject, planClass));
        }
      };
    }
  });

  // node_modules/jsgantt-improved/dist/src/jsgantt.js
  var require_jsgantt = __commonJS({
    "node_modules/jsgantt-improved/dist/src/jsgantt.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.JSGantt = void 0;
      var events_1 = require_events();
      var general_utils_1 = require_general_utils();
      var xml_1 = require_xml();
      var task_1 = require_task();
      var draw_1 = require_draw();
      var json_1 = require_json();
      var date_utils_1 = require_date_utils();
      if (!exports.JSGantt)
        exports.JSGantt = {};
      exports.JSGantt.isIE = general_utils_1.isIE;
      exports.JSGantt.TaskItem = task_1.TaskItem;
      exports.JSGantt.GanttChart = draw_1.GanttChart;
      exports.JSGantt.updateFlyingObj = general_utils_1.updateFlyingObj;
      exports.JSGantt.showToolTip = events_1.showToolTip;
      exports.JSGantt.stripIds = general_utils_1.stripIds;
      exports.JSGantt.stripUnwanted = general_utils_1.stripUnwanted;
      exports.JSGantt.delayedHide = general_utils_1.delayedHide;
      exports.JSGantt.hideToolTip = general_utils_1.hideToolTip;
      exports.JSGantt.fadeToolTip = general_utils_1.fadeToolTip;
      exports.JSGantt.moveToolTip = general_utils_1.moveToolTip;
      exports.JSGantt.getZoomFactor = general_utils_1.getZoomFactor;
      exports.JSGantt.getOffset = general_utils_1.getOffset;
      exports.JSGantt.getScrollPositions = general_utils_1.getScrollPositions;
      exports.JSGantt.processRows = task_1.processRows;
      exports.JSGantt.sortTasks = task_1.sortTasks;
      exports.JSGantt.getMinDate = date_utils_1.getMinDate;
      exports.JSGantt.getMaxDate = date_utils_1.getMaxDate;
      exports.JSGantt.findObj = general_utils_1.findObj;
      exports.JSGantt.changeFormat = general_utils_1.changeFormat;
      exports.JSGantt.folder = events_1.folder;
      exports.JSGantt.hide = events_1.hide;
      exports.JSGantt.show = events_1.show;
      exports.JSGantt.taskLink = task_1.taskLink;
      exports.JSGantt.parseDateStr = date_utils_1.parseDateStr;
      exports.JSGantt.formatDateStr = date_utils_1.formatDateStr;
      exports.JSGantt.parseDateFormatStr = date_utils_1.parseDateFormatStr;
      exports.JSGantt.parseXML = xml_1.parseXML;
      exports.JSGantt.parseXMLString = xml_1.parseXMLString;
      exports.JSGantt.findXMLNode = xml_1.findXMLNode;
      exports.JSGantt.getXMLNodeValue = xml_1.getXMLNodeValue;
      exports.JSGantt.AddXMLTask = xml_1.AddXMLTask;
      exports.JSGantt.parseJSON = json_1.parseJSON;
      exports.JSGantt.parseJSONString = json_1.parseJSONString;
      exports.JSGantt.addJSONTask = json_1.addJSONTask;
      exports.JSGantt.benchMark = general_utils_1.benchMark;
      exports.JSGantt.getIsoWeek = date_utils_1.getIsoWeek;
      exports.JSGantt.addListener = events_1.addListener;
      exports.JSGantt.addTooltipListeners = events_1.addTooltipListeners;
      exports.JSGantt.addThisRowListeners = events_1.addThisRowListeners;
      exports.JSGantt.addFolderListeners = events_1.addFolderListeners;
      exports.JSGantt.addFormatListeners = events_1.addFormatListeners;
      exports.JSGantt.addScrollListeners = events_1.addScrollListeners;
      exports.JSGantt.criticalPath = general_utils_1.criticalPath;
    }
  });

  // build/jsgantt-entry.js
  var require_jsgantt_entry = __commonJS({
    "build/jsgantt-entry.js"(exports, module) {
      var JSGanttModule = require_jsgantt();
      var JSGantt = JSGanttModule.JSGantt || JSGanttModule;
      if (typeof window !== "undefined") {
        window.JSGantt = JSGantt;
      }
      module.exports = JSGantt;
    }
  });
  require_jsgantt_entry();
})();
