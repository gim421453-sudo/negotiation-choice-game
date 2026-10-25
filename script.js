"use strict";

// ───────── 시나리오 데이터 ─────────
// 세 시나리오는 같은 구조(도입 → 정보 질문 → 시간 압박 판단 → 합의 제안 → 결말)를 쓰고
// 대사·선택지·수치(n)만 다르다. n: S 시작 준비 시간, g 필요만큼 내주는 시간, h 묻지 않고 다 내주는 시간,
// t 마감 확인(+)/성급한 수락(-) 시간, w 윈윈 보너스, l 일방적 합의 손실, f 결렬 손실 (단위: 분)
const SCENARIOS = [
  {
    id: "room", short: "교실 사용", emoji: "🏫", title: "① 교실 사용 시간 협상", sub: "부스 운영팀 vs 공연 준비팀",
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
      demandOkNarr: "✅ 최종 합의: 앞서 나눈 30분 양보 이야기는 없던 일이 되고 부스팀이 교실을 계속 쓰기로 했다. 부스는 그 30분을 모두 되찾았지만 공연팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)",
      demandNo: "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!",
      demandNoNarr: "❌ 합의 없이 협상이 끝났다. 교실 배정이 선생님 결정으로 넘어가 부스 준비 시간 20분을 잃었다. (신뢰도 -1)",
    },
    lesson: "입장(\"1시간 비워주세요\") 뒤에 숨은 진짜 필요를 묻고, 마감이 정말 급한지 확인한 뒤, 서로 이익이 되는 대안을 내보자.",
  },
  {
    id: "audio", short: "방송 장비", emoji: "🎤", title: "② 방송 장비 사용 시간 협상", sub: "영상 상영팀 vs 사회·진행팀",
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
      demandOkNarr: "✅ 최종 합의: 앞서 나눈 15분 양보 이야기는 없던 일이 되고 영상팀이 장비를 계속 쓰기로 했다. 그 15분을 모두 되찾았지만 진행팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)",
      demandNo: "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!",
      demandNoNarr: "❌ 합의 없이 협상이 끝났다. 장비 배정이 선생님 결정으로 넘어가 영상 리허설 시간 10분을 잃었다. (신뢰도 -1)",
    },
    lesson: "\"40분 빌려 주세요\"라는 요구 뒤에는 \"음량 확인\"이라는 진짜 목적이 있었다. 목적을 묻고, 예약 마감을 확인한 뒤, 서로 돕는 대안을 내보자.",
  },
  {
    id: "crew", short: "준비 인력", emoji: "🙋", title: "③ 행사 준비 인력 협상", sub: "장식팀 vs 안내·접수팀",
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
      demandOkNarr: "✅ 최종 합의: 앞서 나눈 40분 도움 이야기는 없던 일이 되고 장식팀이 인원을 그대로 쓰기로 했다. 그 40분을 모두 되찾았지만 안내팀만 양보한 합의라 불만이 남았다. (신뢰도 -1)",
      demandNo: "그런 식이면 협상 안 해요. 선생님께 따로 말씀드릴게요!",
      demandNoNarr: "❌ 합의 없이 협상이 끝났다. 인력 배치가 선생님 결정으로 넘어가 장식 준비 시간 20분을 잃었다. (신뢰도 -1)",
    },
    lesson: "\"80분 빌려 주세요\" 뒤에는 \"책상 옮기기\"라는 진짜 일이 있었다. 어떤 일인지 묻고, 배치표 마감을 확인한 뒤, 서로 돕는 대안을 내보자.",
  },
];


