workflow "Tests, docs, etc" {
    on = "push"
    resolves = ["Test", "Docs"]
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
