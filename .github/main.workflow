workflow "Tests, docs, etc" {
    on = "push"
    resolves = ["Final"]
}

action "Run Before" {
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["shell", "touch", "/github/home/foobar"]
}
action "Run 1" {
    needs = "Run Before"
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = "shell ls -al /github/home"
}

action "Run 2" {
    needs = "Run Before"
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = "shell node -p JSON.stringify(require(\"/github/workflow/event.json\"),null,4)"
}

action "Final" {
    needs = ["Run 1", "Run 2"]
    uses = "actions/npm@master"
    runs = "./scripts/npm-scripts.sh"
    args = ["exit", "0"]
}