// ───────── 추가 학교생활 시나리오 (기존 엔진과 점수 규칙 재사용) ─────────
const SCHOOL_SCENARIOS = [
  {
    id: "group", short: "모둠 발표", emoji: "📝", title: "④ 모둠 발표 역할 분담 협상",
    sub: "자료 정리팀 vs 발표팀", res: "자료 정리 시간", meName: "나 (자료팀)", otherName: "발표팀",
    n: { S: 90, g: 20, h: 50, t: 10, w: 10, l: 10, f: 20 },
    intro: [
      "모둠 수행평가 발표를 준비하는 중이다. 자료 정리팀(우리)은 참고 자료와 출처를 정리해야 하고, 발표팀은 슬라이드와 발표 연습을 맡고 있다.",
      "🎯 우리 목표: 자료와 출처를 정리할 90분 확보\n🎯 상대 목표: 발표 자료를 검토해 줄 도움 확보",
      "발표팀 대표가 자료 정리팀에 지원을 요청했다.",
    ],
    info: {
      open: "발표 준비가 벅차서요. 자료팀이 50분 동안 도와주면 안 될까요?",
      ask: { say: "어떤 작업에 50분이 필요한가요?", reply: "사실 마지막 슬라이드의 핵심 근거만 함께 확인하면 돼요. 그건 20분이면 충분해요." },
      share: {
        say: "그럼 근거를 확인하는 20분은 함께하고, 나머지 시간에는 저희가 자료를 마무리할까요?",
        reply: "그 방법 좋네요. 최종 역할 분담은 뒤에서 함께 결정해요.",
        narr: "도움이 필요한 구체적인 일을 알아냈다. 아직 최종 합의 전이므로 시간은 예상값이다.",
      },
      press: {
        say: "그건 발표팀 역할이니 저희는 전혀 도와줄 수 없어요.",
        reply: "발표 자료에 들어가는 근거는 같이 확인해야 하는데요. 좀 서운하네요.",
        narr: "상대의 실제 필요를 알고도 협조를 거절해 관계가 나빠졌다.",
      },
      accept: {
        say: "네, 50분 동안 저희가 도와드릴게요.",
        reply: "고마워요. 우선 50분 지원을 기준으로 생각하고 마지막에 확정해요.",
        narr: "실제 필요한 지원 시간은 20분이지만 확인하지 않아 50분을 양보하는 방향이 되었다. (예상값)",
      },
    },
    time: {
      open: "역할 분담표를 오늘 안에 내야 하니 지금 결정해야 해요!",
      check: {
        say: "정확한 제출 시한을 담당 선생님께 확인해 볼까요?",
        reply: "확인해 보니 내일 점심시간까지 제출하면 된대요.",
        narr: "서둘러 결정할 필요가 없어져 내일 아침 자료를 10분 더 정리할 여유가 생겼다.",
      },
      rush: {
        say: "알겠어요. 충분히 확인하지 않고 오늘 결정할게요.",
        reply: "그러면 바로 최종 조건을 정하죠.",
        narr: "성급한 일정 조정으로 자료 정리 시간 예상이 10분 줄었다.",
      },
    },
    deal: {
      altKnew: "슬라이드 근거 확인은 20분 함께하고, 발표팀은 발표 후 출처 정리를 도와줘요.",
      altPlain: "도움 시간을 짧게 나눠 쓰고, 발표팀도 출처 정리를 일부 도와주면 어떨까요?",
      win: "그럼 서로 부담이 줄겠네요. 그렇게 해요.",
      winPressed: "아까 거절하신 건 아쉬웠지만, 지금 제안은 공평하네요.",
      winNarrKnew: "✅ 최종 합의: 자료팀은 20분간 핵심 근거를 검토하고, 발표팀은 출처 정리를 도와주기로 했다. 역할 중복을 줄여 10분을 아꼈다.",
      winNarr: "✅ 최종 합의: 도움 시간을 나누고 출처 정리도 함께 맡기로 했다. 작업 중복을 줄여 10분을 아꼈다.",
      lopHasty: "처음에 50분을 도와주시겠다고 하셨잖아요. 그 계획대로 하고 싶어요.",
      lopHastyNarr: "✅ 최종 합의: 발표팀이 요청한 50분에 마무리 지원 10분까지 자료팀이 맡았다. 자료팀의 부담이 커졌다.",
      lopPressed: "아까 전혀 도와줄 수 없다고 하셔서 믿기 어려워요. 원래 요청한 50분은 도와주세요.",
      lopPressedNarr: "✅ 최종 합의: 역할 조정 제안은 받아들여지지 않았고 자료팀이 발표팀에 50분을 지원한다. (자료팀의 양보가 큼)",
      demand: "자료팀 업무만 하겠습니다. 발표팀은 스스로 해결하세요.",
      demandOk: "그동안 의견을 들어 주신 건 고마웠어요. 이번에는 저희가 알아서 해 볼게요.",
      demandOkNarr: "✅ 최종 합의: 앞서 제안한 20분 지원을 취소하고 자료팀은 해당 20분을 모두 되찾았다. 발표팀만 양보해 불만이 남았다. (신뢰도 -1)",
      demandNo: "그건 일방적이잖아요. 선생님께 역할 분담을 다시 요청할게요.",
      demandNoNarr: "❌ 합의 없이 끝나 역할 분담을 다시 조정해야 한다. 자료팀은 정리 시간 20분을 추가로 잃었다. (신뢰도 -1)",
    },
    lesson: "모둠 과제에서는 지원을 요청하는 말 뒤에 어떤 업무가 실제로 필요한지 확인해야 한다. 역할을 교환해 서로의 부담을 줄이는 방법도 있다.",
  },
  {
    id: "study", short: "자습 공간", emoji: "📚", title: "⑤ 시험기간 자습 공간 협상",
    sub: "조용한 자습팀 vs 발표 연습팀", res: "조용한 자습 시간", meName: "나 (자습팀)", otherName: "발표 연습팀",
    n: { S: 80, g: 15, h: 45, t: 5, w: 5, l: 5, f: 15 },
    intro: [
      "시험기간 방과 후, 자습팀(우리)은 조용한 교실에서 공부하고 있다. 수행평가 발표 연습팀도 같은 교실을 사용하려 한다.",
      "🎯 우리 목표: 조용히 공부할 시간 80분 확보\n🎯 상대 목표: 발표 리허설을 할 공간 확보",
      "발표 연습팀 대표가 교실 사용을 부탁하러 왔다.",
    ],
    info: {
      open: "이 교실에서 발표를 45분만 연습할 수 있을까요?",
      ask: { say: "45분 동안 어떤 연습을 해야 하나요?", reply: "대부분은 집에서 연습했어요. 마지막 동선과 목소리만 맞추면 돼서 15분이면 됩니다." },
      share: {
        say: "그럼 저희가 먼저 공부하고 마지막 15분에 교실을 넘겨주는 방향은 어떨까요?",
        reply: "네, 필요한 15분만 쓰면 되니 괜찮아요. 최종 일정은 나중에 정해요.",
        narr: "필요한 연습 시간이 15분이라는 사실을 확인했다. 시간은 잠정적으로 계산한다.",
      },
      press: {
        say: "시험기간이니 발표 연습은 여기서 하지 마세요.",
        reply: "잠깐의 동선 확인이 꼭 필요한데 완전히 못 쓰게 하시면 곤란해요.",
        narr: "조용한 공부가 중요하지만 상대의 상황을 고려하지 않은 대응으로 불만이 생겼다.",
      },
      accept: {
        say: "알겠어요. 교실을 45분 동안 사용하세요.",
        reply: "감사해요. 우선 45분을 기준으로 생각하고 최종 시간은 뒤에서 정해요.",
        narr: "상대가 실제 필요한 15분을 확인하지 않아 45분을 양보하는 방향이 되었다. (예상값)",
      },
    },
    time: {
      open: "교실 사용 신청이 오늘 끝난대요. 지금 정해야 해요!",
      check: {
        say: "선생님께 신청 마감을 먼저 확인해 볼게요.",
        reply: "알고 보니 내일 아침까지 신청하면 된대요.",
        narr: "내일 아침까지 조정할 수 있어 조용한 자습 시간을 5분 더 확보할 수 있었다.",
      },
      rush: {
        say: "그렇다면 오늘 바로 확정하겠습니다.",
        reply: "서둘러 조건을 정해 볼까요?",
        narr: "서둘러 정하느라 조용한 자습 시간 예상이 5분 더 줄었다.",
      },
    },
    deal: {
      altKnew: "우리가 먼저 자습하고 마지막 15분에는 교실을 비워 줄게요. 그동안은 다른 조용한 공간에서 마무리하겠습니다.",
      altPlain: "서로 방해되지 않도록 발표 연습과 조용한 자습 시간을 나눠 사용하는 건 어떨까요?",
      win: "좋아요! 서로 필요한 시간을 지킬 수 있겠어요.",
      winPressed: "아까는 조금 불편했지만 시간 분리라면 괜찮아요.",
      winNarrKnew: "✅ 최종 합의: 자습팀이 먼저 공부하고 발표팀이 마지막 15분만 교실을 쓴다. 동선을 미리 정리해 5분을 아꼈다.",
      winNarr: "✅ 최종 합의: 발표 연습과 조용한 자습 시간을 나눠 쓰기로 했다. 이동 계획을 함께 정해 5분을 아꼈다.",
      lopHasty: "처음에 45분을 주신다고 했으니 그 계획대로 할게요.",
      lopHastyNarr: "✅ 최종 합의: 자습팀이 45분을 내주고 5분까지 더 양보한다. 자습 시간이 불필요하게 줄어든다.",
      lopPressed: "조용히 공부하고 싶은 건 알지만, 아까는 전혀 안 된다고 하셨잖아요. 그럼 요청한 45분을 주세요.",
      lopPressedNarr: "✅ 최종 합의: 시간 분할 제안이 거절되어 자습팀은 45분을 내준다. (자습팀의 양보가 큼)",
      demand: "이 교실은 저희가 계속 쓸게요. 발표 연습은 다른 곳에서 하세요.",
      demandOk: "의견은 들어 주셨으니 이번에는 다른 장소를 찾아볼게요.",
      demandOkNarr: "✅ 최종 합의: 이전에 제안한 15분 사용을 취소하고 자습팀이 15분을 모두 되찾았다. 발표팀의 불만은 남는다. (신뢰도 -1)",
      demandNo: "일방적으로 정하시면 곤란해요. 선생님께 교실 배정을 요청할게요.",
      demandNoNarr: "❌ 합의하지 못해 교실 사용을 다시 조정해야 한다. 자습팀은 15분을 잃는다. (신뢰도 -1)",
    },
    lesson: "시험기간에도 조용한 학습과 발표 준비라는 서로 다른 필요가 존재한다. 필요한 시간부터 확인하고 서로 방해하지 않는 순서를 정해 보자.",
  },
  {
    id: "gym", short: "체육관 코트", emoji: "🏀", title: "⑥ 체육관 사용 시간 협상",
    sub: "농구 연습팀 vs 배드민턴팀", res: "농구 연습 시간", meName: "나 (농구팀)", otherName: "배드민턴팀",
    n: { S: 100, g: 20, h: 50, t: 10, w: 10, l: 10, f: 20 },
    intro: [
      "방과 후 체육관의 한 코트를 농구 연습팀(우리)과 배드민턴팀이 사용하려 한다. 안전상 서로 다른 종목을 동시에 진행하기는 어렵다.",
      "🎯 우리 목표: 농구 연습 시간 100분 확보\n🎯 상대 목표: 배드민턴 대회 전 코트 적응 연습",
      "배드민턴팀 대표가 코트 사용 시간을 요청한다.",
    ],
    info: {
      open: "대회 준비 때문에 이 코트를 50분 동안 쓸 수 있을까요?",
      ask: { say: "코트에서 50분 동안 어떤 연습이 필요한가요?", reply: "다른 훈련은 이미 했고, 코트 감각 확인과 서브 연습만 20분 하면 됩니다." },
      share: {
        say: "그렇다면 20분은 배드민턴팀이 먼저 쓰고, 그다음 저희가 농구 연습을 하는 방향은 어때요?",
        reply: "안전하게 시간을 나눠 쓰면 괜찮겠어요. 마지막에 확정해요.",
        narr: "상대에게 꼭 필요한 시간이 20분이라는 사실을 확인했다. 실제 배정 전에는 예상값이다.",
      },
      press: {
        say: "농구 연습이 급해서 코트를 아예 비워 드리기 어려워요.",
        reply: "짧게라도 코트를 써 봐야 대회를 준비할 수 있어요.",
        narr: "상대의 상황을 들었지만 자신의 일정만 강조해 관계가 불편해졌다.",
      },
      accept: {
        say: "알겠습니다. 50분 동안 사용하세요.",
        reply: "고마워요. 우선 50분을 기준으로 하고 마지막에 확정해요.",
        narr: "상대에게는 20분만 필요한데 확인하지 않고 50분을 양보하는 방향이 되었다. (예상값)",
      },
    },
    time: {
      open: "체육관 예약 신청은 오늘이 끝이라고 들었어요. 당장 정해야 해요!",
      check: {
        say: "체육 선생님께 정확한 예약 마감을 확인해 볼까요?",
        reply: "확인해 보니 내일 아침까지 신청서를 내면 된대요.",
        narr: "예약을 검토할 여유가 생겨 농구 연습 시간을 10분 더 확보할 수 있었다.",
      },
      rush: {
        say: "알겠습니다. 지금 서둘러 시간을 정해요.",
        reply: "그럼 조건을 바로 정해 볼게요.",
        narr: "서둘러 배정하느라 농구 연습 시간이 예상보다 10분 줄어들었다.",
      },
    },
    deal: {
      altKnew: "먼저 20분은 배드민턴팀이 코트를 쓰고, 이후엔 농구팀이 사용할게요. 장비 정리도 함께 도와요.",
      altPlain: "안전을 위해 두 종목의 코트 사용 시간을 분리하고 정리는 함께 하는 건 어떨까요?",
      win: "좋아요. 서로 연습할 수 있겠네요!",
      winPressed: "아까는 거절하셔서 걱정했지만, 시간 분리라면 받아들일게요.",
      winNarrKnew: "✅ 최종 합의: 배드민턴팀이 먼저 20분, 이후 농구팀이 코트를 사용한다. 장비 정리를 함께해 10분을 아꼈다.",
      winNarr: "✅ 최종 합의: 두 팀이 코트를 시간제로 나눠 쓴다. 장비 정리를 함께해 10분을 아꼈다.",
      lopHasty: "처음에 50분을 주시겠다고 하셨으니 그 시간대로 쓰겠습니다.",
      lopHastyNarr: "✅ 최종 합의: 배드민턴팀 요구대로 50분과 마무리 10분을 내준다. 농구팀의 연습 시간이 더 줄었다.",
      lopPressed: "아까는 코트를 못 빌려주겠다고 하셔서요. 일단 50분은 필요해요.",
      lopPressedNarr: "✅ 최종 합의: 조정 제안이 거절되어 농구팀이 요청받은 50분을 내준다. (농구팀의 양보가 큼)",
      demand: "이 코트는 농구팀이 계속 쓸게요. 배드민턴은 다른 곳에서 연습하세요.",
      demandOk: "먼저 얘기를 들어 주셨으니 이번엔 다른 코트를 알아볼게요.",
      demandOkNarr: "✅ 최종 합의: 앞서 배드민턴팀에 주기로 한 20분을 취소하고 농구팀이 모두 되찾는다. 상대 팀의 불만이 남는다. (신뢰도 -1)",
      demandNo: "그렇게 일방적으로 결정하시면 체육 선생님께 말씀드릴게요.",
      demandNoNarr: "❌ 합의하지 못해 체육관 사용 순서를 다시 배정해야 한다. 농구팀은 준비 시간 20분을 잃었다. (신뢰도 -1)",
    },
    lesson: "같은 공간을 동시에 쓰기 어렵다면, 필요한 시간을 물어보고 안전하게 순서를 나누는 방안이 상호 이익이 될 수 있다.",
  },
];
SCENARIOS.push(...SCHOOL_SCENARIOS);

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
// 처음 화면으로 돌아가면 epoch 가 바뀌어, 진행 중이던 응답 연출이 새 화면에 끼어들지 않고 멈춘다.
let epoch = 0;
const CANCELLED = Symbol("cancelled");
async function wait(ms) {
  const e = epoch;
  await sleep(ms);
  if (e !== epoch) throw CANCELLED;
}

