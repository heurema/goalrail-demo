import type { AppLocale } from "./locale.js";

export type DemoArtifactStatus =
  | "prepared"
  | "clarified"
  | "bounded"
  | "proof-ready"
  | "decision-ready";

export type DemoArtifactKind =
  | "business_request"
  | "clarification"
  | "contract"
  | "task_plan"
  | "proof"
  | "readout";

export interface DemoArtifactSection {
  title: string;
  body?: string;
  bullets?: string[];
  callout?: string;
}

export interface DemoArtifactTable {
  title: string;
  columns: string[];
  rows: string[][];
}

export interface DemoArtifactCard {
  title: string;
  subtitle?: string;
  bullets?: string[];
  meta?: Array<{
    label: string;
    value: string;
  }>;
}

export interface DemoArtifact {
  id: DemoArtifactKind;
  navLabel: string;
  title: string;
  subtitle: string;
  status: DemoArtifactStatus;
  callout: {
    label: string;
    text: string;
  };
  sections: DemoArtifactSection[];
  tables?: DemoArtifactTable[];
  cards?: DemoArtifactCard[];
}

export const demoArtifactOrder: DemoArtifactKind[] = [
  "business_request",
  "clarification",
  "contract",
  "task_plan",
  "proof",
  "readout"
];

const demoArtifactsByLocale: Record<AppLocale, DemoArtifact[]> = {
  en: [
    {
      id: "business_request",
      navLabel: "Business request",
      title: "Business request",
      subtitle:
        "The workflow change starts as a clear commercial request, not as platform redesign.",
      status: "prepared",
      callout: {
        label: "Why it matters",
        text: "Approval already has commercial impact, but workflow control is still too weak."
      },
      sections: [
        {
          title: "Raw request",
          callout:
            "Before a trial request can be approved, we need a manual review step. The reviewer must assign an owner and provide a decision reason. The dashboard should reflect the new status, and the audit log should show who made the decision."
        },
        {
          title: "Request context",
          bullets: [
            "Requested by: Head of Revenue Operations",
            "System: TrialOps demo sandbox",
            "Current state: direct approval is allowed"
          ]
        },
        {
          title: "Why it matters",
          bullets: [
            "approval is too easy for a commercially meaningful process",
            "unowned approvals create onboarding confusion",
            "missing decision reasons weaken auditability",
            "dashboard should reflect review load"
          ]
        },
        {
          title: "Ambiguities to clarify",
          bullets: [
            "who performs the review?",
            "is review required for all requests?",
            "when is owner assignment required?",
            "when is reason required?",
            "what should the audit log show?"
          ]
        }
      ]
    },
    {
      id: "clarification",
      navLabel: "Clarification",
      title: "Clarification",
      subtitle:
        "The demo stays believable because the request is clarified before implementation starts.",
      status: "clarified",
      callout: {
        label: "Key point",
        text: "Ambiguity is resolved before implementation starts."
      },
      sections: [
        {
          title: "Workflow",
          bullets: [
            "Every approval goes through review in this first demo version.",
            "Review is a dedicated holding state before approval."
          ]
        },
        {
          title: "Roles / ownership",
          bullets: [
            "No role system in this demo; only a visible reviewer actor.",
            "Owner is mandatory at review decision time."
          ]
        },
        {
          title: "Validation",
          bullets: [
            "Reason is mandatory for review approval and rejection.",
            "No other lifecycle redesign is included in this first slice."
          ]
        },
        {
          title: "Audit / proof",
          bullets: [
            "Audit must show actor, from status, to status, assigned owner, reason, and timestamp.",
            "Proof must be visible in UI behavior, smoke checks, dashboard changes, and audit evidence."
          ]
        },
        {
          title: "Rollout risk",
          bullets: [
            "Out of scope: permissions, notifications, policy profiles.",
            "Frame the change as a bounded pilot slice, not as a workflow engine."
          ]
        }
      ]
    },
    {
      id: "contract",
      navLabel: "Working contract",
      title: "Working contract",
      subtitle:
        "The contract makes scope, proof, and non-goals explicit before changing runtime behavior.",
      status: "bounded",
      callout: {
        label: "Decision boundary",
        text: "This slice changes the review flow, not the whole workflow engine."
      },
      sections: [
        {
          title: "Goal",
          callout:
            "Approval is no longer a direct action; it must pass through manual review."
        },
        {
          title: "In scope",
          bullets: [
            "manual review status",
            "owner requirement",
            "decision reason requirement",
            "dashboard count",
            "audit evidence",
            "smoke/proof update"
          ]
        },
        {
          title: "Out of scope",
          bullets: [
            "auth/permissions",
            "notifications",
            "policy profiles",
            "generic workflow engine",
            "database migration"
          ]
        },
        {
          title: "Acceptance criteria",
          bullets: [
            "direct approval blocked in Goalrail mode",
            "review decisions require owner/reason",
            "dashboard shows manual review",
            "audit captures who/why",
            "reset + smoke deterministic"
          ]
        },
        {
          title: "Proof expectations",
          bullets: ["UI behavior", "smoke checks", "audit evidence", "short readout"]
        }
      ]
    },
    {
      id: "task_plan",
      navLabel: "Task plan",
      title: "Bounded task plan",
      subtitle:
        "Execution is decomposed into a few bounded tasks rather than a broad architecture rewrite.",
      status: "bounded",
      callout: {
        label: "Execution shape",
        text: "The work is split into four bounded tasks instead of one vague request."
      },
      sections: [
        {
          title: "Plan intent",
          body:
            "Implement the workflow-change slice without expanding TrialOps into auth, storage redesign, or a generic workflow framework."
        }
      ],
      cards: [
        {
          title: "WF-01 — Status model and fixtures",
          bullets: [
            "Scope: add `manual_review` to shared types and deterministic runtime expectations.",
            "Acceptance: reset still restores the baseline-friendly seed and counts.",
            "Risk: status model changes touch every visible surface."
          ]
        },
        {
          title: "WF-02 — API validation and transitions",
          bullets: [
            "Scope: block direct approval in Goalrail mode and validate owner plus reason.",
            "Acceptance: review-required / owner-required / reason-required paths are explicit.",
            "Risk: broken transition logic would collapse the whole demo narrative."
          ]
        },
        {
          title: "WF-03 — Frontend controls and dashboard",
          bullets: [
            "Scope: expose mode toggle, manual review controls, counts, filters, and audit visibility.",
            "Acceptance: the before/after workflow change is visible in one running app.",
            "Risk: UI noise would hide the workflow change instead of clarifying it."
          ]
        },
        {
          title: "WF-04 — Smoke, proof, and rollout guidance",
          bullets: [
            "Scope: extend smoke, proof, readout, and demo guidance to match the implemented slice.",
            "Acceptance: checks stay deterministic and the proof story stays explicit during the demo.",
            "Risk: weak artifacts would make the change look unverified."
          ]
        }
      ]
    },
    {
      id: "proof",
      navLabel: "Proof",
      title: "Inspectable proof",
      subtitle:
        "The proof compresses what changed, what passed, and what the selected request now proves live.",
      status: "proof-ready",
      callout: {
        label: "Acceptance basis",
        text: "The result is accepted on evidence, not on someone saying done."
      },
      sections: [
        {
          title: "What changed",
          bullets: [
            "Goalrail mode adds a manual review gate before approval.",
            "Owner and reason are required for review decisions.",
            "Audit evidence includes actor, owner, reason, and transition."
          ]
        },
        {
          title: "Checks run",
          bullets: [
            "`npm run reset`",
            "`npm run typecheck`",
            "`npm run api:build`",
            "`npm run web:build`",
            "`npm run smoke`",
            "browser dry run"
          ]
        },
        {
          title: "Before / after",
          bullets: [
            "before: a qualified request could be directly approved",
            "after: a qualified request must pass through manual review"
          ]
        },
        {
          title: "Final verdict",
          callout: "accept"
        }
      ],
      tables: [
        {
          title: "Acceptance criteria",
          columns: ["Criterion", "Result", "Evidence"],
          rows: [
            [
              "Direct approval blocked in Goalrail mode",
              "pass",
              "Goalrail transition guard returns `review_required`."
            ],
            [
              "Manual review state exists",
              "pass",
              "Shared types, API, filters, chips, and counts include `manual_review`."
            ],
            [
              "Owner required before approval",
              "pass",
              "`owner_required` blocks review approval without an owner."
            ],
            [
              "Decision reason required",
              "pass",
              "`reason_required` blocks review approval without a reason."
            ],
            [
              "Dashboard reflects manual review",
              "pass",
              "Metrics and filters show `Manual review = 1` before final approval."
            ],
            [
              "Audit log captures actor/reason/owner",
              "pass",
              "Audit events include actor, owner, reason, from/to, and timestamp."
            ],
            [
              "Reset + smoke deterministic",
              "pass",
              "Reset restores baseline mode and smoke self-resets after mutations."
            ]
          ]
        }
      ]
    },
    {
      id: "readout",
      navLabel: "Readout",
      title: "Pilot readout",
      subtitle:
        "The readout closes the demo with an honest recommendation instead of a platform overclaim.",
      status: "decision-ready",
      callout: {
        label: "Pilot decision",
        text: "Expand, stabilize, or stop based on visible evidence from one bounded slice."
      },
      sections: [
        {
          title: "Summary",
          callout:
            "The workflow-change slice demonstrates how a vague business request becomes a bounded, reviewable, proof-backed change."
        },
        {
          title: "What worked",
          bullets: [
            "visible before/after",
            "review gate is observable",
            "proof evidence is inspectable",
            "no platform overclaim"
          ]
        },
        {
          title: "What remains out of scope",
          bullets: [
            "auth",
            "permissions",
            "notifications",
            "policy profiles",
            "generic workflow engine"
          ]
        },
        {
          title: "Rollout recommendation",
          callout:
            "Suitable for a bounded pilot readout. Expand only after a real team confirms the contract/proof flow is useful on a real repo case."
        }
      ],
      cards: [
        {
          title: "Expand",
          bullets: [
            "Reuse the same flow on one real repo case with one team.",
            "Only add the next slice after this review-gated story lands clearly."
          ]
        },
        {
          title: "Stabilize and retry",
          bullets: [
            "Tighten copy, reduce clicks, and rehearse the same story until it feels automatic.",
            "Keep the demo bounded instead of adding more surfaces."
          ]
        },
        {
          title: "Stop",
          bullets: [
            "Do not broaden into a platform if the audience does not value the contract/proof flow.",
            "Keep the sandbox narrow rather than inventing automation theatrics."
          ]
        }
      ]
    }
  ],
  ru: [
    {
      id: "business_request",
      navLabel: "Запрос",
      title: "Бизнес-запрос",
      subtitle:
        "Workflow change начинается как понятный коммерческий запрос, а не как platform redesign.",
      status: "prepared",
      callout: {
        label: "Почему это важно",
        text: "Одобрение уже влияет на коммерчески значимый процесс, но workflow-control всё ещё слишком слабый."
      },
      sections: [
        {
          title: "Исходный запрос",
          callout:
            "Перед тем как trial-заявка может быть одобрена, нужен шаг manual review. Reviewer должен назначить owner и указать decision reason. Dashboard должен отражать новый статус, а audit log — показывать, кто принял решение."
        },
        {
          title: "Контекст запроса",
          bullets: [
            "Requested by: Head of Revenue Operations",
            "System: TrialOps demo sandbox",
            "Current state: direct approval is allowed"
          ]
        },
        {
          title: "Почему это важно",
          bullets: [
            "approval слишком лёгок для коммерчески значимого процесса",
            "одобрения без owner создают путаницу при onboarding",
            "отсутствие decision reason ослабляет auditability",
            "dashboard должен показывать review load"
          ]
        },
        {
          title: "Что нужно прояснить",
          bullets: [
            "кто выполняет review?",
            "review нужен для всех заявок или только для части?",
            "когда owner становится обязательным?",
            "когда reason становится обязательным?",
            "что именно должен показывать audit log?"
          ]
        }
      ]
    },
    {
      id: "clarification",
      navLabel: "Уточнение",
      title: "Уточнение",
      subtitle:
        "Демо остаётся убедительным, потому что запрос явно уточняется до implementation.",
      status: "clarified",
      callout: {
        label: "Ключевая мысль",
        text: "Неопределённость снимается до начала implementation."
      },
      sections: [
        {
          title: "Workflow",
          bullets: [
            "В первой demo-версии каждый approval проходит через review.",
            "Review — это отдельное holding state перед approval."
          ]
        },
        {
          title: "Роли / ownership",
          bullets: [
            "Role system в этом демо нет; нужен только видимый reviewer actor.",
            "Owner обязателен в момент review decision."
          ]
        },
        {
          title: "Validation",
          bullets: [
            "Reason обязателен и для review approval, и для review rejection.",
            "Никакой другой lifecycle redesign в первый slice не входит."
          ]
        },
        {
          title: "Audit / proof",
          bullets: [
            "Audit должен показывать actor, from status, to status, assigned owner, reason и timestamp.",
            "Proof должен быть виден в UI behavior, smoke checks, dashboard changes и audit evidence."
          ]
        },
        {
          title: "Rollout risk",
          bullets: [
            "Out of scope: permissions, notifications, policy profiles.",
            "Изменение нужно подавать как bounded pilot slice, а не как workflow engine."
          ]
        }
      ]
    },
    {
      id: "contract",
      navLabel: "Контракт",
      title: "Рабочий контракт",
      subtitle:
        "Контракт заранее фиксирует scope, proof и non-goals до изменения runtime behavior.",
      status: "bounded",
      callout: {
        label: "Граница решения",
        text: "Этот slice меняет review flow, а не весь workflow engine."
      },
      sections: [
        {
          title: "Цель",
          callout:
            "Approval больше не является прямым действием; он обязан пройти через manual review."
        },
        {
          title: "In scope",
          bullets: [
            "статус manual review",
            "требование owner",
            "требование decision reason",
            "dashboard count",
            "audit evidence",
            "обновление smoke/proof"
          ]
        },
        {
          title: "Out of scope",
          bullets: [
            "auth/permissions",
            "notifications",
            "policy profiles",
            "generic workflow engine",
            "database migration"
          ]
        },
        {
          title: "Acceptance criteria",
          bullets: [
            "direct approval блокируется в режиме Goalrail",
            "review decisions требуют owner/reason",
            "dashboard показывает manual review",
            "audit фиксирует кто/почему",
            "reset + smoke остаются детерминированными"
          ]
        },
        {
          title: "Proof expectations",
          bullets: ["UI behavior", "smoke checks", "audit evidence", "короткий readout"]
        }
      ]
    },
    {
      id: "task_plan",
      navLabel: "План задач",
      title: "Ограниченный план задач",
      subtitle:
        "Execution разложен на несколько bounded tasks, а не на широкий architecture rewrite.",
      status: "bounded",
      callout: {
        label: "Форма исполнения",
        text: "Работа разбита на четыре bounded task вместо одного расплывчатого запроса."
      },
      sections: [
        {
          title: "Замысел плана",
          body:
            "Нужно реализовать workflow-change slice без расширения TrialOps в auth, storage redesign или generic workflow framework."
        }
      ],
      cards: [
        {
          title: "WF-01 — Статусная модель и fixtures",
          bullets: [
            "Scope: добавить `manual_review` в shared types и deterministic runtime expectations.",
            "Acceptance: reset по-прежнему возвращает baseline-friendly seed и counts.",
            "Risk: изменения статусной модели касаются всех видимых поверхностей."
          ]
        },
        {
          title: "WF-02 — API validation и transitions",
          bullets: [
            "Scope: блокировать direct approval в Goalrail mode и валидировать owner плюс reason.",
            "Acceptance: пути review_required / owner_required / reason_required видны явно.",
            "Risk: сломанная transition logic разрушит весь demo narrative."
          ]
        },
        {
          title: "WF-03 — Frontend controls и dashboard",
          bullets: [
            "Scope: показать mode toggle, manual review controls, counts, filters и audit visibility.",
            "Acceptance: before/after изменение workflow видно в одном запущенном приложении.",
            "Risk: UI noise скроет workflow change вместо того, чтобы сделать его очевидным."
          ]
        },
        {
          title: "WF-04 — Smoke, proof и guidance",
          bullets: [
            "Scope: расширить smoke, proof, readout и demo guidance под реализованный slice.",
            "Acceptance: checks остаются детерминированными, а proof story остаётся явной во время демо.",
            "Risk: слабые артефакты сделают change неподтверждённым."
          ]
        }
      ]
    },
    {
      id: "proof",
      navLabel: "Proof",
      title: "Проверяемый proof",
      subtitle:
        "Proof сжимает в один экран: что изменилось, что прошло, и что живая заявка доказывает прямо сейчас.",
      status: "proof-ready",
      callout: {
        label: "Основание приёмки",
        text: "Результат принимается по evidence, а не по словам «done»."
      },
      sections: [
        {
          title: "Что изменилось",
          bullets: [
            "Режим Goalrail добавляет manual review gate перед approval.",
            "Owner и reason обязательны для review decisions.",
            "Audit evidence включает actor, owner, reason и сам transition."
          ]
        },
        {
          title: "Запущенные проверки",
          bullets: [
            "`npm run reset`",
            "`npm run typecheck`",
            "`npm run api:build`",
            "`npm run web:build`",
            "`npm run smoke`",
            "browser dry run"
          ]
        },
        {
          title: "До / после",
          bullets: [
            "до: qualified request можно было одобрить напрямую",
            "после: qualified request обязан пройти через manual review"
          ]
        },
        {
          title: "Финальный вердикт",
          callout: "accept"
        }
      ],
      tables: [
        {
          title: "Acceptance criteria",
          columns: ["Критерий", "Результат", "Evidence"],
          rows: [
            [
              "Direct approval блокируется в режиме Goalrail",
              "pass",
              "Goalrail guard возвращает `review_required`."
            ],
            [
              "Состояние manual review существует",
              "pass",
              "Shared types, API, filters, chips и counts включают `manual_review`."
            ],
            [
              "Owner обязателен перед approval",
              "pass",
              "`owner_required` блокирует review approval без owner."
            ],
            [
              "Decision reason обязателен",
              "pass",
              "`reason_required` блокирует review approval без reason."
            ],
            [
              "Dashboard отражает manual review",
              "pass",
              "Metrics и filters показывают `Manual review = 1` до финального approval."
            ],
            [
              "Audit log сохраняет actor/reason/owner",
              "pass",
              "Audit events включают actor, owner, reason, from/to и timestamp."
            ],
            [
              "Reset + smoke детерминированы",
              "pass",
              "Reset возвращает baseline mode, а smoke сам себя сбрасывает после мутаций."
            ]
          ]
        }
      ]
    },
    {
      id: "readout",
      navLabel: "Readout",
      title: "Pilot readout",
      subtitle:
        "Readout завершает демо честной рекомендацией, а не platform overclaim.",
      status: "decision-ready",
      callout: {
        label: "Решение по пилоту",
        text: "Expand, stabilize или stop принимаются на основе видимого evidence по одному bounded slice."
      },
      sections: [
        {
          title: "Summary",
          callout:
            "Workflow-change slice показывает, как vague business request превращается в bounded, reviewable и proof-backed change."
        },
        {
          title: "Что сработало",
          bullets: [
            "видимый before/after",
            "review gate наблюдаем",
            "proof evidence можно inspect",
            "нет platform overclaim"
          ]
        },
        {
          title: "Что осталось вне scope",
          bullets: [
            "auth",
            "permissions",
            "notifications",
            "policy profiles",
            "generic workflow engine"
          ]
        },
        {
          title: "Рекомендация по rollout",
          callout:
            "Подходит для bounded pilot readout. Расширять стоит только после того, как реальная команда подтвердит полезность contract/proof flow на реальном repo case."
        }
      ],
      cards: [
        {
          title: "Expand",
          bullets: [
            "Повторить тот же flow на одном реальном repo case с одной командой.",
            "Следующий slice добавлять только после того, как история с review gate отработает чисто."
          ]
        },
        {
          title: "Stabilize and retry",
          bullets: [
            "Поджать copy, уменьшить число кликов и отрепетировать тот же сценарий до автоматизма.",
            "Держать демо bounded вместо добавления новых поверхностей."
          ]
        },
        {
          title: "Stop",
          bullets: [
            "Не расширяться в платформу, если аудитория не ценит contract/proof flow.",
            "Оставить sandbox узким вместо изобретения automation theatrics."
          ]
        }
      ]
    }
  ]
};

export const getDemoArtifacts = (locale: AppLocale): DemoArtifact[] =>
  demoArtifactsByLocale[locale];
