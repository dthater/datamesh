
function findPanel(sessionId) {
  return document.querySelector(`panel[data-search-session="${sessionId}"]`)
}

function findPanelByTag(tag) {
  return findElement(tag, t => t && t.hasAttribute ? t.hasAttribute("data-search-session") : null)
}

function findDbBySessionId(sessionId) {
  return DBs.filter(db => db.id == sessionId)[0]
}

// logic
async function doFormSubmit(event, form) {

  let obj = {
    "entity": "info",
    "action": "PUT",
    "version": 1,
    "payload": {
      text: form.text.value,
      body: form.body.value,
      uuid: form.uuid.value,
      url: form.url.value,
    }
  };

  await doPost(obj)

  DBs.forEach(t => t.refresh());

  closeDialog(event)
}

function encodeJsonToPostBody(obj) {
  return Object.entries(obj)
    .map((i) => `${i[0]}=${encodeURIComponent(i[1])}`)
    .join("&");
}

async function doPost(obj) {
  return await fetch(API.info, {
    method: "POST",
    headers: {
      // "Content-Type": CONTENTTYPE.form,
      "Content-Type": CONTENTTYPE.json,
    },
    body: JSON.stringify(obj),
    // body: encodeJsonToPostBody(obj),
  }).then((data) => {
    if (data.status != 200) {
      throw Error(data)
    }
  }).catch((err) => {
    console.error(err);
  });
}

function formatLink(text, url = "") {
  if (!!url?.match) {
    var isLink = url.match("[a-z]*://")
    // var domain = text.match(/^[a-z]*:\/\/(.*?)(\/.*)?$/i)
    return isLink ? `${text} <a href="${url}" class="link" target="_blank">&#10140;</a>` : text
  } else
    return text
}

function formatSearchKeyword(text, key = "") {
  if (!!text?.match && key?.length >= 3) {
    let reg = new RegExp(key, "mig");
    return text.replaceAll(reg, (match, index, text) => `<mark>${match}</mark>`);
  } else
    return text
}