// 결말 수집 기록: 이 기기의 localStorage 에만 저장한다. 막힌 브라우저에서는 이번 접속 동안만 메모리에 유지한다.
const STORE_KEY = "negotiation-choice.v1";
const ENDING_KEYS = ["win", "lopsided", "fail"];
const store = {
  mem: { endings: {}, howtoSeen: false },
  persistent: true,
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE_KEY));
      if (d && typeof d === "object") this.mem = { endings: d.endings && typeof d.endings === "object" ? d.endings : {}, howtoSeen: !!d.howtoSeen };
    } catch (err) { /* 저장소를 못 읽으면 메모리 값을 쓴다 */ }
    return this.mem;
  },
  save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(this.mem)); this.persistent = true; }
    catch (err) { this.persistent = false; }
  },
  got(id, key) { return Array.isArray(this.mem.endings[id]) && this.mem.endings[id].includes(key); },
  add(id, key) {
    const list = Array.isArray(this.mem.endings[id]) ? this.mem.endings[id] : [];
    if (!list.includes(key)) list.push(key);
    this.mem.endings[id] = list;
    this.save();
  },
  clearEndings() { this.mem.endings = {}; this.save(); },
  count() { return SCENARIOS.reduce((n, d) => n + ENDING_KEYS.filter((k) => this.got(d.id, k)).length, 0); },
};
store.load();
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
        // 요구가 통하면(신뢰도 2 이상 = 나눠 쓰기를 제안한 경로) 앞서 내주기로 한 g분을 전부 되찾는다.
        // 마감 단계의 ±t분은 마감 확인 여부의 결과라 이 합의와 무관하게 그대로 둔다. (최종 = S ± t)
        eff: (s) => (s.trust >= 2 ? { trust: -1, booth: +g } : { trust: -1, booth: -f }),
        ending: (s) => (s.trust >= 2 ? "lopsided" : "fail"),
      },
    ],
  };

  return [info, time, deal];
}


