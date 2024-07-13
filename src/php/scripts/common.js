Array.prototype.first = Array.prototype.first || function () {
  return this.length > 0 ? this[0] : null;
}
Array.prototype.last = Array.prototype.last || function () {
  return this.length > 0 ? this[this.length - 1] : null;
}
Array.prototype.putValue = Array.prototype.putValue || function (item) {
  if (this.indexOf(item) < 0) {
    this.push(item);
  }
}
Array.prototype.removeValue = Array.prototype.removeValue || function (item) {
  var index = this.indexOf(item)
  if (index >= 0) {
    this.splice(index, 1);
  }
}
Array.prototype.contains = Array.prototype.contains || function (item) {
  return this.indexOf(item) >= 0
}
Array.prototype.toggleValue = Array.prototype.toggleValue || function (item) {
  this.contains(item) ? this.removeValue(index) : this.putValue(index)
}


// core
function EventList() {
  this._queue = new Array()
}
EventList.prototype.register = function (fnc) {
  this._queue.push(fnc)
}
EventList.prototype.unregister = function (fnc) {
  var index = this.indexOf(fnc)
  if (index >= 0) {
    this._queue.splice(index, 1)
  }
}
EventList.prototype.fire = function (sender, ...params) {
  this._queue.forEach(t => {
    try {
      t(sender, params);
    } catch (e) {
      console.error(e);
    }
  })
}

const CONTENTTYPE = {
  json: "application/json;charset=utf-8",
  form: "application/x-www-form-urlencoded;charset=utf-8"
}


function Database(id) {
  this.id = id || new Date().getTime() + Math.random() * 1000
  this._infos = []
  this._relationships = []
  this._attributes = []
  this._SEARCH_DELAY = 250

  this._selections = new Array()
  this._onChange = new EventList()
  this._onSelect = new EventList()
  this._hSearch = null
  this._searchTag = null
  this._query = ""
  this._changingState = 0
  this._total = 0

  this.rememberedItems = []
}
Database.prototype.withEvents = function (fnc) {
  fnc(this)
  return this
}
Database.prototype.beginChanging = function () {
  // Increment changing level
  this._changingState++;
}
Database.prototype.endChanging = function () {
  // Decrement changing level. If back to 0, fire change event.
  this._changingState--;
  if (this._changingState <= 0) {
    this._onChange.fire(this)
    this._changingState = 0;
  }
}
Database.prototype.setDetails = function (value) {
  this.beginChanging();
  this._details = value
  this.endChanging();
  return this
}
Database.prototype.getDetails = function () {
  return this._details
}
Database.prototype.detail = function (uuid) {
  return this.getDetails().filter(t => t.uuid == uuid).first()
}
Database.prototype.updateInfos = function () {
  // Fire update if possible
  this.beginChanging();
  this.endChanging();
  return this
}
Database.prototype.setInfos = function (value) {
  this.beginChanging();
  this.clearSelection();
  this._infos = value
  this.endChanging();
  return this
}
Database.prototype.getInfos = function () {
  return this._infos
}
Database.prototype.getInfo = function (uuid) {
  return this.getInfos().filter(t => t.uuid == uuid).first()
}
Database.prototype.setRelationships = function (value) {
  console.log(value)
  this.beginChanging();
  this._relationships = value
  this.endChanging();
  return this
}
Database.prototype.getRelationships = function () {
  return this._relationships
}
Database.prototype.translateTags = function (uuids) {
  return this._tags.filter(t => uuids.indexOf(t.uuid) >= 0).map(t => t.text)
}
Database.prototype.onChange = function () {
  return this._onChange
}
Database.prototype.getSelections = function () {
  return this._selections
}
Database.prototype.isSelected = function (uuid) {
  return this._selections.indexOf(uuid) >= 0
}
Database.prototype.select = function (uuid) {
  if (!this.isSelected(uuid)) {
    this._selections.push(uuid)
    this._onSelect.fire(this, { uuid, selected: true })
  }
  return this
}
Database.prototype.clearSelection = function () {
  if (this.selectionCount()) {
    this._selections.length = 0
    this._onSelect.fire(this)
  }
  return this
}
Database.prototype.selectionCount = function () {
  return this._selections.length
}
Database.prototype.total = function () {
  return this._total
}
Database.prototype.setTotal = function (value) {
  this._total = value;
  return this;
}

Database.prototype.unselect = function (uuid) {
  if (!!uuid) {
    var index = this._selections.indexOf(uuid)
    if (index >= 0) {
      this._selections.splice(index, 1)
      this._onSelect.fire(this, { uuid, selected: false })
    }
  } else {
    this.clearSelection()
  }
}
Database.prototype.toggleSelection = function (uuid) {
  if (this.isSelected(uuid)) {
    this.unselect(uuid)
  } else {
    this.select(uuid)
  }
}
Database.prototype.onSelect = function () {
  return this._onSelect
}
Database.prototype.selectRange = function (uuids) {
  // Garantuee uniqness
  this._selections = [...new Set(this._selections.concat(uuids))]
  this._onSelect.fire(this)
}
Database.prototype.lastSelection = function () {
  return this._selections.last()
}
Database.prototype.range = function (from, to) {
  var selecting = false;
  var list = [];
  this.getInfos().forEach(t => {
    var found = t.uuid == from || t.uuid == to
    if (found) {
      selecting = !selecting
    }
    if (selecting || (!selecting && found)) {
      list.push(t.uuid)
    }
  })
  return list;
}
Database.prototype.search = function (query, executeImmediate) {
  var _this = this;
  this._query = query;

  clearTimeout(this._hSearch)
  this._hSearch = setTimeout(() => {
    var date = new Date().getTime()

    var payload = {
      "entity": "info",
      "action": "QUERY",
      "version": 1,
      "payload": {
        "query": query,
        "date": date
      }
    }

    var fetchCmd = [
      API.info,
      {
        method: "POST",
        headers: {
          "Content-Type": CONTENTTYPE.json,
        },
        body: JSON.stringify(payload),
      }
    ]

    console.log(...fetchCmd)

    fetch(...fetchCmd)
      // fetch(`${API.info}?q=${query}&t=${date}`)
      .then((data) => {
        try {
          return data.json()
        }
        catch (e) {
          if (e.message.contains("Unexpected end of JSON input")) {
            console.error(e)
            return {}
          }
        }
      })
      .then((json) => {
        var OK = json.result?.startsWith("OK")
        _this.beginChanging();
        //_this.setRelationships(OK ? json.tags : []);
        _this.setDetails(OK ? json.details : []);
        _this.setInfos(OK ? json.infos : []);
        _this.setTotal(OK ? json.total : 0);
        _this.endChanging();
        if (!OK) {
          console.warn("Failed to fetch results.", json?.result | json)
        }
      }).catch((e) => {
        console.error(e)
      })

    this._hSearch = clearTimeout(this._hSearch)
  }, executeImmediate ? 10 : this._SEARCH_DELAY)
}
Database.prototype.refresh = function () {
  this.search(this._query, true);
}
Database.prototype.searchQuery = function () {
  return this._query;
}
Database.prototype.withSearchTag = function (tag) {
  this._searchTag = tag
  return this
}
Database.prototype.getSearchTag = function () {
  return this._searchTag

}

function findElement(node, condition) {
  return !node ? null : (condition(node) ? node : findElement(node.parentNode, condition))
}
