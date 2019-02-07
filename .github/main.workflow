workflow "Tests, docs, etc" {
    on = "push"
    resolves = ["Test", "Docs", "Publish monorepo template"]
}

action "Gatekeeper" {
    uses = "cspotcode/personal-monorepo/.github/workflow-image@master"
    runs = "./.github/main.workflow.sh"
    args = "gatekeeper"
}

action "Bootstrap" {
    needs = "Gatekeeper"
    uses = "cspotcode/personal-monorepo/.github/workflow-image@master"
    runs = "./.github/main.workflow.sh"
    args = "bootstrap"
}

action "Build" {
    needs = "Bootstrap"
    uses = "cspotcode/personal-monorepo/.github/workflow-image@master"
    runs = "./.github/main.workflow.sh"
    args = "build"
}

action "Test" {
    needs = "Build"
    uses = "cspotcode/personal-monorepo/.github/workflow-image@master"
    runs = "./.github/main.workflow.sh"
    args = "test"
}

action "Docs" {
    needs = "Build"
    uses = "cspotcode/personal-monorepo/.github/workflow-image@master"
    runs = "./.github/main.workflow.sh"
    args = "docs"
}

action "Publish monorepo template" {
    needs = "Bootstrap"
    uses = "cspotcode/personal-monorepo/.github/workflow-image@master"
    runs = "./.github/main.workflow.sh"
    args = "publish-monorepo-template"
    secrets = ["GITHUB_TOKEN"]
}
