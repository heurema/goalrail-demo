# TrialOps Demo — Presenter Notes (RU)

## 1. Цель демо

- Показать не “AI написал код”, а управляемый pilot-style flow:
  `business request -> clarification -> contract -> task plan -> proof`
- Показать, что даже маленький change request можно быстро перевести из vague business языка в bounded delivery slice.
- Подвести к managed pilot, а не к обещанию “полной автоматизации”.

## 2. Что это демо НЕ обещает

- Это не готовый Goalrail product.
- Это не публичный self-serve AI demo.
- Это не live guarantee, что любой запрос будет автоматически реализован.
- Это не production-ready platform claim.

Короткая формулировка:

> “Это demo sandbox для pilot-style flow, а не готовая платформа.”

## 3. Структура показа на 12–15 минут

### 0:00–1:00 — framing

Что открыть:
- UI: `http://127.0.0.1:5173`

Что говорить:
- “Сейчас покажу не платформу и не автопилот, а понятный flow: от бизнес-запроса к bounded task plan и proof.”
- “Это маленький internal tool, специально выбранный так, чтобы бизнес-изменение было читаемо.”

### 1:00–3:00 — baseline app

Что показать:
- dashboard counts
- request list
- detail panel
- audit log

Что говорить:
- “Это TrialOps, небольшой internal tool для обработки trial requests.”
- “Он уже работает, но workflow здесь специально простой.”

### 3:00–5:00 — baseline weakness

Что показать:
- выбрать заявку
- открыть detail
- показать status update form
- показать, что можно сразу поставить `approved`

Что говорить:
- “Сейчас видно слабое место baseline-flow: заявку можно сразу approve.”
- “Для части команд это уже риск: нет review step, нет owner assignment requirement, нет decision reason as policy.”

Главная мысль:

> “Нам нужен понятный before-state, чтобы change request был очевиден.”

### 5:00–7:00 — business request

Что открыть:
- `demo/proof-packs/workflow-change/business-request.md`

Что говорить:
- “Теперь приходит нормальный business request: перед approval нужен manual review.”
- “Важно не прыгать сразу в код, а сначала снять неоднозначность.”

Короткая формулировка:

> “Approval больше не должен быть прямым действием. Нужен review, owner и reason.”

### 7:00–9:00 — clarification

Что открыть:
- `demo/proof-packs/workflow-change/clarification-questions.md`

Что говорить:
- “Первое действие здесь — clarification, а не implementation.”
- “В демо у нас есть recommended answers, чтобы не расползаться по scope.”

На что сделать акцент:
- workflow
- роли и ownership
- validation
- audit / proof
- rollout risk

### 9:00–11:00 — contract draft

Что открыть:
- `demo/proof-packs/workflow-change/contract-draft.md`

Что говорить:
- “Дальше change фиксируется как рабочий contract draft.”
- “Здесь важны scope, non-goals, acceptance criteria и expected proof.”

Что подчеркнуть:
- in scope
- out of scope
- acceptance criteria
- proof expectations

### 11:00–13:00 — bounded task plan + proof

Что открыть:
- `demo/proof-packs/workflow-change/task-plan.md`
- `demo/proof-packs/workflow-change/proof-template.md`
- `demo/proof-packs/workflow-change/readout-template.md`

Что говорить:
- “Теперь это не vague request, а bounded delivery slice.”
- “Важно не просто изменить код, а закончить проверяемым proof pack.”

Главная формулировка:

> “Мы продаём не магию, а управляемый путь от change request к inspectable proof.”

### 13:00–15:00 — close / CTA

Что говорить:
- “Если ваш типовой delivery pain похож на это, следующий шаг — не большая трансформация, а bounded pilot.”
- “Обычно мы начинаем с free qualification, а затем предлагаем paid pilot от $5,000.”
- “Формат пилота простой: one team, one repo, one case, one visible flow to proof.”

## 4. Где сделать паузы

- После показа baseline UI — дать аудитории самой увидеть, что direct approval действительно возможен.
- После business request — короткая пауза, чтобы зафиксировать: это бизнес-язык, а не технический diff.
- После contract draft — короткая пауза на acceptance criteria.
- Перед CTA — пауза на вопрос: “Похоже ли это на ваш реальный delivery pattern?”

## 5. Как объяснить ценность

Не говорить:
- “AI сам всё сделает.”
- “Это заменит engineering management.”
- “Это готовая enterprise platform.”

Говорить:
- “Смысл в том, чтобы сократить путь от vague request к bounded change.”
- “Смысл в прозрачности: scope, tasks, proof и readout видны заранее.”
- “Для пилота важна не полнота автоматизации, а надёжный visible flow.”

## 6. Fallback

### Если live AI / GLR недоступен

- не пытаться импровизировать live generation
- оставить UI как before-state
- перейти на prepared proof pack

Фраза:

> “Здесь важна не зависимость от live AI-call, а форма operating flow. Поэтому у нас заранее подготовлены bounded artifacts.”

### Если UI не открывается

- показать `docs/demo/DEMO_SHOW_SCRIPT.md`
- показать `business-request.md`
- показать `clarification-questions.md`
- показать `contract-draft.md`
- показать `task-plan.md`
- показать `proof-template.md`

Фраза:

> “Даже без живого UI можно показать core value: как запрос превращается в проверяемый pilot slice.”

### Если времени мало

Сокращённый маршрут:
1. baseline weakness
2. business request
3. contract draft
4. task plan
5. proof template
6. CTA

## 7. Быстрые presenter reminders

- Держать историю узкой и понятной.
- Не добавлять новые требования на ходу.
- Не обещать, что `manual review` уже реализован.
- Напоминать, что это before-state + proof-driven demo layer.
- Закрывать разговор пилотом, а не “давайте сразу строить платформу”.
