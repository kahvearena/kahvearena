let state = {
  deck: [],
  discard: [],
  players: [[], [], [], []],
  scores: [0, 0, 0, 0],
  names: ["Sen", "Robot Ali", "Robot Murat", "Robot Can"],
  indicator: null,
  okey: null,
  selected: null,
  turn: 0,
  hasDrawn: false,
  opened: [false, false, false, false],
  openedGroups: [],
  locked: false,
  round: 1
};

const COLORS = ["red", "blue", "black", "yellow"];
const COLOR_NAMES = {
  red: "Kırmızı",
  blue: "Mavi",
  black: "Siyah",
  yellow: "Sarı",
  fake: "Sahte"
};

function start101(){
  newRound();
}

function newRound(){
  state.deck = buildTiles();
  shuffle(state.deck);
  state.discard = [];
  state.players = [[], [], [], []];
  state.indicator = null;
  state.okey = null;
  state.selected = null;
  state.turn = 0;
  state.hasDrawn = false;
  state.opened = [false, false, false, false];
  state.openedGroups = [];
  state.locked = false;

  pickIndicatorAndOkey();

  for(let p = 0; p < 4; p++){
    const count = p === 0 ? 22 : 21;
    for(let i = 0; i < count; i++){
      state.players[p].push(state.deck.pop());
    }
    sortHand(state.players[p]);
  }

  state.discard.push(state.deck.pop());

  addLog(`Yeni el başladı. Gösterge: ${tileLabel(state.indicator)}, Okey: ${tileLabel(state.okey)}.`);
  render101("Sıra sende. Taş çekmeden de taş atabilirsin çünkü ilk el sende 22 taş var.");
}

function buildTiles(){
  const tiles = [];
  let id = 1;

  for(let set = 0; set < 2; set++){
    for(const color of COLORS){
      for(let number = 1; number <= 13; number++){
        tiles.push({
          id: id++,
          color,
          number,
          fake: false
        });
      }
    }
  }

  tiles.push({ id: id++, color: "fake", number: 0, fake: true });
  tiles.push({ id: id++, color: "fake", number: 0, fake: true });

  return tiles;
}

function pickIndicatorAndOkey(){
  let tile;
  do{
    tile = state.deck.pop();
  } while(tile.fake);

  state.indicator = tile;

  const okeyNumber = tile.number === 13 ? 1 : tile.number + 1;
  state.okey = {
    color: tile.color,
    number: okeyNumber,
    fake: false
  };
}

function isOkey(tile){
  return !tile.fake && tile.color === state.okey.color && tile.number === state.okey.number;
}

function isFakeOkey(tile){
  return tile.fake;
}

function tileValue(tile){
  if(isOkey(tile)) return 0;
  if(isFakeOkey(tile)) return state.okey.number;
  return tile.number;
}

function tileLabel(tile){
  if(!tile) return "-";
  if(isFakeOkey(tile)) return "Sahte Okey";
  if(isOkey(tile)) return `${tile.number} ${COLOR_NAMES[tile.color]} OKEY`;
  return `${tile.number} ${COLOR_NAMES[tile.color]}`;
}

function tileShort(tile){
  if(!tile) return "-";
  if(isFakeOkey(tile)) return "SO";
  return String(tile.number);
}

