DBs = [
  new Database(createUuid()).withEvents(db => {
    var modes = { expand: true, slim: false }
    db.onChange().register((sender) => {
      repaintResults(sender, modes);
      repaintGraph(sender)
      repaintToolbar(sender)
    })
    db.onSelect().register((sender) => {
      selectResults(db);
      repaintToolbar(sender)
    })
  })
]

function createUuid() {
  return Math.floor(Math.random() * 899999) + 100000
}

function drawPanel(db, uuid) {

  var template = document.createElement('template');

  template.innerHTML = `
  <panel class="searchpanel" data-search-session="${uuid}">
    
    <div class="toolbar height16px">
      <a title="Menu" id="showMenuButton" href="#" onclick="toggleMenuButton(event)">
        <i class="fa-button fa-button-30 fa-solid fa-bars"></i>
      </a>
      <a title="Add note" id="addItemButton" href="#" onclick="addResultItem(event)">
        <i class="fa-button fa-button-30 fa-solid fa-plus"></i>
      </a>
      <!--<a title="Edit selected" id="editSelectedButton" data-enabled="false" href="#" onclick="editDialog(event)">-->
        <!--<img src="static/icon-edit_white_64x64.png">-->
        <!--<i class="fa-button fa-button-30 fa-solid fa-pen-to-square"></i>
      </a>-->
      <a title="Mark as selected" id="markSelectedButton" class="badge" data-enabled="false" data-selected="0" href="#" onclick="rememberItems(event)" ondblclick="unrememberItems(event)">
        <i class="fa-button fa-button-30 fa-solid fa-list-check"></i>
      </a>
      <a title="Delete selected" id="deleteSelectedButton" class="badge" data-selected="0" href="#" onclick="askDeleteSelected(event)">
        <i class="fa-button fa-button-30 fa-solid fa-trash-can"></i>
      </a>
      <span title="Total notes" id="totalAmount">
        Articles: 0
      </span>
    </div>

    <div class="menuPopup" style="display: none;">
      Menu<br />
      <ul>
        <li onclick="addPanel(event)">Add Panel</li>
        <!--<li>Switch to Index</li>-->
        <!--<li>Switch to Overview</li>-->
        <!--<li>Switch to Detail</li>-->
        <!--<li>Switch to Graph</li>-->
        <li onclick="removePanel(event)">Remove Panel</li>
      </ul>
    </div>
    
    <div class="searchbar">
      <input name="search" class="search" placeholder="Search keys" autocorrect="off" autocomplete="off"
        autocapitalize="none" onkeyup="runSearch(event)" />
      <span class="clear-search" onclick="clearSearch(event)">&#x2715;</span>
    </div>

    <results>
      <ol class="results unselectable"></ol>
    </results>
  </panel>
  `

  var panels = document.querySelector(`panels`)
  panels.appendChild(template.content);

  //panels.innerHTML += panel;

  var panelTag = findPanel(uuid)
  panelTag.getSession = function () { return parseInt(this.getAttribute("data-search-session")) }
  panelTag.getInputTag = function () { return this.querySelector(`.searchbar input.search`) }

  return panelTag;
}

document.addEventListener("DOMContentLoaded", (event) => {
  window.onkeydown = function (event) {
    if (event.target == document.body && event.key == "v" && event.metaKey) {
      addResultItem(event)
    }
  }

  DBs.forEach((db) => {
    var panel = drawPanel(db, db.id)
    db.refresh()
    db.withSearchTag(panel.getInputTag())
  })
})

function selectResults(db) {
  var items = Array.from(findPanel(db.id).querySelectorAll("li"))
  items.forEach(li => {
    var uuid = li.getAttribute("data-uuid")
    li.setAttribute("data-selected", db.isSelected(uuid))
  })
}

// session

function runSearch(event) {
  var query = encodeURIComponent(event.target.value)
  var executeImmediate = event.key == "Enter"
  // TODO suche event.tagtet.parent um den kontext zu erhalten.

  var searchSession = findPanelByTag(event.currentTarget).getSession()
  var db = findDbBySessionId(searchSession)

  db.search(query, executeImmediate)
}

function filterByTag(uuid) {
  console.log("filter by tag:", uuid)
}

