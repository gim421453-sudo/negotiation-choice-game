"use strict";

// ───────── 시나리오 데이터 ─────────
// 세 시나리오는 같은 구조(도입 → 정보 질문 → 시간 압박 판단 → 합의 제안 → 결말)를 쓰고
// 대사·선택지·수치(n)만 다르다. n: S 시작 준비 시간, g 필요만큼 내주는 시간, h 묻지 않고 다 내주는 시간,
// t 마감 확인(+)/성급한 수락(-) 시간, w 윈윈 보너스, l 일방적 합의 손실, f 결렬 손실 (단위: 분)
const SCENARIOS = [
  {
    id: "room", emoji: "🏫", title: "① 교실 사용 시간 협상", sub: "부스 운영팀 vs 공연 준비팀",
    res: "부스 준비 시간", meName: "나 (부스팀)", otherName: "공연팀",
    n: { S: 90, g: 30, h: 60, t: 10, w: 10, l: 10, f: 20 },
    intro: [
      "학급 행사 준비 기간. 교실은 하나뿐인데, 부스 운영팀(우리)과 공연 준비팀이 모두 이 교실을 쓰고 싶어 한다.",
      "🎯 우리 목표: 부스 준비에 필요한 교실 시간 90분 확보\n🎯 상대 목표: 공연 연습 장소 확보",
      "당신은 부스 운영팀 대표. 공연 준비팀 대표가 협상을 하러 왔다.",
    ],
    info: {
      open: "공연 연습 때문에 교실을 1시간 비워주세요.",
      ask: { say: "왜 1시간이 필요한가요?", reply: "사실 마지막 30분만 교실이 필요해요." },
      share: {
        say: "그럼 앞의 30분은 저희가 쓰고 이후에 넘겨드리는 방법은 어때요?",
        reply: "오, 그 방향이면 저도 좋을 것 같아요. 자세한 건 마지막에 정해요!",
        narr: "상대의 진짜 필요를 알게 됐다. 아직 최종 합의는 아니다. 부스 준비 시간은 이 방향으로 예상한 값이다.",
      },
      press: {
        say: "그렇군요. 그래도 저희가 준비가 급해서요. 연습은 다른 곳에서 하면 안 될까요?",
        reply: "음… 그건 좀 곤란해요. 다른 데는 연습할 장소가 없어요.",
        narr: "필요를 알고도 내 몫만 먼저 내세웠다. 상대와 사이가 서먹해졌다.",
      },
      accept: {
        say: "알겠습니다. 1시간 비울게요.",
        reply: "고마워요. 그럼 1시간을 기준으로 생각할게요. 자세한 건 마지막에 정해요.",
        narr: "사실 상대는 30분이면 충분했지만, 묻지 않아서 알 수 없었다. 이대로면 부스 준비 시간이 불필요하게 줄어든다. (예상값)",
      },
    },
    time: {
      open: "그리고 이 협상은 오늘 안에 끝내야 해요. 지금 정하지 않으면 교실 못 써요!",
      check: {
        say: "정말 오늘까지가 마감인가요? 확인해 볼게요.",
        reply: "음… 담임 선생님께 물어보니 내일 점심시간까지만 정하면 된대요.",
        narr: "실제 마감은 내일이었다. 서두를 필요가 없어졌고, 내일 아침 교실을 10분 더 쓸 여유가 생겼다.",
      },
      rush: {
        say: "알겠어요, 그럼 오늘 안에 바로 정할게요.",
        reply: "좋아요, 그럼 서둘러 마지막 조건을 정해요.",
        narr: "마감을 확인하지 않고 서두르느라 협상 여유를 잃었다. 부스 준비 시간 예상이 10분 더 줄었다.",
      },
    },
    deal: {
      altKnew: "앞 30분은 저희가 쓰고, 뒤 30분은 연습에 쓰세요. 대신 부스 시연 때 공연 홍보도 같이 할게요.",
      altPlain: "연습 시간표를 같이 짜서 나눠 쓰고, 부스 시연 때 공연 홍보도 같이 할게요.",
      win: "좋아요! 서로 도움이 되네요. 그렇게 해요.",
      winPressed: "아까는 서운했는데, 이 제안은 괜찮네요. 그렇게 해요.",
      winNarrKnew: "✅ 최종 합의: 앞 30분은 부스팀, 뒤 30분은 공연팀이 쓰고 서로 홍보도 돕기로 했다. 정리까지 함께 해서 10분을 더 아꼈다.",
      winNarr: "✅ 최종 합의: 교실을 시간표로 나눠 쓰고 서로 홍보도 돕기로 했다. 정리까지 함께 해서 10분을 더 아꼈다.",
      lopHasty: "좋은 생각이긴 한데… 아까 이유도 안 묻고 다 받아 주셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠.",
      lopHastyNarr: "✅ 최종 합의: 서로의 필요를 확인하지 않아 대안이 힘을 얻지 못했다. 공연팀 요구대로 교실을 내주고, 연습 마무리 시간 10분까지 더 양보했다. (부스팀만 양보)",
      lopPressed: "좋은 생각이긴 한데… 아까 연습은 다른 데서 하라고 하셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠.",
      lopPressedNarr: "✅ 최종 합의: 서운함이 남은 상대는 대안을 받아들이지 않았다. 공연팀 요구대로 교실을 1시간 비워 주기로 했다. (부스팀만 양보)",
      demand: "교실은 저희가 계속 쓸게요. 연습은 다른 데서 하세요.",
      demandOk: "…알겠어요. 제 사정을 물어봐 주셨던 건 고마웠으니까, 이번엔 제가 양보할게요.",
      demandOkNarr: "✅ 최종 합의: 앞서 나눈 30분 양보 이야기는 없던 일이 되고 부스팀이 교실을 계속 쓰기로 했다. 부스는 20분을 되찾았지만 공연팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)",
      demandNo: "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!",
      demandNoNarr: "❌ 합의 없이 협상이 끝났다. 교실 배정이 선생님 결정으로 넘어가 부스 준비 시간 20분을 잃었다. (신뢰도 -1)",
    },
    lesson: "입장(\"1시간 비워주세요\") 뒤에 숨은 진짜 필요를 묻고, 마감이 정말 급한지 확인한 뒤, 서로 이익이 되는 대안을 내보자.",
  },
  {
    id: "audio", emoji: "🎤", title: "② 방송 장비 사용 시간 협상", sub: "영상 상영팀 vs 사회·진행팀",
    res: "영상 리허설 시간", meName: "나 (영상팀)", otherName: "진행팀",
    n: { S: 60, g: 15, h: 40, t: 5, w: 5, l: 5, f: 10 },
    intro: [
      "학급 행사 준비 기간. 방송 장비(마이크·스피커 세트)는 하나뿐인데, 영상 상영팀(우리)과 사회·진행팀이 모두 이 장비를 쓰고 싶어 한다.",
      "🎯 우리 목표: 영상 리허설에 필요한 장비 시간 60분 확보\n🎯 상대 목표: 진행 연습에 쓸 마이크 확보",
      "당신은 영상 상영팀 대표. 사회·진행팀 대표가 협상을 하러 왔다.",
    ],
    info: {
      open: "진행 연습을 해야 해서 방송 장비를 40분 동안 빌려 주세요.",
      ask: { say: "왜 40분이나 필요한가요?", reply: "사실 마이크 음량 확인만 하면 돼서, 15분이면 충분해요." },
      share: {
        say: "그럼 15분만 먼저 쓰시고, 나머지 시간은 저희 영상 리허설에 쓰는 방법은 어때요?",
        reply: "좋아요, 그 방향이면 저희도 편해요. 자세한 건 마지막에 정해요!",
        narr: "상대의 진짜 필요를 알게 됐다. 아직 최종 합의는 아니다. 영상 리허설 시간은 이 방향으로 예상한 값이다.",
      },
      press: {
        say: "그래도 영상 리허설이 급해서요. 마이크는 다른 걸 알아보시면 안 될까요?",
        reply: "다른 마이크는 없어요… 곤란한데요.",
        narr: "필요를 알고도 내 몫만 먼저 내세웠다. 상대와 사이가 서먹해졌다.",
      },
      accept: {
        say: "알겠어요. 40분 동안 쓰세요.",
        reply: "고마워요! 그럼 40분을 기준으로 생각할게요. 자세한 건 마지막에 정해요.",
        narr: "사실 상대는 15분이면 충분했지만, 묻지 않아서 알 수 없었다. 이대로면 영상 리허설 시간이 불필요하게 줄어든다. (예상값)",
      },
    },
    time: {
      open: "그리고 장비 예약표는 오늘 안에 내야 해요. 오늘 안 내면 장비를 못 쓴대요!",
      check: {
        say: "정말 오늘까지가 마감인가요? 방송부 선생님께 확인해 볼게요.",
        reply: "음… 선생님께 여쭤보니 내일 아침 조회 전까지만 내면 된대요.",
        narr: "실제 마감은 내일이었다. 서두를 필요가 없어졌고, 내일 아침 장비를 5분 더 쓸 여유가 생겼다.",
      },
      rush: {
        say: "알겠어요, 그럼 오늘 안에 예약표를 정해서 낼게요.",
        reply: "좋아요, 그럼 서둘러 마지막 조건을 정해요.",
        narr: "마감을 확인하지 않고 서두르느라 협상 여유를 잃었다. 영상 리허설 시간 예상이 5분 더 줄었다.",
      },
    },
    deal: {
      altKnew: "마이크 확인 15분은 먼저 쓰세요. 나머지는 저희 영상 리허설에 쓰고, 행사 때 진행팀은 영상 소개 멘트를, 저희는 진행 순서에 맞춰 영상을 틀게요.",
      altPlain: "장비 사용 시간표를 같이 짜서 나눠 쓰고, 행사 때 소개 멘트와 영상 순서도 서로 맞춰 봐요.",
      win: "좋아요! 서로 도움이 되네요. 그렇게 해요.",
      winPressed: "아까는 서운했는데, 이 제안은 괜찮네요. 그렇게 해요.",
      winNarrKnew: "✅ 최종 합의: 처음 15분은 진행팀이 마이크를 확인하고, 이후 시간은 영상팀이 리허설에 쓰기로 했다. 소개 멘트와 영상 순서도 함께 맞춰 5분을 더 아꼈다.",
      winNarr: "✅ 최종 합의: 장비를 시간표로 나눠 쓰고 소개 멘트와 영상 순서도 맞추기로 했다. 함께 정리해 5분을 더 아꼈다.",
      lopHasty: "좋은 생각이긴 한데… 아까 이유도 안 묻고 다 빌려 주셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠.",
      lopHastyNarr: "✅ 최종 합의: 서로의 필요를 확인하지 않아 대안이 힘을 얻지 못했다. 진행팀 요구대로 장비를 내주고, 영상 리허설 시간 5분까지 더 양보했다. (영상팀만 양보)",
      lopPressed: "좋은 생각이긴 한데… 아까 마이크는 다른 걸 알아보라고 하셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠.",
      lopPressedNarr: "✅ 최종 합의: 서운함이 남은 상대는 대안을 받아들이지 않았다. 진행팀 요구대로 장비를 40분 빌려주기로 했다. (영상팀만 양보)",
      demand: "방송 장비는 저희가 계속 쓸게요. 진행 연습은 장비 없이 하세요.",
      demandOk: "…알겠어요. 제 사정을 물어봐 주셨던 건 고마웠으니까, 이번엔 제가 양보할게요.",
      demandOkNarr: "✅ 최종 합의: 앞서 나눈 15분 양보 이야기는 없던 일이 되고 영상팀이 장비를 계속 쓰기로 했다. 리허설 시간을 10분 되찾았지만 진행팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)",
      demandNo: "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!",
      demandNoNarr: "❌ 합의 없이 협상이 끝났다. 장비 배정이 선생님 결정으로 넘어가 영상 리허설 시간 10분을 잃었다. (신뢰도 -1)",
    },
    lesson: "\"40분 빌려 주세요\"라는 요구 뒤에는 \"음량 확인\"이라는 진짜 목적이 있었다. 목적을 묻고, 예약 마감을 확인한 뒤, 서로 돕는 대안을 내보자.",
  },
  {
    id: "crew", emoji: "🙋", title: "③ 행사 준비 인력 협상", sub: "장식팀 vs 안내·접수팀",
    res: "장식 준비 시간", meName: "나 (장식팀)", otherName: "안내팀",
    n: { S: 120, g: 40, h: 80, t: 10, w: 10, l: 10, f: 20 },
    intro: [
      "학급 행사 준비 기간. 할 일은 많은데 도와줄 친구는 한정돼 있다. 장식팀(우리)과 안내·접수팀이 서로 인력을 놓고 협상한다.",
      "🎯 우리 목표: 행사장 장식에 쓸 준비 시간 120분 확보\n🎯 상대 목표: 접수대 설치에 필요한 일손 확보",
      "당신은 장식팀 대표. 안내·접수팀 대표가 협상을 하러 왔다.",
    ],
    info: {
      open: "접수대 설치에 일손이 부족해요. 장식팀 친구들을 80분 동안 빌려 주세요.",
      ask: { say: "어떤 일 때문에 80분이나 필요한가요?", reply: "사실 무거운 책상이랑 안내판을 옮기는 일만 하면 돼서, 40분이면 끝나요." },
      share: {
        say: "그럼 책상 옮기는 40분만 저희가 도울게요. 나머지 시간은 장식을 계속하는 방법은 어때요?",
        reply: "오, 그 방향이면 정말 고마워요. 자세한 건 마지막에 정해요!",
        narr: "상대의 진짜 필요를 알게 됐다. 아직 최종 합의는 아니다. 장식 준비 시간은 이 방향으로 예상한 값이다.",
      },
      press: {
        say: "그래도 장식이 너무 급해요. 접수대는 안내팀끼리 알아서 해결하면 안 될까요?",
        reply: "저희 인원만으로는 책상을 못 옮겨요… 곤란해요.",
        narr: "필요를 알고도 내 몫만 먼저 내세웠다. 상대와 사이가 서먹해졌다.",
      },
      accept: {
        say: "알겠어요. 80분 동안 저희 친구들을 보낼게요.",
        reply: "고마워요! 그럼 80분을 기준으로 생각할게요. 자세한 건 마지막에 정해요.",
        narr: "사실 상대는 40분이면 충분했지만, 묻지 않아서 알 수 없었다. 이대로면 장식 준비 시간이 불필요하게 줄어든다. (예상값)",
      },
    },
    time: {
      open: "그리고 인원 배치표는 점심 전에 확정해야 해요. 지금 안 정하면 일손을 못 구해요!",
      check: {
        say: "정말 점심 전까지가 마감인가요? 담임 선생님께 확인해 볼게요.",
        reply: "음… 담임 선생님께 여쭤보니 내일 아침 조회 전까지만 내면 된대요.",
        narr: "실제 마감은 내일이었다. 서두를 필요가 없어졌고, 내일 아침 장식 준비를 10분 더 할 여유가 생겼다.",
      },
      rush: {
        say: "알겠어요, 그럼 점심 전에 바로 정할게요.",
        reply: "좋아요, 그럼 서둘러 마지막 조건을 정해요.",
        narr: "마감을 확인하지 않고 서두르느라 협상 여유를 잃었다. 장식 준비 시간 예상이 10분 더 줄었다.",
      },
    },
    deal: {
      altKnew: "처음 40분은 저희 친구들이 책상 옮기는 걸 돕고, 이후에는 장식에 집중할게요. 대신 접수대가 끝나면 안내팀도 장식을 도와주세요.",
      altPlain: "일손을 시간표로 나눠서 서로 번갈아 돕기로 해요. 접수대 설치가 끝나면 안내팀도 장식을 도와주세요.",
      win: "좋아요! 서로 도움이 되네요. 그렇게 해요.",
      winPressed: "아까는 서운했는데, 이 제안은 괜찮네요. 그렇게 해요.",
      winNarrKnew: "✅ 최종 합의: 장식팀이 처음 40분 동안 책상 옮기기를 돕고, 이후에는 안내팀이 장식을 도와주기로 했다. 서로 돕다 보니 10분을 더 아꼈다.",
      winNarr: "✅ 최종 합의: 일손을 시간표로 나눠 번갈아 돕기로 했다. 서로 돕다 보니 10분을 더 아꼈다.",
      lopHasty: "좋은 생각이긴 한데… 아까 이유도 안 묻고 다 보내 주셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠.",
      lopHastyNarr: "✅ 최종 합의: 서로의 필요를 확인하지 않아 대안이 힘을 얻지 못했다. 안내팀 요구대로 인원을 보내고, 장식 준비 시간 10분까지 더 양보했다. (장식팀만 양보)",
      lopPressed: "좋은 생각이긴 한데… 아까 접수대는 알아서 하라고 하셨잖아요. 그냥 제가 말한 대로 하는 게 편하죠.",
      lopPressedNarr: "✅ 최종 합의: 서운함이 남은 상대는 대안을 받아들이지 않았다. 안내팀 요구대로 인원을 80분 보내기로 했다. (장식팀만 양보)",
      demand: "저희 인원은 한 명도 못 빌려드려요. 접수대는 안내팀이 알아서 하세요.",
      demandOk: "…알겠어요. 제 사정을 물어봐 주셨던 건 고마웠으니까, 이번엔 저희가 알아서 해 볼게요.",
      demandOkNarr: "✅ 최종 합의: 앞서 나눈 40분 도움 이야기는 없던 일이 되고 장식팀이 인원을 그대로 쓰기로 했다. 장식 시간을 30분 되찾았지만 안내팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)",
      demandNo: "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!",
      demandNoNarr: "❌ 합의 없이 협상이 끝났다. 인력 배치가 선생님 결정으로 넘어가 장식 준비 시간 20분을 잃었다. (신뢰도 -1)",
    },
    lesson: "\"80분 빌려 주세요\" 뒤에는 \"책상 옮기기\"라는 진짜 일이 있었다. 어떤 일인지 묻고, 배치표 마감을 확인한 뒤, 서로 돕는 대안을 내보자.",
  },
];

