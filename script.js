"use strict";

// 상태: 신뢰도(trust), 부스 준비 시간(booth, 분), 이후 단계에 영향을 주는 플래그
const START_BOOTH = 90;
let state;
let stageIndex;

function resetState() {
  state = { trust: 0, booth: START_BOOTH, knewNeed: false, knewDeadline: false, history: [] };
  stageIndex = -1;
}

// 대사: [화자, 내용] — 화자: narr(상황 설명) / other(상대) / me(플레이어)
const STAGES = [
  {
    name: "1. 도입",
    scene: [
      ["narr", "학급 행사 준비 기간. 교실은 하나뿐인데, 부스 운영팀(우리)과 공연 준비팀이 모두 이 교실을 쓰고 싶어 한다."],
      ["narr", "🎯 우리 목표: 부스 준비에 필요한 교실 시간 90분 확보\n🎯 상대 목표: 공연 연습 장소 확보"],
      ["narr", "당신은 부스 운영팀 대표. 공연 준비팀 대표가 협상을 하러 왔다."],
    ],
    choices: [{ label: "협상 시작하기", primary: true }],
  },
  {
    name: "2. 정보 단계",
    scene: [["other", "공연 연습 때문에 교실을 1시간 비워주세요."]],
    choices: [
      {
        label: "A. \"왜 1시간이 필요한가요?\"",
        lines: [
          ["me", "왜 1시간이 필요한가요?"],
          ["other", "사실 마지막 30분만 교실이 필요해요."],
          ["me", "그럼 앞의 30분은 저희가 쓰고 이후에 넘겨드리는 방법도 생각해 볼 수 있겠네요."],
          ["other", "오, 그 방향이면 저도 좋을 것 같아요. 자세한 건 마지막에 정해요!"],
          ["narr", "상대의 진짜 필요를 알게 됐다. 아직 최종 합의는 아니다. 부스 준비 시간은 이 방향으로 예상한 값이다."],
        ],
        effects: { trust: +1, booth: -30 },
        set: { knewNeed: true },
        summary: "상대의 진짜 필요를 물어봤다",
      },
      {
        label: "B. \"알겠습니다. 1시간 비울게요.\"",
        lines: [
          ["me", "알겠습니다. 1시간 비울게요."],
          ["other", "고마워요. 그럼 1시간을 기준으로 생각할게요. 자세한 건 마지막에 정해요."],
          ["narr", "사실 상대는 30분이면 충분했지만, 묻지 않아서 알 수 없었다. 이대로면 부스 준비 시간이 불필요하게 줄어든다. (예상값)"],
        ],
        effects: { booth: -60 },
        summary: "이유를 묻지 않고 바로 수락했다",
      },
    ],
  },
  {
    name: "3. 시간 단계",
    scene: [["other", "그리고 이 협상은 오늘 안에 끝내야 해요. 지금 정하지 않으면 교실 못 써요!"]],
    choices: [
      {
        label: "A. \"정말 오늘까지가 마감인가요? 확인해 볼게요.\"",
        lines: [
          ["me", "정말 오늘까지가 마감인가요? 확인해 볼게요."],
          ["other", "음… 담임 선생님께 물어보니 내일 점심시간까지만 정하면 된대요."],
          ["narr", "실제 마감은 내일이었다. 서두를 필요가 없어졌고, 내일 아침 교실을 10분 더 쓸 여유가 생겼다."],
        ],
        effects: { trust: +1, booth: +10 },
        set: { knewDeadline: true },
        summary: "실제 마감을 확인했다",
      },
      {
        label: "B. \"알겠어요, 그럼 오늘 안에 바로 정할게요.\"",
        lines: [
          ["me", "알겠어요, 그럼 오늘 안에 바로 정할게요."],
          ["other", "좋아요, 그럼 서둘러 마지막 조건을 정해요."],
          ["narr", "마감을 확인하지 않고 서두르느라 협상 여유를 잃었다. 부스 준비 시간 예상이 10분 더 줄었다."],
        ],
        effects: { booth: -10 },
        summary: "마감 압박에 성급하게 수락했다",
      },
    ],
  },
  {
    name: "4. 합의 단계",
    scene: [
      ["narr", "여기서 최종 합의를 정한다. 지금까지 나눈 이야기를 바탕으로 마지막 제안을 하자."],
    ],
    choices: [
      {
        label: "A. 공동이익 대안 제시: \"시간을 나눠 쓰고, 부스 시연 때 공연 홍보도 같이 해요.\"",
        id: "alt",
        summary: "공동이익 대안을 제시했다",
      },
      {
        label: "B. 일방적 요구: \"교실은 저희가 계속 쓸게요. 연습은 다른 데서 하세요.\"",
        id: "demand",
        summary: "일방적으로 요구했다",
      },
    ],
  },
];

