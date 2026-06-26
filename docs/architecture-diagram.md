# PRD Phase Kit — Architecture Diagram

Visualizes how an idea transforms into committed code through the PRD Phase Kit workflow.

## Full Workflow Diagram

```mermaid
flowchart TD
    A([💡 Idea]) --> B["/ppk-init-prd\nInterview user\nWrite PRD.md"]
    B --> C[(docs/specs/\nslug/PRD.md)]
    C --> D["/ppk-make-plan\nRead PRD\nBreak into phases"]
    D --> E[(plan.md\nN phases)]
    E --> F["/ppk-start-task\nCreate git branch\nImplement phase"]
    F --> G{Testing Gate\nnpm test}
    G -->|🔴 FAIL| H[Fix code\nRe-run tests]
    H --> G
    G -->|🟢 PASS| I["/ppk-finish-task\nWrite changelog\nCommit + Push + PR"]
    I --> J[(docs/changelog/\nslug/phase-NN.md)]
    I --> K([✅ Phase Merged\nto main])
    K --> L{More phases?}
    L -->|Yes| F
    L -->|No| M([🚀 Feature Complete])
```

## Component Map

```mermaid
graph LR
    subgraph Skills ["skills/ (source of truth)"]
        S1[init-prd/SKILL.md]
        S2[make-plan/SKILL.md]
        S3[start-task/SKILL.md]
        S4[finish-task/SKILL.md]
        S5[status/SKILL.md]
        S6[reset/SKILL.md]
    end

    subgraph Sync ["scripts/sync.js"]
        SY[npm run sync]
    end

    subgraph Artifacts ["Generated Artifacts"]
        direction TB
        G1[commands/*.toml\nGemini]
        G2[plugins/prd-phase-kit/skills/\nClaude · Windsurf · Codex · Cursor]
    end

    subgraph Agents ["AI Agents"]
        A1[Gemini]
        A2[Claude]
        A3[Cursor]
        A4[Windsurf]
        A5[Codex]
    end

    Skills --> Sync --> Artifacts
    G1 --> A1
    G2 --> A2
    G2 --> A3
    G2 --> A4
    G2 --> A5
```

## Data Flow: `/ppk-init-prd`

```mermaid
sequenceDiagram
    participant U as User
    participant A as AI Agent
    participant F as File System

    U->>A: /ppk-init-prd "Build a todo app"
    A->>U: Interview (5–7 batched questions)
    U->>A: Answers
    A->>F: Write docs/specs/todo-app/PRD.md
    A->>U: "PRD ready. Run /ppk-make-plan."
```

## Data Flow: `/ppk-start-task` → `/ppk-finish-task`

```mermaid
sequenceDiagram
    participant U as User
    participant A as AI Agent
    participant G as Git
    participant F as File System

    U->>A: /ppk-start-task phase 2
    A->>G: git checkout -b feat/phase-02-slug
    A->>F: Implement phase tasks
    A->>G: npm test (testing gate)
    G-->>A: ✅ pass
    A->>U: "Phase done. Run /ppk-finish-task."

    U->>A: /ppk-finish-task
    A->>F: Write docs/changelog/slug/phase-02.md
    A->>U: Show changelog + git commands
    U->>A: Confirm
    A->>G: git add . && git commit && git push
    A->>G: gh pr create + merge
```