// ───────── 상태 ─────────
const STAGE_NAMES = ["1. 도입", "2. 정보 단계", "3. 시간 단계", "4. 합의 단계", "5. 결말"];

const ENDINGS = {
  win: {
    cls: "win", emoji: "🎉", title: "윈윈 합의",
    text: "서로의 사정을 확인하며 둘 모두에게 이익이 되는 대안을 함께 만들었다. 두 팀 모두 꼭 필요한 것을 얻었다.",
  },
  lopsided: {
    cls: "lopsided", emoji: "😐", title: "일방적 합의",
    text: "합의는 했지만 한쪽에 치우친 결과다. 한쪽의 불만이 남아 행사 내내 어색한 분위기가 이어질 것 같다.",
  },
  fail: {
    cls: "fail", emoji: "💥", title: "협상 결렬",
    text: "신뢰가 쌓이지 않은 채 일방적으로 요구하자 상대가 자리를 떠났다. 문제는 해결되지 않았다.",
  },
};

const $ = (id) => document.getElementById(id);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const val = (x) => (typeof x === "function" ? x(state) : x);

let state;          // { trust, booth, knewNeed, pressed, history }
let scenario = null;
let stageIndex = -1;
let busy = false;   // 상대 응답 연출 중에는 입력을 받지 않는다