// ───────── 학습용 양측 만족도와 결말 해설 ─────────
// 현실의 학생들을 조사한 만족도가 아니라 게임 선택을 비교하기 위한 예시 수치다.
// 일방적 합의는 누구에게 유리한지에 따라 양쪽 점수가 반대로 배정된다.
const OUTCOME_CONTEXT = {
  room: {
    win: "공연팀은 필요한 연습 시간을 얻고 부스팀도 교실 준비를 이어 갈 수 있다.",
    ours: "부스팀은 교실 시간을 더 확보했지만 공연팀은 연습 장소를 다시 찾아야 한다.",
    theirs: "공연팀은 요구한 만큼 교실을 사용하지만 부스팀의 준비 시간이 크게 줄어든다.",
    fail: "교실 배정이 해결되지 않아 두 팀 모두 행사 준비에 차질을 겪는다.",
  },
  audio: {
    win: "진행팀은 마이크를 점검하고 영상팀은 리허설 시간을 확보한다.",
    ours: "영상팀은 장비를 오래 쓰지만 진행팀은 음량 점검 기회를 잃는다.",
    theirs: "진행팀은 장비 사용 시간을 얻지만 영상팀의 리허설 시간이 줄어든다.",
    fail: "장비 배정이 정해지지 않아 두 팀의 연습 일정이 불확실해진다.",
  },
  crew: {
    win: "안내팀은 무거운 물건을 옮길 도움을 받고 장식팀도 준비를 이어 간다.",
    ours: "장식팀은 인력을 유지하지만 안내팀은 설치 작업을 해결해야 한다.",
    theirs: "안내팀은 도움을 확보하지만 장식팀의 준비 시간이 부족해진다.",
    fail: "인력 조정이 지연되어 안내팀과 장식팀 모두 일을 다시 계획해야 한다.",
  },
  group: {
    win: "자료팀은 근거를 검토해 주고 발표팀은 출처 정리를 도우며 역할 부담을 나눈다.",
    ours: "자료팀은 정리 시간을 확보했지만 발표팀은 슬라이드 검토를 혼자 마쳐야 한다.",
    theirs: "발표팀은 요청한 지원을 받지만 자료팀은 출처 정리에 쓸 시간이 부족해진다.",
    fail: "역할 배분이 정해지지 않아 모둠 발표 준비 전체가 늦어진다.",
  },
  study: {
    win: "자습팀은 조용히 공부하고 발표팀도 꼭 필요한 짧은 연습을 할 수 있다.",
    ours: "자습팀은 교실을 계속 쓰지만 발표팀은 연습 장소를 다시 찾아야 한다.",
    theirs: "발표팀은 교실을 오래 쓰지만 자습팀은 공부 시간을 잃는다.",
    fail: "교실 이용 순서가 결정되지 않아 두 팀 모두 일정을 재조정해야 한다.",
  },
  gym: {
    win: "두 팀은 안전하게 코트 사용 시간을 나누고 연습 기회를 확보한다.",
    ours: "농구팀은 코트를 오래 쓰지만 배드민턴팀은 필요한 코트 적응을 하지 못한다.",
    theirs: "배드민턴팀은 코트를 사용하지만 농구팀의 연습 시간이 크게 줄어든다.",
    fail: "코트 배정이 정해지지 않아 두 팀 모두 연습 계획을 바꿔야 한다.",
  },
};

