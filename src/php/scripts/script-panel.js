
function repaintResults(db, modes) {
  var infos = db.getInfos()

  var search = db.getSearchTag().value;

  let tagList = infos.map((rel) => {
    var selected = db.isSelected(rel.uuid)
    var detail = db.detail(rel.uuid)

    var cleanHeadline = trimWhitespace(detail.text)

    if (!detail) {
      console.warn("Failed to lookup info", rel.uuid)
      return null;
    }

    var downstream_relations = []

    // rel.downstream_relations = [...{ uuid, text }] 

    if (modes.expand && rel.downstream_relations) {
      var map = {}
      var topics = [...new Set(rel.downstream_relations.map(r => r.text))]

      topics.forEach(topic => {
        if (!map[topic]) {
          map[topic] = rel.downstream_relations.filter(r => topic == r.text)
        }
      })

      topics.forEach(topic => {
        var arr = map[topic].map(r => {
          var detail = db.detail(r.uuid) || {}
          var text = detail.text || `<i class="warn">${detail.text}</i>`
          return `<li><span class="tag">${formatLink(text, detail.url, true)}</span></li>`
        })
        downstream_relations.push(`<span class="tag" data-relation="&rdca;"><b>${topic}</b></span>`)
        downstream_relations.push(`<ul>${arr.join("")}</ul>`)
      })

    }

    var upstream_relations = []
    if (modes.expand && rel.upstream_relations) {
      upstream_relations = rel.upstream_relations.map(t => {
        var detail = db.detail(t.uuid) || {}
        return `<span class="tag" data-relation="&larrpl;">${formatLink(detail.text, detail.url, true)}</span>`
      })
    }

    var body = formatMarkdown(formatSearchKeyword(encodeHTML(trimWhitespace(detail.body)), search))
    var black = upstream_relations.length
    var weight = downstream_relations.length + (body?.filter(t => t != "").length || 0)

    // title="${detail.timestamp}"

    detail.rank = 1;
    detail.status = 1;
    // detail.rating = Math.floor(Math.random() * 5);


    var foot = [
      //detail.status == null ? "" : `<span>${formatStatus(detail.status)}</span>`,
      `<span>${formatRating(detail.rating)}</span>`,
      ////detail.rank == null ? "" : `<span>Rank: ${detail.rank}</span>`,
    ]

    return `<li data-uuid="${detail.uuid}"
      data-selected="${selected}"
      data-weight="${modes.expand ? weight : 1}"
      data-slim="${modes.slim || false}"
      ondblclick="editResultItem(event, '${detail.uuid}')"
      xonclick="selectResultItem(event, '${detail.uuid}')"
      onmousedown="startTimerToSelect(event, '${detail.uuid}')"
      onmouseup="stopTimerToSelect(event, '${detail.uuid}')"
      onmousemove="stopTimerToSelect()"
      onmouseleave="stopTimerToSelect()"
      xonLongTouch="longSelect(event, '${detail.uuid}')"
      draggable="true" 
      ondragover="INFOS.dragOver(event)"
      ondrop="INFOS.drop(event)"
      ondragstart="INFOS.startDrag(event)"
      ondragleave="INFOS.dragLeave(event)">
      <span class="result-tags upstream-relations">${upstream_relations.length > 0 ? "&larrpl; " + upstream_relations.length : ""}</span>
      <span class="text headline"><b>${formatLink(formatSearchKeyword(cleanHeadline, search), detail.url, false)}</b></span>
      <dt-info-headbar>
        <span class="result-footer">
          <span>${foot.join("")}</span>
          <span class="code" onclick="alert('${detail.uuid}')">${detail.uuid}</span>
        </span>
      </dt-info-headbar>
      <!--<span class="timestamp">${detail.timestamp}</span>-->
      <div class="result-body">${body.join("")}</div>
      <span class="result-tags downstream-relations">${downstream_relations.join("")}</span>
      </li>`;
    // <button class="delete" onclick="askDelete('${detail.uuid}')">delete</button>
  });

  console.log(db.id)

  var container = findPanel(db.id).querySelector(".results")
  container.innerHTML = tagList.length ? tagList.join("") : "No results.";

  let queryString = db.getSearchTag().value

  if (queryString) {
    container.innerHTML += `<toolbar><button data-default="true" onclick="addDialogFromSearch(event)">Add</button></toolbar>`
  }

  var links = [...container.querySelectorAll("ln")]
  links.forEach(ln => {
    ln.addEventListener("click", function (event) {
      setSearch(event, event.target.innerHTML)
    })
  })

  //container.scrollTo({ top: 0, behavior: 'smooth' });
  //container.firstChild.scrollIntoView()
}