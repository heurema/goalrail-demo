# TrialOps Demo — Presenter Notes (RU)

## 1. Цель демо

- Для русскоязычной аудитории открывать интерфейс сразу на `/ru`, чтобы не переключаться в процессе:
  `http://127.0.0.1:5173/ru`
- Показать не “AI написал код”, а управляемый Goalrail-style flow:
  `business request -> clarification -> working contract -> bounded task plan -> implementation/preview -> inspectable proof -> pilot CTA`
- Показать проблему и решение в одном запуске через переключатель workflow profile.
- Подвести к bounded pilot, а не к обещанию “полной автоматизации”.

## 2. Что это демо НЕ обещает

- Это не production Goalrail platform.
- Это не live AI coding show.
- Это не generic workflow engine.
- Это не enterprise governance system.
- Это не self-serve SaaS.

Короткая фраза:

> “Это deterministic sandbox, который показывает управляемый путь от change request к proof.”

## 3. Быстрый сюжет

### Шаг 1 — framing

Что говорить:
- “Сейчас покажу не автопилот и не платформу, а понятный before/after workflow slice.”
- “TrialOps — маленький internal tool, специально подходящий для такой демонстрации.”

### Шаг 2 — before-state

Что показать:
- top-bar switcher в режиме **Baseline**
- language switch / URL `/ru`
- `qualified` request
- warning про direct approval
- кнопку `Approve trial`

Что говорить:
- “Вот baseline weakness: direct approval possible.”
- “Это и есть before-state, который бизнес хочет поменять.”
- “Я здесь специально не нажимаю approve — мне важно сначала показать сам дефект процесса.”

### Шаг 3 — Goalrail flow

Что показать:
- `Goalrail flow`
- шесть артефактных вкладок прямо внутри UI
- buyer-facing callout и чистую структуру change package

Что говорить:
- “Мы продаём не магию, а operating flow: сначала понятный request, потом clarification, contract, tasks, proof, readout.”

### Шаг 4 — after-state

Что показать:
- переключение в **Review-gated flow**
- banner про review gate
- `Send to manual review`
- `Manual review` status/count/filter

Что говорить:
- “Теперь approval заблокирован до manual review.”
- “После review решение должно быть inspectable.”
- “Сначала фиксируем, что request действительно попал в manual review, и только потом завершаем approval.”

### Шаг 5 — review decision

Что показать:
- reviewer actor
- owner
- reason
- `Approve after review`

Что говорить:
- “Approval теперь не shortcut, а review decision с actor, owner и reason.”

### Шаг 6 — proof

Что показать:
- вкладку `Proof`
- `Current evidence`
- вкладку `Pilot readout`

Что говорить:
- “Ценность здесь не только в change itself, а в том, что change заканчивается проверяемым proof и честным readout прямо в интерфейсе.”

### Шаг 7 — CTA

Короткая фраза:

> “One team, one repo, one case, one visible flow to proof.”

Опционально:

> “Если ваш delivery pain похож на это, следующий шаг — bounded pilot, не broad rollout.”

## 4. Где сделать акцент

- baseline warning: direct approval enabled
- visible manual review step
- actor / owner / reason in audit evidence
- in-app Goalrail flow как единый buyer-facing cockpit для request → proof → readout

## 5. Чего избегать

Не говорить:
- “AI всё сделал автоматически.”
- “Это уже production-ready система.”
- “Сейчас мы строим универсальный workflow engine.”

Говорить:
- “Это bounded slice.”
- “Это demo sandbox.”
- “Это inspectable proof-driven flow.”

## 6. Fallback

Если что-то идёт шумно:
- не импровизировать новые фичи
- оставить UI как есть
- открыть Goalrail flow
- markdown открывать только как fallback

Фраза:

> “Даже без live automation здесь видна ключевая ценность: bounded path от change request к proof.”

## 7. Быстрые reminders

- Держать историю узкой.
- Не перегружать audience деталями implementation.
- Показывать before/after контраст.
- Закрывать разговор pilot CTA, а не платформой.
- В обычном golden path не выходить из браузера.
- Не показывать backstage-подсказки в UI; они должны оставаться только в docs.

## 8. Fallback ports

Если дефолтные порты заняты:

```bash
npm run reset
API_PORT=4411 WEB_PORT=5174 npm run dev
```

- Default Web: `http://127.0.0.1:5173`
- Fallback Web: `http://127.0.0.1:5174`
- Russian Web: `http://127.0.0.1:5173/ru`
- Russian fallback Web: `http://127.0.0.1:5174/ru`
