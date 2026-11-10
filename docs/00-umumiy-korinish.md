# 00. Umumiy ko'rinish

> **Qisqa mazmun:** Loyiha maqsadi, foydalanuvchilar, asosiy modullar va ular o'rtasidagi bog'liqlik. Bu fayl boshqa barcha hujjatlar uchun asos.

---

## 1. Loyiha maqsadi

IT yo'nalishidagi to'liq onlayn ta'lim platformasi (LMS). Asosiy g'oyalar:

| G'oya | Izoh |
|---|---|
| **To'liq onlayn** | Barcha o'quv jarayoni platforma ichida. |
| **Matnli darslar** | Dars — matn (Markdown), ixtiyoriy video havola bilan. |
| **"Kurs" emas, "ilm yo'li"** | Uzun zanjir ko'rinishidagi yo'l: mavzular ketma-ket, orada mukofot sandiqlari. |
| **Gamifikatsiya** | XP, coin, streak, haftalik liga, 1v1 bellashuv, yutuqlar, shop. |
| **Spaced repetition** | Tizim har bir mavzu uchun keyingi takrorlash vaqtini hisoblaydi. |
| **Mentorlik** | Guruh mentori: chat, jonli meeting, davomat, materiallar, portfolio baholash. |
| **Ota-ona nazorati** | Akkauntsiz, token orqali faqat o'qish rejimida kirish. |
| **AI mentor** | Kelajakda (hozirgi scope'dan tashqarida). |
| **O'z dizayni** | Tayyor shablon emas, maxsus UI. |

## 2. Foydalanuvchilar

| Rol | Kirish usuli | Asosiy vazifasi |
|---|---|---|
| Super admin | Telefon + parol | Platforma egasi, adminlar va tizim sozlamalari |
| Admin | Telefon + parol | Foydalanuvchilar, guruhlar, kontent, shop, blog moderatsiyasi, hisobotlar |
| Mentor | Telefon + parol | O'z guruhlari: kuzatuv, chat, meeting, davomat, materiallar, portfolio baholash, ota-ona tokeni |
| Student | Student ID (`ST-10245`) + parol | O'qish va barcha student sahifalari |
| Ota-ona | Token (akkauntsiz) | Farzand ma'lumotlarini faqat ko'rish |

Email platformada umuman ishlatilmaydi.

## 3. Asosiy modullar

| # | Modul | Qisqacha | Hujjat |
|---|---|---|---|
| M1 | **Auth & RBAC** | 3 xil kirish, JWT, rollar, guard'lar | 01, 02 |
| M2 | **Foydalanuvchilar va guruhlar** | Admin/mentor/student CRUD, guruh, mentor biriktirish | 01, 03 |
| M3 | **Ilm yo'li va darslar** | Yo'l → bo'lim → mavzu → dars, xarita, sandiqlar, progress | 05 |
| M4 | **Savollar bazasi** | Yagona savollar banki (dars, takrorlash, quiz, bellashuv) | 05 |
| M5 | **Gamifikatsiya yadrosi** | XP/coin ledger, streak, yutuqlar, sozlamalar | 04 |
| M6 | **Bildirishnomalar** | In-app, real-time | 03, 04 |
| M7 | **Takrorlash va kunlik missiya** | Spaced repetition, missiyalar, haftalik quiz | 04, 05 |
| M8 | **Portfolio** | Statistika, grafiklar, ko'nikmalar, loyihalar, sertifikatlar, ulashish | 09 |
| M9 | **Kod maydoni** | HTML/CSS/JS/Python editor + natija/terminal | 07 |
| M10 | **Bellashuv** | 1v1 real-time, do'st yoki bot | 06 |
| M11 | **Mentor sahifasi** | Chat, meeting, davomat, materiallar | 08 |
| M12 | **Blog** | X'ga o'xshash postlar, like, komment, moderatsiya | 09 |
| M13 | **Reyting va ligalar** | Haftalik XP ligasi, ko'tarilish/tushish | 04 |
| M14 | **Shop** | Coinga mahsulot, buyurtmalar | 09 |
| M15 | **Ota-ona paneli** | Token bilan read-only ko'rinish | 10 |
| M16 | **Admin: hisobotlar va sozlamalar** | Tizim sozlamalari, hisobotlar, audit | 03, 04 |
| M17 | **AI mentor** | Keyinroq | 14 |

## 4. Modullar o'rtasidagi bog'liqlik

```mermaid
flowchart TD
    M1[M1 Auth & RBAC]
    M2[M2 Foydalanuvchilar va guruhlar]
    M3[M3 Ilm yo'li va darslar]
    M4[M4 Savollar bazasi]
    M5[M5 XP / coin / streak]
    M6[M6 Bildirishnomalar]
    M7[M7 Takrorlash va missiya]
    M8[M8 Portfolio]
    M9[M9 Kod maydoni]
    M10[M10 Bellashuv]
    M11[M11 Mentor: chat, meeting]
    M12[M12 Blog]
    M13[M13 Reyting va liga]
    M14[M14 Shop]
    M15[M15 Ota-ona paneli]
    M16[M16 Sozlamalar va hisobotlar]

    M1 --> M2
    M2 --> M3
    M3 --> M4
    M16 --> M5
    M4 --> M5
    M5 --> M6
    M3 --> M7
    M4 --> M7
    M5 --> M7
    M3 --> M8
    M5 --> M8
    M7 --> M8
    M1 --> M9
    M4 --> M10
    M5 --> M10
    M7 --> M10
    M2 --> M11
    M6 --> M11
    M1 --> M12
    M5 --> M13
    M5 --> M14
    M8 --> M15
    M11 --> M15
    M10 --> M15
    M13 --> M15
```

**Asosiy xulosalar:**
- **M5 (XP/coin ledger)** — markaziy modul: dars, takrorlash, quiz, bellashuv, davomat, portfolio, sandiqlar, shop hammasi u orqali ishlaydi. Unga sozlamalar (M16) kerak, chunki raqamlar kodga yozilmaydi.
- **M4 (savollar bazasi)** — bitta bank, uni 4 ta iste'molchi ishlatadi: dars, takrorlash, quiz, bellashuv.
- **M15 (ota-ona paneli)** — eng oxirgi modul, chunki u boshqa modullar ma'lumotlarining read-only "yig'indisi".

## 5. Yuqori darajadagi ma'lumot oqimi

```mermaid
flowchart LR
    Admin -- kontent, savollar --> Content[(Ilm yo'li + Savollar)]
    Admin -- XP/coin qiymatlari --> Settings[(Sozlamalar)]
    Student -- dars, javob --> Engine[O'quv dvigateli]
    Content --> Engine
    Engine -- hodisa --> Ledger[(XP/Coin ledger)]
    Settings --> Ledger
    Ledger --> League[Liga / Reyting]
    Ledger --> Shop
    Engine --> SR[Takrorlash jadvali]
    SR --> Mission[Kunlik missiya]
    Engine --> Portfolio
    Mentor -- kuzatadi --> Engine
    Parent[Ota-ona token] -. read-only .-> Portfolio
    Parent -. read-only .-> Ledger
```

## 6. Scope

**Hozirgi scope ichida:** M1–M16.
**Scope'dan tashqarida:** AI mentor (M17), email, to'lov/obuna (tavsifda yo'q), mobil ilova (tavsifda yo'q; web responsive bo'ladi).

## 7. Asosiy taxminlar

- **Taxmin:** Platformada bir nechta ilm yo'li bo'lishi mumkin (masalan Frontend, Backend). Student guruhi orqali bitta yo'lga biriktiriladi. → S-01
- **Taxmin:** Student bir vaqtda faqat bitta faol guruhda bo'ladi. → S-02
- **Taxmin:** Guruhda bitta mentor bo'ladi, mentorda esa bir nechta guruh bo'lishi mumkin. → S-03
- **Taxmin:** Interfeys tili o'zbek (lotin), lekin i18n'ga tayyor qilib quriladi. → S-04
- **Taxmin:** Platformada to'lov/obuna yo'q, studentni admin yaratadi. → S-06

---

## Ochiq savollar (shu modul)

- **S-01** Bitta umumiy ilm yo'li bormi yoki bir nechta yo'nalish bo'yicha yo'llarmi?
- **S-02** Student bir vaqtda bir nechta guruhda bo'la oladimi?
- **S-03** Guruhga bir nechta mentor (masalan, asosiy + yordamchi) biriktirilishi mumkinmi?
- **S-04** Interfeys tillari: faqat o'zbekmi, rus/ingliz ham kerakmi?
- **S-05** Kutilayotgan masshtab: nechta student, bir vaqtda nechta onlayn foydalanuvchi?
- **S-06** Platformada to'lov/obuna moduli kerakmi?