function encodeHTML(text) {
  return (text || "")
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function repaintGraph(db) {
  var graph = document.getElementById("graph")
  console.log(db, graph)
  // var ctx = graph.conte
}

function formatStatus(num) {
  switch (num) {
    case 0: return "<dt-status>ungelesen</dt-status>"
    case 1: return "<dt-status>gelesen</dt-status>"
    case 2: return "<dt-status>wiederholen</dt-status>"
    case 3: return "<dt-status>bearbeitet</dt-status>"
    default: return ""
  }
}

function formatRating(num) {
  var STAR_OFF = "&star;"
  var STAR_ON = "&starf;"
  var stars = new Array(5).fill(false).map((t, i) => i <= num - 1).map((t, i) =>
    `<dt-star d-value="${i + 1}" d-on="${t}" onclick="rate(event)">${t ? STAR_ON : STAR_OFF}</dt-star>`)
  return `<dt-stars>${stars.join("")}</dt-stars>`
  // `<dt-rating d-value="${num}">${full}<dt-rading-empty onclick="rate(event)">${empty}</dt-rating-empty></dt-rating>`
}



/*
function repaintTags(db) {
  var data = db.getTags()
  let tagList = data.map((item) => {
    return `<li draggable="true" 
      data-uuid="${item.uuid}" 
      onclick="filterByTag('${item.uuid}')" 
      xondrop="TAGS.finishDrop(event)" 
      xondragover="TAGS.allowDrop(event)"
      ondragstart="TAGS.startDrag(event)">${item.text}</li>`
  });
  var container = findPanel(db.id).querySelector(".tags")
  container.innerHTML = tagList.length ? tagList.join("") : ""
}
*/

function repaintToolbar(db) {
  let panel = findPanel(db.id)

  panel.querySelector("#deleteSelectedButton").setAttribute("data-selected", db.selectionCount())
  //panel.querySelector("#editSelectedButton").setAttribute("data-enabled", db.selectionCount() == 1)
  panel.querySelector("#markSelectedButton").setAttribute("data-enabled", db.selectionCount() > 0)
  panel.querySelector("#markSelectedButton").setAttribute("data-selected", db.rememberedItems?.length || 0)
  panel.querySelector("#totalAmount").innerHTML = `Articles: ${db.total()}`
}

function formatMarkdown(markdown) {
  var text = (markdown || "")
    .replace(/^### (.*)\n?/gm, "<h3>$1</h3>")
    .replace(/^## (.*)\n?/gm, "<h2>$1</h2>")
    .replace(/^# (.*)\n?/gm, "<h1>$1</h1>")
    .replace(/\(\*{5}\)/gm, "<stars></stars>")
    .replace(/\*\*(.*?)\*\*/gm, "<b>$1</b>")
    .replace(/__(.*?)__/gm, "<u>$1</u>")
    .replace(/\*(.*?)\*/gm, "<i>$1</i>")
    .replace(/_(.*?)_/gm, "<i>$1</i>")
    .replace(/\$\{(.*?)\}/gm, "<ln>$1</ln>")
    .replace(/\$([\w\u00C0-\u017F_,-]+)/gmi, "<ln>$1</ln>")
    .replace(/^---(.*)/gm, "<bp d-level='3'>$1</bp>")
    .replace(/^--(.*)/gm, "<bp d-level='2'>$1</bp>")
    .replace(/^-(.*)/gm, "<bp>$1</bp>")
    .replace(/^\t\t-(.*)/gm, "<bp d-level='3'>$1</bp>")
    .replace(/^\t-(.*)/gm, "<bp d-level='2'>$1</bp>")
    .replace(/\(!\)/gm, "&#9888;")
    .replace(/\(\*\)/gm, "&starf;")
    .replace(/\(x\)/gm, "&cross;")
    .replace(/\(\+\)/gm, "&oplus;")
    .replace(/\(-\)/gm, "&ominus;")
    .replace(/\(\/\/\)/gm, "&osol;")
    .replace(/\(\/\)/gm, "&check;")
    .replace(/\(on\)/gm, "&#9728;")
    .replace(/\(off\)/gm, "&#9789;")
    .replace(/\(->\)/gm, "&#10140;")
    .replace(/`(.*?)`/gm, "<key>$1</key>")
    .replace(/\{code\}\n*/gm, "<code>")
    .replace(/\{\/code\}/gm, "</code>")
    .replace(/\n/gm, "<br />")
    .split("\n")

  return text
}

function trimWhitespace(text) {
  return (text || "").replaceAll(/^[ \t]*|[ \t]*$/gm, "")

}

function selectResultItem(event, uuid) {
  if (SESSION.selectedByLongTouch || SESSION.selectingByLongTouch) {
    return;
  }
  if (!event || !uuid) {
    return;
  }

  var sessionId = findPanelByTag(event.currentTarget).getSession();
  var db = findDbBySessionId(sessionId)

  if (event.altKey === false && event.shiftKey === false) {
    db.unselect()
    db.toggleSelection(uuid)
  } else if (event.shiftKey === true) {
    db.selectRange(db.range(db.lastSelection(), uuid))
  } else {
    db.toggleSelection(uuid)
  }
}

function askDeleteSelected(event) {
  if (confirm("Really delete all selected items of this panel?")) {
    let sessionId = findPanelByTag(event.currentTarget).getSession();
    var db = findDbBySessionId(sessionId)

    db.getSelections().forEach(t => deleteInfo(t))
    db.unselect()

    DBs.forEach(db => {
      db.refresh()
    })
  }
}

async function askDelete(uuid) {
  if (confirm(`Delete ${uuid}?`)) {
    var payload = {
      "entity": "info",
      "action": "DELETE",
      "version": 1,
      "payload": {
        uuid
      }
    }
    deleteInfo(payload)
  }
}

async function deleteInfo(uuid) {
  await fetch(API.infoDelete, {
    method: "POST",
    headers: {
      "Content-Type": CONTENTTYPE.json,
    },
    // body: JSON.stringify({
    // body: encodeJsonToPostBody({
    body: JSON.stringify({
      "entity": "info",
      "action": "DELETE",
      "version": 1,
      "payload": {
        uuid
      }
    })
  }).then(() => {
    invalidateData(uuid)
  }).catch((err) => {
    console.error(err);
  });
}

function invalidateData(uuid) {
  var list = document.querySelectorAll(`*[data-uuid="${uuid}"]`)
  if (list.length) {
    list[0].setAttribute("data-deleted", true)
  }
}

function toggleMenuButton(event) {
  var sessionId = findPanelByTag(event.currentTarget).getSession();
  var pabel = findPanel(sessionId);
  var menu = pabel.querySelector(".menuPopup")
  menu.style.display = menu.style.display == "block" ? "none" : "block"
}

function addPanel(event) {
  var db = new Database(createUuid()).withEvents(db => {
    var modes = { expand: true, slim: false }
    db.onChange().register((sender) => {
      repaintResults(sender, modes);
      repaintToolbar(sender)
    })
    db.onSelect().register((sender) => {
      selectResults(db);
      repaintToolbar(sender)
    })
  })
  DBs.push(db)

  var panel = drawPanel(db, db.id)
  db.refresh()
  db.withSearchTag(panel.getInputTag())

  toggleMenuButton(event)
}

function removePanel(event) {
  if (DBs.length > 1) {
    var sessionId = findPanelByTag(event.currentTarget).getSession()

    var db = DBs.filter(db => db.id == sessionId)
    var index = DBs.indexOf(db)
    DBs.splice(index, 1)

    var pabel = findPanel(sessionId)
    pabel.parentNode.removeChild(pabel)
  } else {
    toggleMenuButton(event)
  }
}

function format(event) {
  _format(event.target)
  return false
}

function _format(tag) {
  var button = findElement(tag, (t) => t && t.hasAttribute && t.hasAttribute("d-type"))

  if (!button) {
    return;
  }

  var type = button.getAttribute("d-type")
  var textarea = findElement(tag, (t) => t.tagName == "DT-DIALOG").querySelector("textarea")

  console.log(textarea.selectionStart)

  var start = textarea.selectionStart
  var end = textarea.selectionEnd
  var text = textarea.value

  function textAt(text, pos, ch) {
    var front = text.substring(0, pos);
    var back = text.substring(pos, text.length);
    return front + ch + back;
  }

  function removeRightText(text, pos, ch) {
    var c = text.substring(pos, pos + ch.length);
    if (c == ch) {
      var front = text.substring(0, pos);
      var back = text.substring(pos + ch.length, text.length);
      return front + back;
    }
    return text;
  }

  function lineStart(text, pos, ch, f) {
    var p = 0;
    for (var i = pos - 1; i >= 0; i--) {
      var c = text.charAt(i)
      if (c == "\n" || c == "\r") {
        // found end
        var p = i + 1;
        break
      }
    }
    // not found
    return f(text, p, ch);
  }

  function embraceText(text, pos, pos2, ch) {
    var [ch1, ch2] = ch.split("|")
    var front = text.substring(0, pos);
    var mid = text.substring(pos, pos2);
    var back = text.substring(pos2, text.length);
    return front + ch1 + mid + ch2 + back;
  }


  switch (type) {
    case "dot":
      var ch = "- "
      textarea.value = lineStart(text, textarea.selectionStart, ch, textAt)
      textarea.selectionStart = start + ch.length
      textarea.selectionEnd = end + ch.length
      break
    case "h1":
      var ch = "# "
      textarea.value = lineStart(text, textarea.selectionStart, ch, textAt)
      textarea.selectionStart = start + ch.length
      textarea.selectionEnd = end + ch.length
      break
    case "h2":
      var ch = "## "
      textarea.value = lineStart(text, textarea.selectionStart, ch, textAt)
      textarea.selectionStart = start + ch.length
      textarea.selectionEnd = end + ch.length
      break
    case "h3":
      var ch = "### "
      textarea.value = lineStart(text, textarea.selectionStart, ch, textAt)
      textarea.selectionStart = start + ch.length
      textarea.selectionEnd = end + ch.length
      break
    case "sr":
      var ch = "\t"
      textarea.value = lineStart(text, textarea.selectionStart, ch, textAt)
      textarea.selectionStart = start + ch.length
      textarea.selectionEnd = end + ch.length
      break
    case "key":
      var ch = "${|}"
      var span = (textarea.selectionCount == 0)
      textarea.value = embraceText(text, textarea.selectionStart, textarea.selectionEnd, ch)
      textarea.selectionStart = start + 2
      textarea.selectionEnd = end + 2 + (span ? 1 : 0)
      break
    case "sl":
      var ch = "\t"
      var prevLen = text.length
      textarea.value = lineStart(text, textarea.selectionStart, "\t", removeRightText)
      if (prevLen != textarea.value.length) {
        textarea.selectionStart = start - ch.length
        textarea.selectionEnd = end - ch.length
      }
      break
    case "date":
      var date = new Date().toISOString().split('T')[0]
      var ch = date
      textarea.value = textAt(text, textarea.selectionStart, ch)
      textarea.selectionStart = start + ch.length
      textarea.selectionEnd = end + ch.length
      break
    case "fat":
      var ch = "**|**"
      textarea.value = embraceText(text, textarea.selectionStart, textarea.selectionEnd, ch)
      textarea.selectionStart = start + 2
      textarea.selectionEnd = end + 4
      break
    case "it":
      var ch = "*|*"
      textarea.value = embraceText(text, textarea.selectionStart, textarea.selectionEnd, ch)
      textarea.selectionStart = start + 1
      textarea.selectionEnd = end + 2
      break
    case "code":
      var ch = "`|`"
      textarea.value = embraceText(text, textarea.selectionStart, textarea.selectionEnd, ch)
      textarea.selectionStart = start + 1
      textarea.selectionEnd = end + 2
      break
  }

}