function addDialog(event, info) {
  var { uuid, text, body, url } = (info || {})
  var dialog = document.getElementById("input")
  var form = dialog.querySelectorAll("form")[0]
  if (dialog.getAttribute("data-show") != "true") {
    form.uuid.value = uuid || "";
    form.text.value = text || "";
    form.body.value = body || "";
    form.url.value = url || "";
    dialog.setAttribute("data-show", true)
    form.text.focus();
  }
}

function editDialog(event) {
  let sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)
  var uuid = db.getSelections().first()
  if (uuid) {
    var info = db.detail(uuid)
    SESSION.editContext = {
      sessionId,
      uuid
    }
    addDialog(event, info)
  }
}

function closeDialog(event) {
  var dialog = findElement(event.target, (tag) => tag.tagName == "DT-DIALOG")
  dialog && dialog.setAttribute("data-show", false)
}

function addDialogFromSearch(event) {
  let sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)
  SESSION.editContext = {
    sessionId
  }
  addDialog(event, { text: decodeURIComponent(db.searchQuery()) })
}

function addResultItem(event) {
  let panel = findPanelByTag(event.currentTarget);
  let sessionId = panel?.getSession() || 1;
  var db = findDbBySessionId(sessionId)
  SESSION.editContext = {
    sessionId
  }
  addDialog(event)
}

function editResultItem(event, uuid) {
  let sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)
  var info = db.detail(uuid)
  SESSION.editContext = {
    sessionId,
    uuid
  }
  addDialog(event, info)
}

function startTimerToSelect(event, uuid) {
  console.log("startTimerToSelect")
  //event.preventDefault();
  //event.stopPropagation(); // stops dragndrop

  let sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)

  SESSION.selectedByLongTouch = false;
  SESSION.selectingByLongTouch = true;

  SESSION.hTimerToSelect = self.setTimeout(() => {
    if (SESSION.selectingByLongTouch) {
      db.toggleSelection(uuid)
      SESSION.selectedByLongTouch = true;
    }
    SESSION.selectingByLongTouch = false;
  }, 1000)
}

function longSelect(event, uuid) {
  /* let sessionId = findPanelByTag(event.currentTarget).getSession();
   var db = findDbBySessionId(sessionId)
   db.toggleSelection(uuid)
   */
  //  SESSION.selectedByLongTouch = true;
}

function stopTimerToSelect(event, uuid) {
  console.log("stopTimerToSelect")
  SESSION.selectingByLongTouch = false
  SESSION.selectedByLongTouch = false

  if (SESSION.hTimerToSelect) {
    selectResultItem(event, uuid)
  }

  self.clearTimeout(SESSION.hTimerToSelect)
  SESSION.hTimerToSelect = null
}

function rememberItems(event) {
  let sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)
  db.rememberedItems = db.getInfos().filter(i => db.isSelected(i.uuid)).map(i => i.uuid)
  repaintToolbar(db)
}

function unrememberItems(event) {
  let sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)
  db.rememberedItems = []
  repaintToolbar(db)
}


function joinInfosFromMemory(event) {
  let sessionId = SESSION.editContext.sessionId;
  var db = findDbBySessionId(sessionId)

  var dialog = document.getElementById("input")
  let toUuid = dialog.querySelector("input[name=uuid]").value
  let fromUuids = db.rememberedItems;

  //var form = dialog.querySelectorAll("form")[0]
  //let uuid = form.uuid.value

  SESSION.joiningContext = {
    fromUuids,
    toUuid
  }

  dialog.setAttribute("data-show", false)

  var relationshipDialog = document.getElementById("relationshipDialog")
  relationshipDialog.setAttribute("data-show", true)
}

/* Drag and drop */

var PAGE = {

  dragOver: function (event) {
    event.preventDefault();
    event.stopPropagation();
  },

  drop: function (event) {
    if (this.shouldHandle(event)) {

      document.body.classList.remove("dragging");

      stopTimerToSelect()

      event.preventDefault()
      event.stopPropagation()

      addResultItem(event)

      const text = event.dataTransfer.getData("text/plain");

      var dialog = document.getElementById("input")
      var form = dialog.querySelectorAll("form")[0]
      form.text.value = text;
      form.text.focus();

      document.getElementById("bsubmit").focus();
    }
    this.finishDrag(event)

    return false;
  },

  shouldHandle: function (event) {
    return !SESSION.searchSessionFrom
  },

  dragEnter: function (event) {
    if (this.shouldHandle(event)) {
      document.body.classList.add("dragging");
    }
  },

  dragLeave: function (event) {
    document.body.classList.remove("dragging")
    this.finishDrag(event)
  },

  finishDrag: function (event) {
    SESSION.draggingTag = null
    SESSION.searchSessionFrom = null;
    SESSION.searchSessionTo = null;
  }
}