// 결말 3종
const ENDINGS = {
  win: {
    cls: "win", emoji: "🎉", title: "윈윈 합의",
    text: "서로의 사정을 확인하며 둘 모두에게 이익이 되는 대안을 함께 만들었다. 공연팀은 연습 시간을, 부스팀은 준비 시간과 홍보 효과를 얻었다.",
  },
  lopsided: {
    cls: "lopsided", emoji: "😐", title: "일방적 합의",
    text: "합의는 했지만 한쪽에 치우친 결과다. 한쪽의 불만이 남아 행사 내내 어색한 분위기가 이어질 것 같다.",
  },
  fail: {
    cls: "fail", emoji: "💥", title: "협상 결렬",
    text: "신뢰가 쌓이지 않은 채 일방적으로 요구하자 상대가 자리를 떠났다. 교실 사용 문제는 해결되지 않았다.",
  },
};

const $ = (id) => document.getElementById(id);

function addMsg(kind, text) {
  const div = document.createElement("div");
  div.className = "msg " + kind;
  if (kind === "other" || kind === "me") {
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = kind === "me" ? "나 (부스팀)" : "공연팀";
    div.appendChild(who);
  }
  const body = document.createElement("span");
  body.style.whiteSpace = "pre-line";
  body.textContent = text;
  div.appendChild(body);
  $("log").appendChild(div);
}

function addEffects(eff) {
  const names = { trust: ["신뢰도", ""], booth: ["부스 준비 시간", "분"] };
  const wrap = document.createElement("div");
  wrap.className = "effects";
  Object.entries(eff).forEach(([k, v]) => {
    const s = document.createElement("span");
    s.className = "fx " + (v > 0 ? "good" : "bad");
    s.textContent = `${names[k][0]} ${v > 0 ? "+" : ""}${v}${names[k][1]}`;
    wrap.appendChild(s);
  });
  $("log").appendChild(wrap);
}

function applyEffects(eff, set) {
  if (eff) {
    state.trust = Math.max(0, state.trust + (eff.trust || 0));
    state.booth = Math.max(0, state.booth + (eff.booth || 0));
  }
  if (set) Object.assign(state, set);
  $("trust").textContent = state.trust;
  $("booth").textContent = state.booth;
}

function setChoices(list) {
  const box = $("choices");
  box.replaceChildren();
  list.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c.label;
    if (c.primary) b.className = "primary";
    b.addEventListener("click", c.onClick);
    box.appendChild(b);
  });
  const first = box.querySelector("button");
  if (first) first.focus({ preventScroll: true });
  if (stageIndex > 0) reveal();
}

// 새 대화 묶음의 시작 위치를 기억해 두고, 스크롤할 때 첫 줄이 가려지지 않게 한다.
let batchStart = 0;
function markBatch() {
  batchStart = $("log").children.length;
}

// 대화+선택지가 한 화면에 들어가면 둘 다 보이게, 아니면 새 대화의 첫 줄이 위에 오게 스크롤
function reveal() {
  const firstNew = $("log").children[batchStart];
  if (!firstNew) return;
  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const behavior = calm ? "auto" : "smooth";
  const box = $("choices");
  const top = firstNew.getBoundingClientRect().top;
  const needed = box.getBoundingClientRect().bottom - top + 16;
  if (needed <= window.innerHeight) {
    box.scrollIntoView({ block: "end", behavior });
  } else {
    window.scrollTo({ top: window.scrollY + top - 12, behavior });
  }
}

function showStage(i) {
  markBatch();
  stageIndex = i;
  const st = STAGES[i];
  $("stageName").textContent = st.name;
  $("bar").style.width = (i / STAGES.length) * 100 + "%";
  st.scene.forEach(([k, t]) => addMsg(k, t));

  setChoices(st.choices.map((c) => ({
    label: c.label,
    primary: c.primary,
    onClick: () => choose(c),
  })));
}

function choose(c) {
  if (stageIndex === 0) return nextStage();
  state.history.push(c.summary);
  if (stageIndex === STAGES.length - 1) return finalNegotiation(c);

  markBatch();
  c.lines.forEach(([k, t]) => addMsg(k, t));
  applyEffects(c.effects, c.set);
  addEffects(c.effects);
  setChoices([{ label: "다음 ▶", primary: true, onClick: nextStage }]);
}