function outcomeFeedback(key) {
  const favorOurs = key === "lopsided" && state.history.at(-1) === "일방적으로 요구했다";
  const goodWin = key === "win" && state.knewNeed && !state.pressed;
  const satisfaction = key === "win" ? [goodWin ? 5 : 4, goodWin ? 5 : 4]
    : key === "lopsided" ? (favorOurs ? [5, 1] : [2, 5]) : [1, 1];
  const context = OUTCOME_CONTEXT[scenario.id];
  const detailKey = key === "win" ? "win" : key === "fail" ? "fail" : favorOurs ? "ours" : "theirs";
  const lead = context[detailKey];
  let lines;
  if (key === "win") {
    lines = [
      lead,
      state.knewNeed ? "상대가 실제로 무엇을 필요로 하는지 질문해 요구의 이유를 확인했다." : "상대의 요구를 모두 파악하지는 못했지만 협력적인 대안을 제시했다.",
      "두 팀이 시간이나 역할을 조정해 서로 얻을 수 있는 이익을 만들었다.",
      "다음에도 상대의 필요와 마감을 확인하면 더 안정적인 합의에 도움이 된다.",
    ];
  } else if (key === "lopsided") {
    lines = [
      lead,
      favorOurs ? "우리 팀의 준비 시간은 많아졌지만 상대 팀이 원하는 조건은 충족되지 않았다." : "상대 팀의 요구가 받아들여졌지만 우리 팀의 준비 부담은 커졌다.",
      "합의가 이루어졌더라도 양측의 만족도는 크게 다를 수 있다.",
      "다시 협상한다면 상대의 이유를 확인하고 부담을 함께 나누는 대안을 제안할 수 있다.",
    ];
  } else {
    lines = [
      lead,
      "일방적인 요구 때문에 양쪽이 받아들일 수 있는 조건을 정하지 못했다.",
      "협상 결렬은 필요한 시간과 신뢰를 모두 잃게 할 수 있다.",
      "대화를 다시 시작한다면 각 팀이 반드시 필요한 조건부터 확인하는 편이 좋다.",
    ];
  }
  return { satisfaction, lines, favored: favorOurs };
}