/* INFOS */


var INFOS = {

  startDrag: function (event) {
    //SESSION.draggingTag = event.target.getAttribute("data-uuid")
    SESSION.searchSessionFrom = findPanelByTag(event.currentTarget).getSession()
  },

  dragOver: function (event) {
    if (this.shouldHandle(event)) {
      event.preventDefault();
      event.stopPropagation();
    }
  },

  drop: function (event) {
    if (this.shouldHandle(event)) {

      event.preventDefault()
      event.stopPropagation()

      //var db1 = findDbBySessionId(SESSION.searchSessionFrom)
      //var uuid1 = event.currentTarget.getAttribute("data-uuid")
      //db1.select(uuid1)

      SESSION.searchSessionTo = findPanelByTag(event.currentTarget).getSession()

      var db2 = findDbBySessionId(SESSION.searchSessionTo)
      var uuid2 = event.currentTarget.getAttribute("data-uuid")
      db2.select(uuid2)

      var relationshipDialog = document.getElementById("relationshipDialog")
      relationshipDialog.setAttribute("data-show", true)
    }

    return false;
  },

  shouldHandle: function (event) {
    return SESSION.searchSessionFrom || SESSION.searchSessionTo
  },

  dragEnter: function (event) {
    if (this.shouldHandle(event)) {
    }
  },

  dragLeave: function (event) {
  }
}


async function doSubmitInfoRelationship(event, form) {

  let fromSessionId = SESSION.searchSessionFrom || SESSION.editContext.sessionId;
  let toSessionId = SESSION.searchSessionTo || SESSION.editContext.sessionId;

  var db1 = findDbBySessionId(fromSessionId)
  var db2 = findDbBySessionId(toSessionId)

  var selection1 = []
  var selection2 = []

  if (SESSION.searchSessionFrom) {
    selection1 = [...db1.getSelections()]
    selection2 = [...db2.getSelections()]
  } else {
    selection1 = SESSION.joiningContext.fromUuids
    selection2 = [SESSION.joiningContext.toUuid]
  }

  selection1.forEach(srcId => {
    selection2.forEach(dstId => {

      var srcInfo = db1.getInfo(srcId)
      var dstInfo = db2.getInfo(dstId)

      let obj = {
        "entity": "info",
        "action": "PUT",
        "version": 1,
        "payload": {
          info_uuid: dstInfo.uuid,
          rel_info_uuid: srcInfo.uuid,
          text: form.text.value
        }
      };

      console.log(obj)

      doPost(obj)
    })
  })

  DBs.forEach(t => t.refresh());

  var relationshipDialog = document.getElementById("relationshipDialog")
  relationshipDialog.setAttribute("data-show", false)

  PAGE.finishDrag(event)

  closeDialog(event)

  return false
}

function clearSearch(event) {
  var searchBar = event.currentTarget.parentNode.querySelectorAll(".search")[0]
  searchBar.focus();
  searchBar.value = "";
  var session = findPanelByTag(event.currentTarget).getSession()
  var db = findDbBySessionId(session)
  db.search("", true)
}

function setSearch(event, value) {
  var session = findPanelByTag(event.currentTarget).getSession()
  var db = findDbBySessionId(session)
  db.getSearchTag().value = value
  db.search(value)
}

async function rate(event) {
  console.log(event.path)

  var uuid = findElement(event.target, t => t.hasAttribute("data-uuid")).getAttribute("data-uuid")
  var rating = event.target.getAttribute("d-value")

  let obj = {
    "entity": "rating",
    "action": "PUT",
    "version": 1,
    "payload": {
      uuid,
      rating
    }
  };

  await doPost(obj)

  DBs.forEach(t => t.refresh());
}