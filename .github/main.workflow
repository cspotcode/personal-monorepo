workflow "Tests, docs, etc" {
    on = "push"
    resolves = ["Test", "Docs", "Publish monorepo template"]
}

action "Gatekeeper" {
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "gatekeeper"
}

action "No-op 1" {
    needs = "Gatekeeper"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "exit 0"
}

action "No-op 2" {
    needs = "No-op 1"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "exit 0"
}

action "Bootstrap" {
    needs = "No-op 2"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "bootstrap"
}

action "Build" {
    needs = "Bootstrap"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "build"
}

action "Test" {
    needs = "Build"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "test"
}

action "Docs" {
    needs = "Build"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "docs"
}

action "Publish monorepo template" {
    needs = "Bootstrap"
    uses = "./.github/workflow-image"
    runs = "./.github/main.workflow.sh"
    args = "publish-monorepo-template"
    secrets = ["GITHUB_TOKEN"]
}