// 두 팀 만족도는 실측값이 아니라 선택 결과를 설명하는 학습용 척도(1~5점)다.
function makeSatisfactionPanel(feedback) {
  const section = document.createElement("section");
  section.className = "satisfaction";
  const head = document.createElement("h3");
  head.textContent = "양쪽 팀 만족도 비교";
  section.appendChild(head);
  const sides = [
    ["우리 팀", feedback.satisfaction[0]],
    ["상대 팀", feedback.satisfaction[1]],
  ];
  for (const [name, points] of sides) {
    const line = document.createElement("div");
    line.className = "satisfaction-line";
    const label = document.createElement("span");
    label.textContent = name;
    const track = document.createElement("div");
    track.className = "satisfaction-track";
    track.setAttribute("role", "meter");
    track.setAttribute("aria-label", name + " 학습용 만족도");
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", "5");
    track.setAttribute("aria-valuenow", String(points));
    const fill = document.createElement("div");
    fill.className = "satisfaction-fill";
    fill.style.width = (points * 20) + "%";
    track.appendChild(fill);
    const value = document.createElement("strong");
    value.textContent = points + "/5";
    line.append(label, track, value);
    section.appendChild(line);
  }
  const note = document.createElement("p");
  note.className = "satisfaction-note";
  note.textContent = "※ 실제 만족도 조사 결과가 아닌, 협상 선택을 비교하기 위한 학습용 가상 점수입니다.";
  section.appendChild(note);
  return section;
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
    await wait(delay);
    m.body.textContent = text;
  } else {
    await wait(delay / 2);
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
  $("homeBtn").hidden = i < 0;
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
  const sticky = $("stageName").parentElement.offsetHeight; // 상단에 고정된 단계 줄
  const top = firstNew.getBoundingClientRect().top;
  const needed = box.getBoundingClientRect().bottom - top + 16;
  if (needed <= window.innerHeight - sticky) {
    box.scrollIntoView({ block: "end", behavior });
  } else {
    window.scrollTo({ top: window.scrollY + top - (sticky + 8), behavior });
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
  try {
    for (const [k, t] of reply) await speak(k, t);
    applyEffects(eff, c.set);
    if (eff) addEffects(eff);

    if (ending) {
      setChoices([{ label: "결과 보기 ▶", primary: true, onClick: () => showEnding(ending) }]);
    } else if (c.next) {
      await wait(calm() ? 0 : 250);
      await enterNode(c.next);
    } else {
      await wait(calm() ? 0 : 250);
      await enterStage(stageIndex + 1);
    }
  } catch (err) {
    if (err !== CANCELLED) { busy = false; throw err; }
    return; // 처음 화면으로 돌아간 경우: 새 화면의 상태는 건드리지 않는다
  }
  busy = false;
}

function showEnding(key) {
  markBatch();
  setStage(4);
  $("resLabel").textContent = scenario.res; // 합의가 끝났으니 더 이상 예상값이 아니다
  const e = ENDINGS[key];
  store.add(scenario.id, key);

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

  const feedback = outcomeFeedback(key);
  const satisfaction = makeSatisfactionPanel(feedback);
  const explanation = document.createElement("section");
  explanation.className = "outcome-explanation";
  const explanationTitle = document.createElement("h3");
  explanationTitle.textContent = "이 결말이 나온 이유";
  const explanationBody = document.createElement("p");
  explanationBody.textContent = feedback.lines.join(" ");
  explanation.append(explanationTitle, explanationBody);
  card.append(emoji, h, p, score, satisfaction, explanation, ul, lesson);
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
      try {
        await enterStage(1);
      } catch (err) {
        if (err !== CANCELLED) { busy = false; throw err; }
        return;
      }
      busy = false;
    },
  }]);
  window.scrollTo({ top: 0 });
}

