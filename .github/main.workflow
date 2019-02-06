workflow "Run Tests" {
  on = "push"
  resolves = ["Run arbitrary commands"]
}

action "Run arbitrary commands" {
  uses = "actions/npm@master"
  runs = "./scripts/npm-scripts.sh"
  args = ["exit", "78"]
}
