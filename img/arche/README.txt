캐릭터 유형 피규어 이미지 (선택)
============================================================
견종처럼 피규어 사진으로 바꾸고 싶을 때만 사용합니다.
비워두면 js/arche.js 의 SVG 캐릭터가 그대로 표시됩니다.

[1] 이미지를 만든 뒤 이 폴더에 아래 이름으로 저장
    jeonggwan.webp   정관격 — 원칙을 지키는 실무 주인공
    pyeongwan.webp   편관격 — 위기에 투입되는 해결사
    jeongjae.webp    정재격 — 곳간을 쥔 살림꾼
    pyeonjae.webp    편재격 — 판을 짜는 기획자
    jeongin.webp     정인격 — 길을 아는 조력자
    pyeonin.webp     편인격 — 은둔한 전문가
    siksin.webp      식신격 — 모두의 끼니를 챙기는 사람
    sanggwan.webp    상관격 — 판을 뒤집는 문제아 천재
    bigyeon.webp     건록격 — 혼자서도 가는 독립군
    geopjae.webp     양인격 — 타고난 승부사

    권장 규격: 정사각 300x300, WebP, 품질 82~85 (개당 10KB 내외)

[2] js/arche.js 상단에 아래를 추가
    const ARCHE_PHOTO = {
      정관:"jeonggwan", 편관:"pyeongwan", 정재:"jeongjae", 편재:"pyeonjae",
      정인:"jeongin",   편인:"pyeonin",   식신:"siksin",   상관:"sanggwan",
      비견:"bigyeon",   겁재:"geopjae"
    };

    일부만 넣어도 됩니다. 목록에 없는 격국은 SVG로 자동 대체됩니다.
    이미지 로드에 실패해도 SVG로 대체되므로 그림이 비는 일은 없습니다.

------------------------------------------------------------
이미지 생성 프롬프트 (견종 피규어와 같은 톤)
------------------------------------------------------------
공통 앞부분 — 아래 문장 뒤에 각 인물 설명을 붙이세요.

  A stylized collectible vinyl figurine of a fictional archetype
  character, displayed in a glass museum case with a wooden base,
  soft warm gallery lighting, blurred gallery background,
  front-facing bust, matte finish, muted color palette,
  friendly stylized proportions, no text, no logo,
  not resembling any real person or existing media character

각 인물 설명

  정관격  a composed office worker in a dark suit and tie,
          thin-rimmed glasses, holding a document folder
  편관격  a calm rescue worker in a helmet and work jacket,
          a small radio clipped to the chest
  정재격  a steady shopkeeper in an apron,
          holding a ledger book and an abacus
  편재격  a bright planner holding a small whiteboard
          with a rising arrow chart
  정인격  a gentle silver-haired mentor in a cardigan,
          holding an open book
  편인격  a quiet analyst in a dark hoodie,
          holding a magnifying glass
  식신격  a warm cook in a white apron and bandana,
          holding a steaming pot
  상관격  a sharp young journalist with one hand raised,
          holding a microphone
  건록격  a lone traveler with a large backpack,
          holding a folded map
  양인격  an athlete in a headband and track jacket,
          holding a stopwatch

주의 — 실존 인물이나 특정 작품 캐릭터를 지칭하는 표현은 넣지 마세요.
저작권·초상권 문제가 생길 수 있고, 이 앱은 장르 아키타입만 다룹니다.
