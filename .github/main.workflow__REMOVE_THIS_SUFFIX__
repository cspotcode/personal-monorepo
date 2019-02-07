workflow "Tests, docs, etc" {
    on = "push"
    resolves = ["Test", "Docs", "Publish monorepo template"]
}

action "Gatekeeper" {
    uses = "actions/npm@master"
    runs = "./.github/main.workflow.sh"
    args = "gatekeeper"
}

action "Build" {
    needs = "Gatekeeper"
    uses = "actions/npm@master"
    runs = "./.github/main.workflow.sh"
    args = "build"
}

action "Test" {
    needs = "Build"
    uses = "actions/npm@master"
    runs = "./.github/main.workflow.sh"
    args = "test"
}

action "Docs" {
    needs = "Build"
    uses = "actions/npm@master"
    runs = "./.github/main.workflow.sh"
    args = "docs"
}

action "Publish monorepo template" {
    needs = "Gatekeeper"
    uses = "actions/npm@master"
    runs = "./.github/main.workflow.sh"
    args = "publish-monorepo-template"
    secrets = ["GITHUB_TOKEN"]
}