function resetState() {
  scenario = null;
  stageIndex = -1;
  busy = false;
  state = { trust: 0, booth: 0, knewNeed: false, pressed: false, history: [] };
}

// ───────── 대화 트리 만들기 ─────────
// 노드: { open: [[화자, 대사]...], choices: [선택지...] }
// 선택지: { say(플레이어 발언), tag, reply, eff, set, summary, next(다음 노드) 또는 ending }
// say/reply/eff/ending 은 값 또는 (state) => 값. 선택한 순간의 상태로 결정된다.
function buildStages(d) {
  const { g, h, t, w, l, f } = d.n;
  const R = (k, text) => [k, text];

  const info = {
    open: [R("other", d.info.open)],
    choices: [
      {
        say: d.info.ask.say, reply: [R("other", d.info.ask.reply)],
        eff: { trust: +1 }, set: { knewNeed: true }, summary: "상대의 진짜 필요를 물어봤다",
        next: {
          open: [],
          choices: [
            {
              say: d.info.share.say, reply: [R("other", d.info.share.reply), R("narr", d.info.share.narr)],
              eff: { trust: +1, booth: -g }, summary: "나눠 쓰는 방향을 제안했다",
            },
            {
              say: d.info.press.say, reply: [R("other", d.info.press.reply), R("narr", d.info.press.narr)],
              eff: { trust: -1 }, set: { pressed: true }, summary: "필요를 알고도 내 몫을 먼저 내세웠다",
            },
          ],
        },
      },
      {
        say: d.info.accept.say, reply: [R("other", d.info.accept.reply), R("narr", d.info.accept.narr)],
        eff: { booth: -h }, summary: "이유를 묻지 않고 바로 수락했다",
      },
    ],
  };

  const time = {
    open: [R("other", d.time.open)],
    choices: [
      {
        say: d.time.check.say, reply: [R("other", d.time.check.reply), R("narr", d.time.check.narr)],
        eff: { trust: +1, booth: +t }, summary: "실제 마감을 확인했다",
      },
      {
        say: d.time.rush.say, reply: [R("other", d.time.rush.reply), R("narr", d.time.rush.narr)],
        eff: { booth: -t }, summary: "마감 압박에 성급하게 수락했다",
      },
    ],
  };

  // 합의 단계: 최종 합의는 여기서만 정해진다. 신뢰도(앞 단계 선택의 누적)로 결과가 갈린다.
  const deal = {
    open: [R("narr", "여기서 최종 합의를 정한다. 지금까지 나눈 이야기를 바탕으로 마지막 제안을 하자.")],
    choices: [
      {
        tag: "공동이익 대안 제시",
        say: (s) => (s.knewNeed ? d.deal.altKnew : d.deal.altPlain),
        summary: "공동이익 대안을 제시했다",
        reply: (s) => s.trust >= 1
          ? [R("other", s.pressed ? d.deal.winPressed : d.deal.win), R("narr", s.knewNeed ? d.deal.winNarrKnew : d.deal.winNarr)]
          : [R("other", s.pressed ? d.deal.lopPressed : d.deal.lopHasty), R("narr", s.pressed ? d.deal.lopPressedNarr : d.deal.lopHastyNarr)],
        // 대안이 거절되면 상대 요구대로 흘러간다: 이미 h분을 내준 경로(바로 수락)는 l분 더, 아직 안 내준 경로(고집)는 h분을 내준다.
        eff: (s) => (s.trust >= 1 ? { trust: +1, booth: +w } : { booth: s.pressed ? -h : -l }),
        ending: (s) => (s.trust >= 1 ? "win" : "lopsided"),
      },
      {
        tag: "일방적 요구",
        say: d.deal.demand,
        summary: "일방적으로 요구했다",
        reply: (s) => s.trust >= 2
          ? [R("other", d.deal.demandOk), R("narr", d.deal.demandOkNarr)]
          : [R("other", d.deal.demandNo), R("narr", d.deal.demandNoNarr)],
        // 앞서 내주기로 한 g분을 되찾되, 마감 확인으로 얻은 t분은 이미 반영돼 있으므로 g - t 만 더한다.
        eff: (s) => (s.trust >= 2 ? { trust: -1, booth: g - t } : { trust: -1, booth: -f }),
        ending: (s) => (s.trust >= 2 ? "lopsided" : "fail"),
      },
    ],
  };

  return [info, time, deal];
}

