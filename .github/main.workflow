workflow "Run Tests" {
    on = "push"
    resolves = ["Final"]
}

action "Run 1" {
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["exit", "78"]
}

action "Run 2" {
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["exit", "0"]
}

action "Final" {
    needs = ["Run 1", "Run 2"]
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["exit", "0"]
}