// ───────── 시나리오 선택 화면: 게임 방법 / 결말 수집 현황 ─────────
function buildHowTo() {
  const box = document.createElement("details");
  box.className = "howto";
  box.open = !store.mem.howtoSeen; // 처음 접속했을 때만 펼쳐 둔다
  const sum = document.createElement("summary");
  sum.textContent = "📖 게임 방법";
  const ul = document.createElement("ul");
  [
    "🎯 『협상의 기술』을 바탕으로 한 선택형 게임이에요. 시나리오를 고르고, 내가 할 말을 직접 눌러 협상해요. (정보 → 시간 → 합의)",
    "🤝 신뢰도: 질문하고 협조하면 오르고, 일방적으로 밀어붙이면 내려가요.",
    "⏱ 준비 시간: 우리 팀이 쓸 수 있을 것 같은 예상 시간이에요. 합의가 끝나야 최종값이 돼요.",
    "🏁 선택에 따라 윈윈 합의 / 일방적 합의 / 협상 결렬로 결말이 달라져요. 시간이 많아도 신뢰를 잃으면 좋은 결말이 아니에요.",
    "😊 결말에서 두 팀의 만족도(1~5점)와 각자가 얻고 잃은 점을 비교해요. 만족도는 실제 조사 결과가 아닌 학습용 가상 점수예요.",
  ].forEach((t) => {
    const li = document.createElement("li");
    li.textContent = t;
    ul.appendChild(li);
  });
  box.append(sum, ul);
  if (!store.mem.howtoSeen) { store.mem.howtoSeen = true; store.save(); }
  return box;
}

