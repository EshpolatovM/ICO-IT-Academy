/**
 * Dev seed uchun ilm yo'li kontenti (topshiriq 3.1 §4.2): 2 bo'lim, 3 mavzu (2 + 1), har mavzuda
 * 2 dars, 1 sandiq (1-mavzudan keyin), 2 ko'nikma. Hammasi `PUBLISHED` bo'lib yoziladi.
 * Tartib (`order`) massivdagi o'rindan olinadi (1 dan boshlab). Bu sozlama emas, faqat dev kontent.
 */

/** Sandiq mukofoti (docs/11 §3 `path_chests.reward`, S-26 A): qat'iy qiymat = `min = max`. */
export type ChestRewardRange = { min: number; max: number };
export type ChestReward = { xp: ChestRewardRange; coin: ChestRewardRange };

export interface SeedLesson {
  title: string;
  contentMd: string;
  videoUrl?: string;
  estMinutes?: number;
}

export interface SeedChest {
  title: string;
  reward: ChestReward;
}

export interface SeedTopic {
  title: string;
  description?: string;
  icon?: string;
  /** `DEV_SKILLS` dagi nomlar. */
  skillNames: readonly string[];
  lessons: readonly SeedLesson[];
  /** Shu mavzudan keyingi sandiq (bo'lim ichida). */
  chestAfter?: SeedChest;
}

export interface SeedSection {
  title: string;
  description?: string;
  topics: readonly SeedTopic[];
}

export interface SeedSkill {
  name: string;
  icon?: string;
}

const SKILL_HTML = 'HTML';
const SKILL_CSS = 'CSS';

export const DEV_SKILLS: readonly SeedSkill[] = [
  { name: SKILL_HTML, icon: 'html' },
  { name: SKILL_CSS, icon: 'css' },
];

/**
 * Dev sandiq mukofoti: docs/12-api.md:335 dagi `POST /student/chests/c1/open` javobi misoli
 * (`xp 50`, `coin 30`), qat'iy qiymat (`min = max`). S-B5 da tasdiqlangan; sozlama emas.
 */
const DEV_CHEST_REWARD: ChestReward = {
  xp: { min: 50, max: 50 },
  coin: { min: 30, max: 30 },
};

const HTML_SKELETON_LESSON_MD = [
  '# HTML hujjat tuzilmasi',
  '',
  'Har bir HTML sahifa bir xil skeletdan boshlanadi:',
  '',
  '```html',
  '<!doctype html>',
  '<html lang="uz">',
  '  <head>',
  '    <meta charset="utf-8" />',
  '    <title>Mening sahifam</title>',
  '  </head>',
  '  <body>',
  '    <h1>Salom, dunyo!</h1>',
  '  </body>',
  '</html>',
  '```',
  '',
  "`<head>` ichida sahifa haqidagi ma'lumot, `<body>` ichida ko'rinadigan kontent bo'ladi.",
].join('\n');

export const DEV_PATH_SECTIONS: readonly SeedSection[] = [
  {
    title: 'Veb asoslari',
    description: 'Internet va veb-sahifalar qanday ishlashi bilan tanishuv.',
    topics: [
      {
        title: 'Veb qanday ishlaydi',
        description: 'Brauzer, server va HTTP.',
        icon: 'globe',
        skillNames: [SKILL_HTML],
        lessons: [
          {
            title: 'Brauzer va server',
            contentMd:
              "# Brauzer va server\n\nBrauzer serverga **so'rov** yuboradi, server esa **javob** qaytaradi.",
            estMinutes: 5,
          },
          {
            title: "HTTP so'rovlari",
            contentMd:
              "# HTTP so'rovlari\n\nEng ko'p ishlatiladigan metodlar: `GET` (o'qish) va `POST` (yuborish).",
            estMinutes: 7,
          },
        ],
        chestAfter: { title: 'Birinchi sandiq', reward: DEV_CHEST_REWARD },
      },
      {
        title: 'HTML asoslari',
        description: 'Teglar va hujjat tuzilmasi.',
        icon: 'code',
        skillNames: [SKILL_HTML],
        lessons: [
          {
            title: 'HTML hujjat tuzilmasi',
            contentMd: HTML_SKELETON_LESSON_MD,
            videoUrl: 'https://example.com/videos/html-hujjat-tuzilmasi',
            estMinutes: 10,
          },
          {
            title: 'Matn teglari',
            contentMd:
              '# Matn teglari\n\nSarlavhalar uchun `<h1>`…`<h6>`, paragraf uchun `<p>` ishlatiladi.',
            estMinutes: 8,
          },
        ],
      },
    ],
  },
  {
    title: 'CSS asoslari',
    description: "Sahifaga ko'rinish berish.",
    topics: [
      {
        title: 'CSS selektorlar',
        description: 'Element, klass va id selektorlari.',
        icon: 'palette',
        skillNames: [SKILL_CSS],
        lessons: [
          {
            title: 'CSS ulash',
            contentMd:
              '# CSS ulash\n\nUslublar alohida faylda yoziladi va `<link rel="stylesheet">` orqali ulanadi.',
            estMinutes: 6,
          },
          {
            title: 'Selektor turlari',
            contentMd:
              '# Selektor turlari\n\n`p` — element, `.card` — klass, `#main` — id selektori.',
            estMinutes: 8,
          },
        ],
      },
    ],
  },
];