// ───────── 화면 출력 ─────────
function addMsg(kind, text) {
  const div = document.createElement("div");
  div.className = "msg " + kind;
  if (kind === "other" || kind === "me") {
    const who = document.createElement("span");
    who.className = "who";
    who.textContent = kind === "me" ? scenario.meName : scenario.otherName;
    div.appendChild(who);
  }
  const body = document.createElement("span");
  body.style.whiteSpace = "pre-line";
  body.textContent = text;
  div.appendChild(body);
  $("log").appendChild(div);
  return { div, body };
}

// 한 줄 출력. 상대 대사는 잠깐 "…" 을 보여 준 뒤 나온다(연출만, 플레이어 입력은 대신하지 않는다).
async function speak(kind, text) {
  const delay = calm() ? 0 : 450;
  let m;
  if (kind === "other") {
    m = addMsg("other", "…");
    follow(m.div);
    await sleep(delay);
    m.body.textContent = text;
  } else {
    await sleep(delay / 2);
    m = addMsg(kind, text);
  }
  follow(m.div);
}

function follow(el) {
  el.scrollIntoView({ block: "nearest", behavior: calm() ? "auto" : "smooth" });
}

function addEffects(eff) {
  const names = { trust: ["신뢰도", ""], booth: [scenario.res, "분"] };
  const wrap = document.createElement("div");
  wrap.className = "effects";
  Object.entries(eff).forEach(([k, v]) => {
    if (!v) return;
    const s = document.createElement("span");
    s.className = "fx " + (v > 0 ? "good" : "bad");
    s.textContent = `${names[k][0]} ${v > 0 ? "+" : ""}${v}${names[k][1]}`;
    wrap.appendChild(s);
  });
  if (wrap.children.length) $("log").appendChild(wrap);
}