function shuffle(arr){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function colorRank(color){
  return COLORS.indexOf(color);
}

function sortHand(hand){
  hand.sort((a, b) => {
    if(isOkey(a) && !isOkey(b)) return 1;
    if(!isOkey(a) && isOkey(b)) return -1;
    if(a.fake && !b.fake) return 1;
    if(!a.fake && b.fake) return -1;
    if(colorRank(a.color) !== colorRank(b.color)) return colorRank(a.color) - colorRank(b.color);
    return a.number - b.number;
  });
}

function render101(message){
  renderHand();
  renderCounts();
  renderScores();
  renderAnalysis();
  renderOpenedGroups();

  document.getElementById("indicatorTile").textContent = tileLabel(state.indicator);
  document.getElementById("okeyTile").textContent = tileLabel(state.okey);
  document.getElementById("deckCount").textContent = `${state.deck.length} taş`;
  document.getElementById("discardTop").textContent = tileShort(state.discard[state.discard.length - 1]);
  document.getElementById("turnLabel").textContent = state.turn === 0 ? "Sende" : state.names[state.turn];
  document.getElementById("infoText").textContent = message || "";
  document.getElementById("selectedTileText").textContent =
    state.selected === null ? "Yok" : tileLabel(state.players[0][state.selected]);
}

function renderHand(){
  const handEl = document.getElementById("myHand");
  handEl.innerHTML = "";

  state.players[0].forEach((tile, index) => {
    const div = document.createElement("div");
    div.className = `tile101 ${tile.fake ? "fake" : tile.color} ${state.selected === index ? "selected" : ""} ${isOkey(tile) ? "okey" : ""}`;
    div.innerHTML = `${tileShort(tile)}<small>${tile.fake ? "sahte" : COLOR_NAMES[tile.color]}</small>`;
    div.onclick = () => selectTile(index);
    handEl.appendChild(div);
  });
}

function renderCounts(){
  document.getElementById("p1count").textContent = `${state.players[1].length} taş`;
  document.getElementById("p2count").textContent = `${state.players[2].length} taş`;
  document.getElementById("p3count").textContent = `${state.players[3].length} taş`;
}

function renderScores(){
  const el = document.getElementById("scoreRows");
  el.innerHTML = "";

  for(let i = 0; i < 4; i++){
    const div = document.createElement("div");
    div.className = "scoreRow";
    div.innerHTML = `
      <div>
        <b>${state.names[i]}</b>
        <span>${state.opened[i] ? "Açtı" : "Açmadı"}</span>
      </div>
      <strong>${state.scores[i]} puan</strong>
    `;
    el.appendChild(div);
  }
}

function renderAnalysis(){
  const analysis = analyzeHand(state.players[0]);

  document.getElementById("bestOpenScore").textContent = analysis.openScore;
  document.getElementById("groupCount").textContent = analysis.groups.length;
  document.getElementById("deadScore").textContent = analysis.deadScore;
  document.getElementById("canOpen").textContent = analysis.openScore >= 101 ? "Evet" : "Hayır";
}

function renderOpenedGroups(){
  const area = document.getElementById("openedGroups");
  area.innerHTML = "";

  state.openedGroups.forEach(group => {
    const wrap = document.createElement("div");
    wrap.className = "openedGroup";
    group.tiles.forEach(tile => {
      const div = document.createElement("div");
      div.className = `tile101 ${tile.fake ? "fake" : tile.color} ${isOkey(tile) ? "okey" : ""}`;
      div.innerHTML = `${tileShort(tile)}<small>${tile.fake ? "sahte" : COLOR_NAMES[tile.color]}</small>`;
      wrap.appendChild(div);
    });
    area.appendChild(wrap);
  });
}

function selectTile(index){
  if(state.locked || state.turn !== 0) return;
  state.selected = state.selected === index ? null : index;
  render101("Taş seçildi. Atmak için 'Seçili Taşı At' butonuna bas.");
}

function drawDeck(){
  if(!canHumanPlay()) return;

  if(state.hasDrawn){
    render101("Bu tur zaten taş aldın. Şimdi taş atmalısın.");
    return;
  }

  if(state.deck.length === 0){
    endRound("Deste bitti. El puanları hesaplandı.");
    return;
  }

  const tile = state.deck.pop();
  state.players[0].push(tile);
  sortHand(state.players[0]);
  state.hasDrawn = true;
  state.selected = null;

  addLog(`Sen desteden taş çektin.`);
  render101("Desteden taş çektin. Şimdi bir taş at.");
}

function takeDiscard(){
  if(!canHumanPlay()) return;

  if(state.hasDrawn){
    render101("Bu tur zaten taş aldın. Şimdi taş atmalısın.");
    return;
  }

  if(state.discard.length === 0){
    render101("Ortada alınacak taş yok.");
    return;
  }

  const tile = state.discard.pop();
  state.players[0].push(tile);
  sortHand(state.players[0]);
  state.hasDrawn = true;
  state.selected = null;

  addLog(`Sen ortadan ${tileLabel(tile)} aldın.`);
  render101("Ortadan taş aldın. Şimdi bir taş at.");
}

function discardSelectedTile(){
  if(!canHumanPlay()) return;

  if(state.selected === null){
    render101("Önce elinden bir taş seç.");
    return;
  }

  if(state.players[0].length <= 21 && !state.hasDrawn){
    render101("Önce taş çekmen veya ortadan alman gerekiyor.");
    return;
  }

  const tile = state.players[0].splice(state.selected, 1)[0];
  state.discard.push(tile);
  state.selected = null;
  state.hasDrawn = false;

  addLog(`Sen ${tileLabel(tile)} attın.`);

  if(state.players[0].length === 0){
    finishByPlayer(0);
    return;
  }

  state.turn = 1;
  render101("Taş attın. Robotlar oynuyor...");
  setTimeout(botPlay, 700);
}

function openHand(){
  if(!canHumanPlay()) return;

  const analysis = analyzeHand(state.players[0]);

  if(analysis.openScore < 101){
    render101(`Açamazsın. En iyi toplamın ${analysis.openScore}. 101 veya üstü olmalı.`);
    return;
  }

  state.opened[0] = true;
  state.openedGroups = analysis.groups.map(g => ({
    owner: 0,
    type: g.type,
    tiles: g.tiles
  }));

  addLog(`Sen ${analysis.openScore} puanla el açtın.`);
  render101("El açıldı. Artık bitmeye oynayabilirsin.");
}

function finishHand(){
  if(!canHumanPlay()) return;

  const analysis = analyzeHand(state.players[0]);

  if(!state.opened[0] && analysis.openScore < 101){
    render101("Bitmek için önce 101 açabilecek durumda olmalısın.");
    return;
  }

  if(analysis.deadScore > 0){
    render101(`Henüz bitemezsin. Elde kalan uyumsuz taş puanı: ${analysis.deadScore}.`);
    return;
  }

  finishByPlayer(0);
}

function canHumanPlay(){
  if(state.locked) return false;

  if(state.turn !== 0){
    render101("Şu an sıra sende değil.");
    return false;
  }

  return true;
}

function botPlay(){
  if(state.locked) return;

  const p = state.turn;
  const hand = state.players[p];

  const takeMiddle = shouldBotTakeDiscard(hand);

  let taken;
  if(takeMiddle && state.discard.length > 0){
    taken = state.discard.pop();
    hand.push(taken);
    addLog(`${state.names[p]} ortadan taş aldı.`);
  } else if(state.deck.length > 0){
    taken = state.deck.pop();
    hand.push(taken);
    addLog(`${state.names[p]} desteden taş çekti.`);
  } else {
    endRound("Deste bitti. El puanları hesaplandı.");
    return;
  }

  sortHand(hand);

  const analysis = analyzeHand(hand);

  if(!state.opened[p] && analysis.openScore >= 101 && Math.random() < 0.65){
    state.opened[p] = true;
    addLog(`${state.names[p]} ${analysis.openScore} puanla açtı.`);
  }

  if(state.opened[p] && analysis.deadScore === 0){
    finishByPlayer(p);
    return;
  }

  const discardIndex = chooseBotDiscard(hand);
  const discarded = hand.splice(discardIndex, 1)[0];
  state.discard.push(discarded);

  addLog(`${state.names[p]} ${tileLabel(discarded)} attı.`);

  if(hand.length === 0){
    finishByPlayer(p);
    return;
  }

  state.turn++;
  if(state.turn > 3){
    state.turn = 0;
    state.hasDrawn = false;
    render101("Robotlar oynadı. Sıra sende.");
    return;
  }

  render101(`${state.names[p]} oynadı. Sıradaki robot oynuyor...`);
  setTimeout(botPlay, 700);
}

function shouldBotTakeDiscard(hand){
  const top = state.discard[state.discard.length - 1];
  if(!top) return false;
  if(isOkey(top)) return true;

  let useful = 0;
  for(const t of hand){
    if(t.fake) continue;
    if(t.number === top.number && t.color !== top.color) useful += 2;
    if(t.color === top.color && Math.abs(t.number - top.number) <= 2) useful += 3;
  }

  return useful >= 4;
}

function chooseBotDiscard(hand){
  let bestIndex = 0;
  let worstUtility = Infinity;

  hand.forEach((tile, index) => {
    const utility = tileUtility(tile, hand);
    if(utility < worstUtility){
      worstUtility = utility;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function tileUtility(tile, hand){
  if(isOkey(tile)) return 999;
  if(isFakeOkey(tile)) return 40;

  let utility = 0;

  for(const other of hand){
    if(other.id === tile.id || other.fake) continue;

    if(other.number === tile.number && other.color !== tile.color){
      utility += 7;
    }

    if(other.color === tile.color){
      const diff = Math.abs(other.number - tile.number);
      if(diff === 1) utility += 10;
      if(diff === 2) utility += 5;
    }
  }

  return utility + tile.number / 10;
}

function analyzeHand(hand){
  const normalTiles = hand.filter(t => !isOkey(t));
  const okeys = hand.filter(t => isOkey(t));
  let groups = [];

  groups = groups.concat(findRuns(normalTiles));
  groups = groups.concat(findSets(normalTiles));

  groups.sort((a, b) => b.score - a.score);

  const used = new Set();
  const chosen = [];

  for(const group of groups){
    const conflict = group.tiles.some(t => used.has(t.id));
    if(!conflict){
      chosen.push(group);
      group.tiles.forEach(t => used.add(t.id));
    }
  }

  let openScore = chosen.reduce((sum, g) => sum + g.score, 0);

  // Okeyleri basit joker gibi en yüksek gruplara destek olarak sayıyoruz.
  // İlk sürümde gelişmiş joker yerleştirme tam kusursuz değildir ama gerçek oyuna yakın hesaplar.
  for(const joker of okeys){
    if(chosen.length > 0){
      openScore += 13;
      used.add(joker.id);
      chosen[0].tiles.push(joker);
      chosen[0].score += 13;
    }
  }

  const deadScore = hand
    .filter(t => !used.has(t.id))
    .reduce((sum, t) => sum + deadTilePoint(t), 0);

  return {
    groups: chosen,
    openScore,
    deadScore
  };
}

function findRuns(tiles){
  const groups = [];

  for(const color of COLORS){
    const sameColor = tiles
      .filter(t => !t.fake && t.color === color)
      .sort((a, b) => a.number - b.number);

    for(let i = 0; i < sameColor.length; i++){
      let run = [sameColor[i]];

      for(let j = i + 1; j < sameColor.length; j++){
        const last = run[run.length - 1];

        if(sameColor[j].number === last.number + 1){
          run.push(sameColor[j]);

          if(run.length >= 3){
            groups.push({
              type: "seri",
              tiles: [...run],
              score: run.reduce((s, t) => s + t.number, 0)
            });
          }
        } else if(sameColor[j].number > last.number + 1){
          break;
        }
      }
    }
  }

  return groups;
}

function findSets(tiles){
  const groups = [];

  for(let number = 1; number <= 13; number++){
    const sameNumber = tiles
      .filter(t => !t.fake && t.number === number)
      .sort((a, b) => colorRank(a.color) - colorRank(b.color));

    const uniqueByColor = [];
    const seen = new Set();

    for(const tile of sameNumber){
      if(!seen.has(tile.color)){
        uniqueByColor.push(tile);
        seen.add(tile.color);
      }
    }

    if(uniqueByColor.length >= 3){
      groups.push({
        type: "per",
        tiles: uniqueByColor.slice(0, 3),
        score: number * 3
      });
    }

    if(uniqueByColor.length >= 4){
      groups.push({
        type: "per",
        tiles: uniqueByColor.slice(0, 4),
        score: number * 4
      });
    }
  }

  return groups;
}

function deadTilePoint(tile){
  if(isOkey(tile)) return 0;
  if(isFakeOkey(tile)) return state.okey.number;
  return tile.number;
}

function finishByPlayer(playerIndex){
  state.locked = true;

  const winnerName = state.names[playerIndex];
  addLog(`${winnerName} eli bitirdi.`);

  for(let i = 0; i < 4; i++){
    if(i === playerIndex){
      state.scores[i] -= 101;
      continue;
    }

    const analysis = analyzeHand(state.players[i]);

    if(state.opened[i]){
      state.scores[i] += analysis.deadScore;
    } else {
      state.scores[i] += 202;
    }
  }

  render101(`${winnerName} eli bitirdi. Puanlar hesaplandı.`);
}

function endRound(reason){
  state.locked = true;
  addLog(reason);

  for(let i = 0; i < 4; i++){
    const analysis = analyzeHand(state.players[i]);
    state.scores[i] += state.opened[i] ? analysis.deadScore : 101;
  }

  render101(reason);
}

function addLog(text){
  const list = document.getElementById("logList");
  if(!list) return;

  const div = document.createElement("div");
  div.className = "logItem";
  div.textContent = text;
  list.prepend(div);
}
