workflow "Run Tests" {
    on = "push"
    resolves = ["Final"]
}

action "Run Before" {
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["echo", "hello world"]
}
action "Run 1" {
    needs = "Run Before"
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["exit", "78"]
}

action "Run 2" {
    needs = "Run Before"
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
