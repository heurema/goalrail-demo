export type DemoArtifactStep = {
  id: string;
  title: string;
  summary: string;
  artifactPath: string;
  statusLabel: "prepared" | "bounded" | "proof-ready";
};

export const demoArtifactSteps: DemoArtifactStep[] = [
  {
    id: "business-request",
    title: "Business request",
    summary:
      "The live-demo change starts as a business request: direct approval is no longer acceptable and review evidence must be visible.",
    artifactPath: "demo/proof-packs/workflow-change/business-request.md",
    statusLabel: "prepared"
  },
  {
    id: "clarification",
    title: "Clarification",
    summary:
      "Open questions are bounded before implementation so the presenter can show why the slice is small, explicit, and testable.",
    artifactPath: "demo/proof-packs/workflow-change/clarification-questions.md",
    statusLabel: "prepared"
  },
  {
    id: "contract",
    title: "Working contract",
    summary:
      "Scope, non-goals, acceptance criteria, and proof expectations are made explicit before anyone starts changing runtime behavior.",
    artifactPath: "demo/proof-packs/workflow-change/contract-draft.md",
    statusLabel: "bounded"
  },
  {
    id: "task-plan",
    title: "Bounded task plan",
    summary:
      "The slice is decomposed into a few concrete backend, frontend, smoke, and docs changes instead of a generic workflow-engine rewrite.",
    artifactPath: "demo/proof-packs/workflow-change/task-plan.md",
    statusLabel: "bounded"
  },
  {
    id: "proof",
    title: "Inspectable proof",
    summary:
      "A filled proof artifact captures what changed, what was checked, and why the demo slice is acceptable as sandbox evidence.",
    artifactPath: "demo/proof-packs/workflow-change/proof-sample.md",
    statusLabel: "proof-ready"
  },
  {
    id: "readout",
    title: "Pilot readout",
    summary:
      "The readout closes the loop with rollout guidance, bounded next options, and an honest recommendation for a pilot CTA.",
    artifactPath: "demo/proof-packs/workflow-change/readout-sample.md",
    statusLabel: "proof-ready"
  }
];