function renderCollection(card) {
  card.replaceChildren(); // details 요소는 그대로라 펼침 상태가 유지된다
  const sum = document.createElement("summary");
  sum.textContent = `🏅 결말 수집 ${store.count()}/${SCENARIOS.length * ENDING_KEYS.length}`;
  card.appendChild(sum);

  SCENARIOS.forEach((d) => {
    const row = document.createElement("div");
    row.className = "collect-row";
    const name = document.createElement("span");
    name.className = "collect-name";
    name.textContent = `${d.emoji} ${d.short}`;
    row.appendChild(name);
    ENDING_KEYS.forEach((k) => {
      const got = store.got(d.id, k);
      const b = document.createElement("span");
      b.className = "badge" + (got ? " got " + k : "");
      b.textContent = (got ? ENDINGS[k].emoji + " " : "· ") + ENDINGS[k].title.replace(" 합의", "").replace("협상 ", "");
      b.setAttribute("aria-label", `${d.short} ${ENDINGS[k].title} ${got ? "달성" : "미달성"}`);
      row.appendChild(b);
    });
    card.appendChild(row);
  });

  if (!store.persistent) {
    const note = document.createElement("p");
    note.className = "collect-note";
    note.textContent = "이 브라우저에서는 저장이 막혀 있어 이번 접속 동안만 기록돼요.";
    card.appendChild(note);
  }

  const reset = document.createElement("button");
  reset.type = "button";
  reset.className = "ghost";
  reset.textContent = "기록 초기화";
  reset.addEventListener("click", () => {
    if (!window.confirm("결말 수집 기록을 모두 지울까요?\n지우면 되돌릴 수 없어요.")) return;
    store.clearEndings();
    renderCollection(card);
  });
  card.appendChild(reset);
}

// 처음 화면(시나리오 선택)으로. 진행 중이던 응답 연출은 epoch 로 취소한다.
function startGame() {
  epoch++;
  resetState();
  updateChips();
  $("log").replaceChildren();
  setStage(-1);
  const card = document.createElement("details");
  card.className = "collect";
  renderCollection(card);
  $("log").append(buildHowTo(), card);
  setChoices(SCENARIOS.map((d) => ({
    label: `${d.emoji} ${d.title}`, sub: d.sub, onClick: () => chooseScenario(d),
  })));
  window.scrollTo({ top: 0 });
}

// 진행 중에 처음 화면으로. 고른 선택이 있는 진행 중일 때만 확인창을 띄운다.
function goHome() {
  const inProgress = scenario && stageIndex >= 0 && stageIndex < 4 && state.history.length > 0;
  if (inProgress && !window.confirm("진행 중인 협상이 초기화돼요.\n처음 화면으로 돌아갈까요?")) return;
  startGame();
}
$("homeBtn").addEventListener("click", goHome);

startGame();