function nextStage() {
  showStage(stageIndex + 1);
}

// 합의 단계: 앞 단계 선택(신뢰도)에 따라 결말이 갈린다. 최종 합의 내용은 여기서만 정해진다.
function finalNegotiation(c) {
  markBatch();
  let ending, lines, eff;
  if (c.id === "alt") {
    const plan = state.knewNeed
      ? "앞 30분은 저희가 쓰고, 뒤 30분은 연습에 쓰세요. 대신 부스 시연 때 공연 홍보도 같이 할게요."
      : "연습 시간표를 같이 짜서 나눠 쓰고, 부스 시연 때 공연 홍보도 같이 할게요.";
    lines = [["me", plan]];
    if (state.trust >= 1) {
      lines.push(["other", "좋아요! 서로 도움이 되네요. 그렇게 해요."]);
      lines.push(["narr", state.knewNeed
        ? "✅ 최종 합의: 앞 30분은 부스팀, 뒤 30분은 공연팀이 쓰고 서로 홍보도 돕기로 했다. 정리까지 함께 해서 10분을 더 아꼈다."
        : "✅ 최종 합의: 교실을 시간표로 나눠 쓰고 서로 홍보도 돕기로 했다. 정리까지 함께 해서 10분을 더 아꼈다."]);
      ending = "win";
      eff = { trust: +1, booth: +10 };
    } else {
      lines.push(["other", "좋은 생각이긴 한데… 아까 이유도 안 묻고 다 받아 주셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠."]);
      lines.push(["narr", "✅ 최종 합의: 서로의 필요를 확인하지 않아 대안이 힘을 얻지 못했다. 공연팀 요구대로 교실을 내주고, 연습 마무리 시간 10분까지 더 양보했다. (부스팀만 양보)"]);
      ending = "lopsided";
      eff = { booth: -10 };
    }
  } else {
    lines = [["me", "교실은 저희가 계속 쓸게요. 연습은 다른 데서 하세요."]];
    if (state.trust >= 2) {
      lines.push(["other", "…알겠어요. 제 사정을 물어봐 주셨던 건 고마웠으니까, 이번엔 제가 양보할게요."]);
      lines.push(["narr", "✅ 최종 합의: 앞서 나눈 30분 양보 이야기는 없던 일이 되고 부스팀이 교실을 계속 쓰기로 했다. 부스는 20분을 되찾았지만 공연팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)"]);
      ending = "lopsided";
      eff = { trust: -1, booth: +20 };
    } else {
      lines.push(["other", "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!"]);
      lines.push(["narr", "❌ 합의 없이 협상이 끝났다. 교실 배정이 선생님 결정으로 넘어가 부스 준비 시간 20분을 잃었다. (신뢰도 -1)"]);
      ending = "fail";
      eff = { trust: -1, booth: -20 };
    }
  }
  lines.forEach(([k, t]) => addMsg(k, t));
  applyEffects(eff);
  addEffects(eff);
  setChoices([{ label: "결과 보기 ▶", primary: true, onClick: () => showEnding(ending) }]);
}

function showEnding(key) {
  markBatch();
  const e = ENDINGS[key];
  $("stageName").textContent = "5. 결말";
  $("bar").style.width = "100%";

  const card = document.createElement("div");
  card.className = "result " + e.cls;

  const emoji = document.createElement("div");
  emoji.className = "emoji";
  emoji.textContent = e.emoji;
  const h = document.createElement("h2");
  h.textContent = e.title;
  const p = document.createElement("p");
  p.textContent = e.text;
  const score = document.createElement("p");
  score.textContent = `최종 신뢰도 ${state.trust} · 최종 부스 준비 시간 ${state.booth}분`;
  const ul = document.createElement("ul");
  state.history.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    ul.appendChild(li);
  });
  const lesson = document.createElement("div");
  lesson.className = "lesson";
  lesson.textContent = "💡 포인트: 입장(\"1시간 비워주세요\") 뒤에 숨은 진짜 필요를 묻고, 마감이 정말 급한지 확인한 뒤, 서로 이익이 되는 대안을 내보자.";

  card.append(emoji, h, p, score, ul, lesson);
  $("log").appendChild(card);

  setChoices([{ label: "🔄 다시 시작", primary: true, onClick: startGame }]);
}

function startGame() {
  resetState();
  $("log").replaceChildren();
  applyEffects();
  showStage(0);
  window.scrollTo({ top: 0 });
}

startGame();