function updateChips() {
  $("trust").textContent = state.trust;
  $("resLabel").textContent = scenario ? scenario.res + "(예상)" : "준비 시간";
  $("booth").textContent = scenario ? state.booth : "–";
  $("resUnit").textContent = scenario ? "분" : "";
}

function applyEffects(eff, set) {
  if (eff) {
    state.trust = Math.max(0, state.trust + (eff.trust || 0));
    state.booth = Math.max(0, state.booth + (eff.booth || 0));
  }
  if (set) Object.assign(state, set);
  updateChips();
}

function setStage(i) {
  stageIndex = i;
  $("stageName").textContent = i < 0 ? "시나리오 선택" : STAGE_NAMES[i];
  $("bar").style.width = (Math.max(i, 0) / STAGE_NAMES.length) * 100 + "%";
}

function clearChoices() {
  $("choices").replaceChildren();
}

// list: [{ label, sub, primary, onClick }]
function setChoices(list) {
  const box = $("choices");
  box.replaceChildren();
  list.forEach((c) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = c.label;
    if (c.sub) {
      const small = document.createElement("span");
      small.className = "sub";
      small.textContent = c.sub;
      b.appendChild(small);
    }
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
  const behavior = calm() ? "auto" : "smooth";
  const box = $("choices");
  const top = firstNew.getBoundingClientRect().top;
  const needed = box.getBoundingClientRect().bottom - top + 16;
  if (needed <= window.innerHeight) {
    box.scrollIntoView({ block: "end", behavior });
  } else {
    window.scrollTo({ top: window.scrollY + top - 12, behavior });
  }
}

// ───────── 진행 ─────────
async function enterNode(node) {
  // 응답 줄은 나타나는 동안 이미 따라가며 보여 줬으므로, 마지막 스크롤은 선택지를 이끄는 질문 줄에 맞춘다.
  if (node.open.length) markBatch();
  for (const [k, t] of node.open) await speak(k, t);
  setChoices(node.choices.map((c, i) => ({
    label: `${"AB"[i]}. ${c.tag ? c.tag + ": " : ""}"${val(c.say)}"`,
    onClick: () => pick(c),
  })));
}

async function enterStage(i) {
  setStage(i);
  await enterNode(scenario.stages[i - 1]);
}

// 플레이어가 고른 발언만 출력 → 상대 응답 → 효과 → 다음 선택지
async function pick(c) {
  if (busy) return;
  busy = true;
  // 선택 시점의 상태로 결과를 모두 정한 뒤 적용한다.
  const say = val(c.say), reply = val(c.reply) || [], eff = val(c.eff), ending = val(c.ending);
  clearChoices();
  markBatch();
  state.history.push(c.summary);
  follow(addMsg("me", say).div);
  for (const [k, t] of reply) await speak(k, t);
  applyEffects(eff, c.set);
  if (eff) addEffects(eff);

  if (ending) {
    setChoices([{ label: "결과 보기 ▶", primary: true, onClick: () => showEnding(ending) }]);
  } else if (c.next) {
    await sleep(calm() ? 0 : 250);
    await enterNode(c.next);
  } else {
    await sleep(calm() ? 0 : 250);
    await enterStage(stageIndex + 1);
  }
  busy = false;
}

function showEnding(key) {
  markBatch();
  setStage(4);
  $("resLabel").textContent = scenario.res; // 합의가 끝났으니 더 이상 예상값이 아니다
  const e = ENDINGS[key];

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
  score.textContent = `최종 신뢰도 ${state.trust} · 최종 ${scenario.res} ${state.booth}분`;
  const ul = document.createElement("ul");
  state.history.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    ul.appendChild(li);
  });
  const lesson = document.createElement("div");
  lesson.className = "lesson";
  lesson.textContent = "💡 교훈: " + scenario.lesson;

  card.append(emoji, h, p, score, ul, lesson);
  $("log").appendChild(card);
  setChoices([{ label: "🔄 다시 시작", primary: true, onClick: startGame }]);
}

function chooseScenario(d) {
  if (busy) return;
  scenario = { ...d, stages: buildStages(d) };
  state.booth = d.n.S;
  updateChips();
  $("log").replaceChildren();
  markBatch();
  setStage(0);
  d.intro.forEach((t) => addMsg("narr", t));
  setChoices([{
    label: "협상 시작하기", primary: true,
    onClick: async () => {
      if (busy) return;
      busy = true;
      clearChoices();
      markBatch();
      await enterStage(1);
      busy = false;
    },
  }]);
  window.scrollTo({ top: 0 });
}

function startGame() {
  resetState();
  updateChips();
  $("log").replaceChildren();
  setStage(-1);
  const div = document.createElement("div");
  div.className = "msg narr";
  div.textContent = "『협상의 기술』을 바탕으로 한 선택형 협상 게임이에요. 협상 상황을 하나 골라 시작하세요.";
  $("log").appendChild(div);
  setChoices(SCENARIOS.map((d) => ({
    label: `${d.emoji} ${d.title}`, sub: d.sub, onClick: () => chooseScenario(d),
  })));
  window.scrollTo({ top: 0 });
}

startGame();
